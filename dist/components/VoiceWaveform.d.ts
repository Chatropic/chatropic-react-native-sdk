import React from "react";
import type { VoiceAgentState } from "../client/voice-client";
import type { WidgetConfig } from "../types";
interface VoiceWaveformProps {
    state: VoiceAgentState;
    config: WidgetConfig;
    size?: "md" | "lg";
}
export declare function VoiceWaveform({ state, config, size, }: VoiceWaveformProps): React.JSX.Element;
export {};
