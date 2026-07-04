import {
  OUTPUT_SAMPLE_RATE,
  concatPcm,
  pcm16ToWav,
  bytesToBase64,
} from "./pcm";
import {
  loadExpoAudio,
  loadExpoFileSystem,
  type AudioPlayerLike,
  type AudioStatusLike,
} from "./expo-audio-runtime";

const PLAYBACK_STATUS_UPDATE = "playbackStatusUpdate";
const MIN_BATCH_MS = 180;
const TAIL_FLUSH_MS = 140;
/** Merge queued PCM into fewer WAV files to avoid player.replace() gaps. */
const MAX_MERGE_MS = 600;
/**
 * Escape hatch for a player that never reports didJustFinish. Must be
 * generous: firing early truncates the clip tail when file write/load
 * latency delays the actual playback start.
 */
const STUCK_PLAYER_GRACE_MS = 1500;

type PcmChunk = {
  pcm: Uint8Array;
  sampleRate: number;
};

type PlaybackJob = {
  uri: string;
  durationSec: number;
};

export class PcmPlaybackQueue {
  private player: AudioPlayerLike | null = null;
  private statusSub: { remove(): void } | null = null;
  private queue: PcmChunk[] = [];
  private pendingChunks: Uint8Array[] = [];
  private pendingBytes = 0;
  private pendingSampleRate = OUTPUT_SAMPLE_RATE;
  private playing = false;
  private pumping = false;
  private flushed = false;
  private fileCounter = 0;
  private playbackEndSec = 0;
  private tailFlushTimer: ReturnType<typeof setTimeout> | null = null;
  private runtimeReady: Promise<void> | null = null;

  get isPlaying(): boolean {
    return (
      this.playing ||
      this.queue.length > 0 ||
      this.pendingBytes > 0 ||
      this.pumping
    );
  }

  /** Absolute wall-clock time (seconds) when scheduled playback ends. */
  get playbackTime(): number {
    if (!this.isPlaying) return 0;
    return Math.max(this.playbackEndSec, Date.now() / 1000);
  }

  private ensureRuntime(): Promise<void> {
    if (!this.runtimeReady) {
      this.runtimeReady = loadExpoAudio().then(() => undefined);
    }
    return this.runtimeReady;
  }

  enqueue(bytes: Uint8Array, sampleRate = OUTPUT_SAMPLE_RATE): void {
    if (this.flushed || bytes.byteLength < 2) return;

    this.pendingSampleRate = sampleRate;
    this.pendingChunks.push(bytes);
    this.pendingBytes += bytes.byteLength;

    const minBatchBytes = Math.max(
      2,
      Math.floor(sampleRate * 2 * (MIN_BATCH_MS / 1000)),
    );
    if (this.pendingBytes >= minBatchBytes) {
      void this.commitPendingBatch();
      return;
    }

    this.scheduleTailFlush();
    void this.pump();
  }

  flush(): void {
    this.flushed = true;
    this.clearTailFlush();
    this.queue = [];
    this.pendingChunks = [];
    this.pendingBytes = 0;
    this.playing = false;
    this.pumping = false;
    this.playbackEndSec = 0;
    this.statusSub?.remove();
    this.statusSub = null;
    try {
      this.player?.pause();
    } catch {
      /* ignore */
    }
  }

  resetFlush(): void {
    this.flushed = false;
  }

  async dispose(): Promise<void> {
    this.flush();
    this.statusSub?.remove();
    this.statusSub = null;
    try {
      this.player?.remove();
    } catch {
      /* ignore */
    }
    this.player = null;
  }

  private clearTailFlush(): void {
    if (this.tailFlushTimer) {
      clearTimeout(this.tailFlushTimer);
      this.tailFlushTimer = null;
    }
  }

  private scheduleTailFlush(): void {
    this.clearTailFlush();
    this.tailFlushTimer = setTimeout(() => {
      this.tailFlushTimer = null;
      if (this.flushed || this.pendingBytes < 2) return;
      void this.commitPendingBatch();
    }, TAIL_FLUSH_MS);
  }

