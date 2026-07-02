import React from "react";
import type { VoiceAgentState } from "../client/voice-client";
import type { ColorScheme, WidgetConfig } from "../types";
interface VoicePanelProps {
    active: boolean;
    state: VoiceAgentState;
    transcript: {
        role: "user" | "agent";
        text: string;
        final: boolean;
    }[];
    error?: string | null;
    onEnd: () => void;
    config: WidgetConfig;
    assistantName?: string;
    colorScheme?: ColorScheme;
}
export declare function VoicePanel({ active, state, transcript, error, onEnd, config, assistantName, colorScheme, }: VoicePanelProps): React.JSX.Element | null;
export {};
