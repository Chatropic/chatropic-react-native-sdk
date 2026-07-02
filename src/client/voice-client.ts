import {
  INPUT_SAMPLE_RATE,
  OUTPUT_SAMPLE_RATE,
  base64ToBytes,
  downsampleInt16,
  parseSampleRate,
} from "../audio/pcm";
import { PcmPlaybackQueue } from "../audio/pcm-playback";
import { loadExpoAudio } from "../audio/expo-audio-runtime";
import { getDefaultAgentUrl } from "../config/environment";

export type VoiceAgentState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export interface VoiceTranscriptLine {
  role: "user" | "agent";
  text: string;
  final: boolean;
}

export type VoiceServerMessage =
  | { type: "ready" }
  | { type: "state"; state: VoiceAgentState }
  | { type: "transcript"; role: "user" | "agent"; text: string; final: boolean }
  | { type: "audio"; mime_type: string; data: string }
  | { type: "ui:render"; component: string; props: Record<string, unknown> }
  | {
      type: "event";
      event: string;
      data: Record<string, unknown>;
    }
  | { type: "interrupted" }
  | { type: "turn_complete"; role: "user" | "agent"; text?: string }
  | { type: "error"; code: string; message: string };

export interface VoiceClientCallbacks {
  onState?: (state: VoiceAgentState) => void;
  onTranscript?: (line: VoiceTranscriptLine) => void;
  onUiRender?: (component: string, props: Record<string, unknown>) => void;
  onAgentEvent?: (event: string, data: Record<string, unknown>) => void;
  onTurnComplete?: (text: string) => void;
  onError?: (message: string) => void;
  onReady?: () => void;
}

export interface VoiceConnectOptions {
  publishableKey?: string;
}

