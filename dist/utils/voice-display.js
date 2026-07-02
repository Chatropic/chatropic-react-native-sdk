/** Max visible lines in the voice overlay transcript at once. */
export const VOICE_DISPLAY_MAX_LINES = 5;
const VOICE_CHARS_PER_LINE = 38;
export function trimVoiceDisplayText(text, maxLines = VOICE_DISPLAY_MAX_LINES) {
    const trimmed = text.trim();
    if (!trimmed)
        return trimmed;
    const maxChars = Math.max(1, maxLines) * VOICE_CHARS_PER_LINE;
    const explicitLines = trimmed.split("\n");
    if (explicitLines.length > maxLines) {
        return `…${explicitLines.slice(-maxLines).join("\n")}`;
    }
    const block = explicitLines.join("\n");
    if (block.length <= maxChars)
        return block;
    const words = block.split(/\s+/).filter(Boolean);
    let tail = "";
    for (let i = words.length - 1; i >= 0; i -= 1) {
        const next = words[i] + (tail ? ` ${tail}` : "");
        if (next.length > maxChars - 1)
            break;
        tail = next;
    }
    if (tail)
        return `…${tail}`;
    return `…${block.slice(-maxChars + 1)}`;
}
export function pickVoiceDisplayLine(transcript, state) {
    if (transcript.length === 0)
        return null;
    const lastWithText = [...transcript]
        .reverse()
        .find((line) => line.text.trim());
    if (state === "speaking" || state === "thinking") {
        const agentLine = [...transcript]
            .reverse()
            .find((line) => line.role === "agent" && line.text.trim());
        return agentLine ?? lastWithText ?? null;
    }
    if (state === "listening" || state === "connecting") {
        const userLine = [...transcript]
            .reverse()
            .find((line) => line.role === "user" && line.text.trim());
        if (userLine && !userLine.final)
            return userLine;
        const agentLine = [...transcript]
            .reverse()
            .find((line) => line.role === "agent" && line.text.trim());
        return userLine ?? agentLine ?? lastWithText ?? null;
    }
    return lastWithText ?? null;
}
export const VOICE_STATUS_LABEL = {
    idle: "Voice off",
    connecting: "Connecting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    error: "Something went wrong",
};
export const VOICE_HINT = {
    idle: "",
    connecting: "Setting up your voice session…",
    listening: "Speak naturally. I'm listening",
    thinking: "Working on that…",
    speaking: "",
    error: "Tap close and try again",
};
