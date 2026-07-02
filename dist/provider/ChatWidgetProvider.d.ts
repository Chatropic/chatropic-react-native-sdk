import React, { type ReactNode } from "react";
import { type VoiceAgentState, type VoiceTranscriptLine } from "../client/voice-client";
import type { ChatWidgetProps, ColorScheme, Turn, WidgetConfig } from "../types";
interface ChatWidgetContextValue {
    config: WidgetConfig;
    colorScheme: ColorScheme;
    turns: Turn[];
    input: string;
    setInput: (v: string) => void;
    sendMessage: (text?: string, options?: {
        displayText?: string;
    }) => void;
    resetChat: () => void;
    privacyDismissed: boolean;
    dismissPrivacy: () => void;
    inputLocked: boolean;
    loading: boolean;
    error: string | null;
    onNavigate?: (path: string) => void;
    voiceActive: boolean;
    voiceState: VoiceAgentState;
    voiceTranscript: VoiceTranscriptLine[];
    voiceError: string | null;
    toggleVoiceSession: () => void;
    endVoiceSession: () => void;
    sessionId: string;
    conversationResolved: boolean;
    sessionHandoffNotice: string | null;
    agentUrl: string;
    tenantId?: string;
    apiKey?: string;
    productId: string;
}
export declare function useChatWidget(): ChatWidgetContextValue;
export interface ChatWidgetProviderProps extends ChatWidgetProps {
    children: ReactNode;
    presentation?: "launcher" | "fullscreen";
    sessionHandoffNotice?: string | null;
}
export declare function ChatWidgetProvider({ children, tenantId, publishableKey, profile, sessionId: fixedSessionId, endUserId, userName, userEmail, theme, onNavigate, onUserMessage, onAgentDone, onSessionRotate, sessionHandoffNotice, }: ChatWidgetProviderProps): React.JSX.Element;
export {};