function wsBaseUrl(agentUrl: string): string {
  const url = new URL(agentUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.origin;
}

async function fetchVoiceToken(
  agentUrl: string,
  sessionId: string,
  tenantId: string,
  options?: VoiceConnectOptions,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.publishableKey?.trim()) {
    headers.Authorization = `Bearer ${options.publishableKey.trim()}`;
  }
  const base = agentUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/voice/token`, {
    method: "POST",
    headers,
    body: JSON.stringify({ session_id: sessionId, user_id: tenantId }),
  });
  if (!res.ok) {
    let detail = "Could not authorize voice session.";
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Voice token missing from server response.");
  }
  return data.token;
}

export class VoiceClient {
  private ws: WebSocket | null = null;
  private audioStream: {
    start(): Promise<void>;
    stop(): void;
  } | null = null;
  private bufferSub: { remove(): void } | null = null;
  private statusSub: { remove(): void } | null = null;
  private playback = new PcmPlaybackQueue();
  private micPaused = false;
  private closed = false;
  private readyResolve: (() => void) | null = null;
  private agentUrl = getDefaultAgentUrl();

  constructor(private callbacks: VoiceClientCallbacks) {}

  async connect(
    agentUrl: string,
    sessionId: string,
    tenantId: string,
    options?: VoiceConnectOptions,
  ): Promise<void> {
    this.agentUrl = agentUrl;
    this.closed = false;
    this.playback.resetFlush();
    this.callbacks.onState?.("connecting");

    const { requestRecordingPermissionsAsync, setAudioModeAsync } =
      await loadExpoAudio();
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission is required for voice.");
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      interruptionMode: "doNotMix",
      shouldRouteThroughEarpiece: false,
    });

    const token = await fetchVoiceToken(agentUrl, sessionId, tenantId, options);

    const params = new URLSearchParams({
      token,
      session_id: sessionId,
      user_id: tenantId,
    });
    const ws = new WebSocket(`${wsBaseUrl(agentUrl)}/voice/live?${params}`);
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    const readyPromise = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve;
      setTimeout(() => {
        if (this.readyResolve) {
          this.readyResolve = null;
          reject(new Error("Voice agent ready timeout"));
        }
      }, 30000);
    });

    ws.onmessage = (ev) => {
      void this.handleMessage(ev);
    };
    ws.onclose = (ev) => {
      if (!this.closed) {
        if (ev.code === 1011) {
          this.callbacks.onError?.(
            "Voice connection lost. Toggle voice off and on to reconnect.",
          );
          this.callbacks.onState?.("error");
        } else {
          this.callbacks.onState?.("idle");
        }
      }
    };

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Voice connection timed out"));
      }, 15000);
      ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("WebSocket connection failed"));
      };
    });

    await readyPromise;
    this.sendJson({ type: "start" });
    await this.startMic();
  }

  private async handleMessage(ev: { data: string | ArrayBuffer }): Promise<void> {
    if (typeof ev.data === "string") {
      let msg: VoiceServerMessage;
      try {
        msg = JSON.parse(ev.data) as VoiceServerMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case "ready":
          this.readyResolve?.();
          this.readyResolve = null;
          this.callbacks.onReady?.();
          this.callbacks.onState?.("listening");
          break;
        case "state":
          if (msg.state === "speaking" || msg.state === "thinking") {
            this.micPaused = true;
          } else if (msg.state === "listening") {
            this.micPaused = false;
          }
          if (msg.state !== "idle") {
            this.callbacks.onState?.(msg.state);
          }
          if (msg.state === "listening") {
            this.flushPlayback();
          }
          break;
        case "transcript":
          this.callbacks.onTranscript?.({
            role: msg.role,
            text: msg.text,
            final: msg.final,
          });
          break;
        case "ui:render":
          this.callbacks.onUiRender?.(msg.component, msg.props);
          break;
        case "event":
          this.callbacks.onAgentEvent?.(msg.event, msg.data);
          break;
        case "audio":
          this.playPcm(msg.data, msg.mime_type);
          break;
        case "interrupted":
          this.flushPlayback();
          break;
        case "turn_complete":
          this.callbacks.onTurnComplete?.(msg.text ?? "");
          this.callbacks.onState?.("listening");
          break;
        case "error":
          this.callbacks.onError?.(msg.message);
          this.callbacks.onState?.("error");
          break;
      }
      return;
    }

    if (ev.data instanceof ArrayBuffer) {
      this.playPcmBytes(new Uint8Array(ev.data), OUTPUT_SAMPLE_RATE);
    }
  }

  private sendJson(payload: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private micInputOpen(): boolean {
    if (this.micPaused || this.closed || this.ws?.readyState !== WebSocket.OPEN) {
      return false;
    }
    const playbackUntil = this.playback.playbackTime;
    if (playbackUntil > Date.now() / 1000 + 0.05) {
      return false;
    }
    return true;
  }

  private async startMic(): Promise<void> {
    const { AudioModule } = await loadExpoAudio();
    const stream = new AudioModule.AudioStream({
      sampleRate: INPUT_SAMPLE_RATE,
      channels: 1,
      encoding: "int16",
    });
    this.audioStream = stream;

    this.bufferSub = stream.addListener("audioStreamBuffer", (payload) => {
      if (!this.micInputOpen()) return;
      const buffer = payload as {
        data: ArrayBuffer;
        sampleRate: number;
        channels: number;
      };
      const int16 = new Int16Array(buffer.data);
      const downsampled =
        buffer.sampleRate === INPUT_SAMPLE_RATE
          ? int16
          : downsampleInt16(int16, buffer.sampleRate, INPUT_SAMPLE_RATE);
      this.ws?.send(downsampled.buffer);
    });

    this.statusSub = stream.addListener("audioStreamStatus", () => {});
    await stream.start();
  }

  private playPcm(b64: string, mimeType: string): void {
    const bytes = base64ToBytes(b64);
    const rate = parseSampleRate(mimeType, OUTPUT_SAMPLE_RATE);
    this.playPcmBytes(bytes, rate);
  }

  private playPcmBytes(bytes: Uint8Array, sampleRate: number): void {
    this.playback.enqueue(bytes, sampleRate);
  }

  private flushPlayback(): void {
    this.playback.flush();
    this.playback.resetFlush();
  }

  async disconnect(): Promise<void> {
    this.closed = true;
    this.sendJson({ type: "close" });
    this.flushPlayback();
    this.bufferSub?.remove();
    this.statusSub?.remove();
    this.bufferSub = null;
    this.statusSub = null;
    this.audioStream?.stop();
    this.audioStream = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    await this.playback.dispose();
    this.callbacks.onState?.("idle");
  }
}

export async function voiceWsUrl(
  agentUrl: string,
  sessionId: string,
  tenantId: string,
  options?: VoiceConnectOptions,
): Promise<string> {
  const token = await fetchVoiceToken(agentUrl, sessionId, tenantId, options);
  const params = new URLSearchParams({
    token,
    session_id: sessionId,
    user_id: tenantId,
  });
  return `${wsBaseUrl(agentUrl)}/voice/live?${params}`;
}
