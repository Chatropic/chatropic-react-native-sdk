import { INPUT_SAMPLE_RATE, OUTPUT_SAMPLE_RATE, base64ToBytes, downsampleInt16, parseSampleRate, } from "../audio/pcm";
import { PcmPlaybackQueue } from "../audio/pcm-playback";
import { loadExpoAudio } from "../audio/expo-audio-runtime";
import { getDefaultAgentUrl } from "../config/environment";
function wsBaseUrl(agentUrl) {
    const url = new URL(agentUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.origin;
}
async function fetchVoiceToken(agentUrl, sessionId, tenantId, options) {
    const headers = {
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
            const body = (await res.json());
            if (body.detail)
                detail = body.detail;
        }
        catch {
            /* ignore */
        }
        throw new Error(detail);
    }
    const data = (await res.json());
    if (!data.token) {
        throw new Error("Voice token missing from server response.");
    }
    return data.token;
}
export class VoiceClient {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.ws = null;
        this.audioStream = null;
        this.bufferSub = null;
        this.statusSub = null;
        this.playback = new PcmPlaybackQueue();
        this.micPaused = false;
        this.closed = false;
        this.readyResolve = null;
        this.agentUrl = getDefaultAgentUrl();
    }
    async connect(agentUrl, sessionId, tenantId, options) {
        this.agentUrl = agentUrl;
        this.closed = false;
        this.playback.resetFlush();
        this.callbacks.onState?.("connecting");
        const { requestRecordingPermissionsAsync, setAudioModeAsync } = await loadExpoAudio();
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
        const readyPromise = new Promise((resolve, reject) => {
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
                    this.callbacks.onError?.("Voice connection lost. Toggle voice off and on to reconnect.");
                    this.callbacks.onState?.("error");
                }
                else {
                    this.callbacks.onState?.("idle");
                }
            }
        };
        await new Promise((resolve, reject) => {
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
    async handleMessage(ev) {
        if (typeof ev.data === "string") {
            let msg;
            try {
                msg = JSON.parse(ev.data);
            }
            catch {
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
                    }
                    else if (msg.state === "listening") {
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
    sendJson(payload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        }
    }
    micInputOpen() {
        if (this.micPaused || this.closed || this.ws?.readyState !== WebSocket.OPEN) {
            return false;
        }
        const playbackUntil = this.playback.playbackTime;
        if (playbackUntil > Date.now() / 1000 + 0.05) {
            return false;
        }
        return true;
    }
    async startMic() {
        const { AudioModule } = await loadExpoAudio();
        const stream = new AudioModule.AudioStream({
            sampleRate: INPUT_SAMPLE_RATE,
            channels: 1,
            encoding: "int16",
        });
        this.audioStream = stream;
        this.bufferSub = stream.addListener("audioStreamBuffer", (payload) => {
            if (!this.micInputOpen())
                return;
            const buffer = payload;
            const int16 = new Int16Array(buffer.data);
            const downsampled = buffer.sampleRate === INPUT_SAMPLE_RATE
                ? int16
                : downsampleInt16(int16, buffer.sampleRate, INPUT_SAMPLE_RATE);
            this.ws?.send(downsampled.buffer);
        });
        this.statusSub = stream.addListener("audioStreamStatus", () => { });
        await stream.start();
    }
    playPcm(b64, mimeType) {
        const bytes = base64ToBytes(b64);
        const rate = parseSampleRate(mimeType, OUTPUT_SAMPLE_RATE);
        this.playPcmBytes(bytes, rate);
    }
    playPcmBytes(bytes, sampleRate) {
        this.playback.enqueue(bytes, sampleRate);
    }
    flushPlayback() {
        this.playback.flush();
        this.playback.resetFlush();
    }
    async disconnect() {
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
export async function voiceWsUrl(agentUrl, sessionId, tenantId, options) {
    const token = await fetchVoiceToken(agentUrl, sessionId, tenantId, options);
    const params = new URLSearchParams({
        token,
        session_id: sessionId,
        user_id: tenantId,
    });
    return `${wsBaseUrl(agentUrl)}/voice/live?${params}`;
}
