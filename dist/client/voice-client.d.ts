export type VoiceAgentState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";
export interface VoiceTranscriptLine {
    role: "user" | "agent";
    text: string;
    final: boolean;
}
export type VoiceServerMessage = {
    type: "ready";
} | {
    type: "state";
    state: VoiceAgentState;
} | {
    type: "transcript";
    role: "user" | "agent";
    text: string;
    final: boolean;
} | {
    type: "audio";
    mime_type: string;
    data: string;
} | {
    type: "ui:render";
    component: string;
    props: Record<string, unknown>;
} | {
    type: "event";
    event: string;
    data: Record<string, unknown>;
} | {
    type: "interrupted";
} | {
    type: "turn_complete";
    role: "user" | "agent";
    text?: string;
} | {
    type: "error";
    code: string;
    message: string;
};
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
export declare class VoiceClient {
    private callbacks;
    private ws;
    private audioStream;
    private bufferSub;
    private statusSub;
    private playback;
    private micPaused;
    private closed;
    private readyResolve;
    private agentUrl;
    constructor(callbacks: VoiceClientCallbacks);
    connect(agentUrl: string, sessionId: string, tenantId: string, options?: VoiceConnectOptions): Promise<void>;
    private handleMessage;
    private sendJson;
    private micInputOpen;
    private startMic;
    private playPcm;
    private playPcmBytes;
    private flushPlayback;
    disconnect(): Promise<void>;
}
export declare function voiceWsUrl(agentUrl: string, sessionId: string, tenantId: string, options?: VoiceConnectOptions): Promise<string>;
