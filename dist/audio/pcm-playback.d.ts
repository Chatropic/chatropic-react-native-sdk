export declare class PcmPlaybackQueue {
    private player;
    private statusSub;
    private queue;
    private pendingChunks;
    private pendingBytes;
    private pendingSampleRate;
    private playing;
    private pumping;
    private flushed;
    private fileCounter;
    private playbackEndSec;
    private tailFlushTimer;
    private runtimeReady;
    get isPlaying(): boolean;
    /** Absolute wall-clock time (seconds) when scheduled playback ends. */
    get playbackTime(): number;
    private ensureRuntime;
    enqueue(bytes: Uint8Array, sampleRate?: number): void;
    flush(): void;
    resetFlush(): void;
    dispose(): Promise<void>;
    private clearTailFlush;
    private scheduleTailFlush;
    private commitPendingBatch;
    private takeMergedFromQueue;
    private writeJob;
    private pump;
    private playJob;
}
