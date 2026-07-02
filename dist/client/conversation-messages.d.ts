import type { Turn } from "../types";
export interface ServerConversationMessage {
    id: string;
    role: string;
    body: string;
    ui?: Record<string, unknown> | null;
    created_at?: string;
}
export declare function serverMessagesToTurns(messages: ServerConversationMessage[], welcomeMessage: string): Turn[];
export declare function mergeServerTurns(local: Turn[], server: Turn[], welcomeMessage?: string): Turn[];
export interface SessionConversationMessagesResponse {
    session_id: string;
    status: string;
    resolved: boolean;
    messages: ServerConversationMessage[];
}
/**
 * Signal to the backend that the user closed the chat widget.
 * Fire-and-forget — errors are swallowed intentionally.
 */
export declare function signalChatClosed(tenantId: string | undefined, sessionId: string, options?: {
    agentUrl?: string;
    productId?: string;
    apiKey?: string;
}): void;
export declare function fetchSessionConversationMessages(tenantId: string | undefined, sessionId: string, options?: {
    agentUrl?: string;
    productId?: string;
    limit?: number;
    apiKey?: string;
}): Promise<SessionConversationMessagesResponse>;