  private async commitPendingBatch(): Promise<void> {
    this.clearTailFlush();
    if (this.flushed || this.pendingBytes < 2) return;

    const chunks = this.pendingChunks;
    const sampleRate = this.pendingSampleRate;
    this.pendingChunks = [];
    this.pendingBytes = 0;

    this.queue.push({
      pcm: concatPcm(chunks),
      sampleRate,
    });
    void this.pump();
  }

  private takeMergedFromQueue(): PcmChunk | null {
    if (this.queue.length === 0) return null;

    const sampleRate = this.queue[0]!.sampleRate;
    const maxBytes = Math.max(
      2,
      Math.floor(sampleRate * 2 * (MAX_MERGE_MS / 1000)),
    );
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (this.queue.length > 0) {
      const next = this.queue[0]!;
      if (next.sampleRate !== sampleRate) break;
      if (totalBytes > 0 && totalBytes + next.pcm.byteLength > maxBytes) {
        break;
      }
      chunks.push(this.queue.shift()!.pcm);
      totalBytes += next.pcm.byteLength;
    }

    if (chunks.length === 0) return null;
    return {
      pcm: concatPcm(chunks),
      sampleRate,
    };
  }

  private async writeJob(
    bytes: Uint8Array,
    sampleRate: number,
  ): Promise<PlaybackJob> {
    await this.ensureRuntime();
    const [{ createAudioPlayer }, fileSystem] = await Promise.all([
      loadExpoAudio(),
      loadExpoFileSystem(),
    ]);

    const wav = pcm16ToWav(bytes, sampleRate);
    const cacheDir = fileSystem.cacheDirectory ?? "";
    const uri = `${cacheDir}chatropic-voice-${Date.now()}-${this.fileCounter++}.wav`;
    await fileSystem.writeAsStringAsync(uri, bytesToBase64(wav), {
      encoding: fileSystem.EncodingType.Base64,
    });

    if (!this.player) {
      this.player = createAudioPlayer(null, {
        updateInterval: 50,
        keepAudioSessionActive: true,
      });
    }

    return {
      uri,
      durationSec: bytes.byteLength / 2 / sampleRate,
    };
  }

  private async pump(): Promise<void> {
    if (this.pumping || this.flushed) return;
    this.pumping = true;

    try {
      while (!this.flushed && this.queue.length > 0) {
        const merged = this.takeMergedFromQueue();
        if (!merged) break;

        let job: PlaybackJob;
        try {
          job = await this.writeJob(merged.pcm, merged.sampleRate);
        } catch {
          // Drop the batch that failed to write; keep draining the queue.
          continue;
        }
        if (this.flushed || !this.player) return;

        this.playing = true;
        const now = Date.now() / 1000;
        if (this.playbackEndSec < now) {
          this.playbackEndSec = now;
        }
        this.playbackEndSec += job.durationSec;

        await this.playJob(job);
      }
    } finally {
      this.playing = false;
      this.pumping = false;
      if (
        !this.flushed &&
        this.pendingBytes > 0 &&
        this.queue.length === 0 &&
        !this.tailFlushTimer
      ) {
        this.scheduleTailFlush();
      } else if (!this.flushed && this.queue.length > 0) {
        void this.pump();
      }
    }
  }

  private playJob(job: PlaybackJob): Promise<void> {
    return new Promise((resolve) => {
      if (!this.player || this.flushed) {
        resolve();
        return;
      }

      let settled = false;
      let escapeTimer: ReturnType<typeof setTimeout> | null = null;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (escapeTimer) {
          clearTimeout(escapeTimer);
          escapeTimer = null;
        }
        this.statusSub?.remove();
        this.statusSub = null;
        resolve();
      };

      const onStatus = (status: AudioStatusLike) => {
        if (status.didJustFinish || status.error) {
          finish();
        }
      };

      this.statusSub?.remove();
      this.statusSub = this.player.addListener(
        PLAYBACK_STATUS_UPDATE,
        onStatus,
      );

      try {
        this.player.replace(job.uri);
        this.player.play();
      } catch {
        finish();
        return;
      }

      escapeTimer = setTimeout(
        finish,
        job.durationSec * 1000 + STUCK_PLAYER_GRACE_MS,
      );
    });
  }
}
