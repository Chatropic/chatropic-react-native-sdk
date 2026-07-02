import type { VoiceAgentState, VoiceTranscriptLine } from "../client/voice-client";
/** Max visible lines in the voice overlay transcript at once. */
export declare const VOICE_DISPLAY_MAX_LINES = 5;
export declare function trimVoiceDisplayText(text: string, maxLines?: number): string;
export declare function pickVoiceDisplayLine(transcript: VoiceTranscriptLine[], state: VoiceAgentState): VoiceTranscriptLine | null;
export declare const VOICE_STATUS_LABEL: Record<VoiceAgentState, string>;
export declare const VOICE_HINT: Record<VoiceAgentState, string>;
