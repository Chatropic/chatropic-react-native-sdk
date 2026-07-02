import type { AgentStreamEvent, AgentStreamOptions, PublicAppConfig, TurnUI, WidgetProfile } from "../types";
export declare function fetchPublicAppConfig(tenantRef: string | undefined, agentUrl?: string, profile?: WidgetProfile, publishableKey?: string): Promise<PublicAppConfig>;
export declare function parseSseBlock(block: string): AgentStreamEvent | null;
export declare function emitBufferedBlocks(buffer: string, onEvent: (ev: AgentStreamEvent) => void): string;
export type SseStreamState = {
    buffer: string;
    receivedLength: number;
};
/** Append new XHR responseText and emit any complete SSE blocks. */
export declare function consumeSseResponseText(state: SseStreamState, responseText: string, onEvent: (ev: AgentStreamEvent) => void): void;
/** Flush trailing SSE data when the XHR stream completes. */
export declare function flushSseResponseText(state: SseStreamState, responseText: string, onEvent: (ev: AgentStreamEvent) => void): void;
export declare function mapUiRender(component: string, props: Record<string, unknown>): TurnUI;
export declare function resolveTurnUiFromDoneData(turnUi: TurnUI | null, data: Record<string, unknown>): TurnUI | null;
export declare function suggestedRepliesFromDoneData(data: Record<string, unknown>): string[] | undefined;
export declare function extractAgentDisplayText(raw: string): string;
/** SSE stream via XMLHttpRequest — reliable across React Native versions. */
export declare function streamChat(agentUrl: string, sessionId: string, tenantId: string | undefined, message: string, onEvent: (ev: AgentStreamEvent) => void, options?: AgentStreamOptions): {
    abort: () => void;
    promise: Promise<void>;
};
export declare function submitMessageFeedback(agentUrl: string, tenantId: string | undefined, productId: string, sessionId: string, messageId: string | undefined, positive: boolean, apiKey?: string): Promise<void>;
