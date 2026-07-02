/** Dark mode palette — exact Fin-style values. */
export const DARK_GLASS = {
    thread: "#121214",
    header: "#1C1C1E",
    shell: "#121214",
    shellBorder: "#2D2F34",
    headerBorder: "rgba(255, 255, 255, 0.08)",
    text: "#FFFFFF",
    textMuted: "#8E9297",
    input: "#1A1B1E",
    inputBorder: "#2D2F34",
    composerIcon: "#8E9297",
    agentBubble: "#2C2C2E",
    agentBubbleBorder: "transparent",
    agentBubbleText: "#FFFFFF",
    userBubble: "#FFFFFF",
    userBubbleText: "#000000",
    sendSurface: "#313338",
    sendIcon: "#8E9297",
    shadow: "#000000",
};
export const LIGHT_GLASS = {
    text: "#18181B",
    textMuted: "#A1A1AA",
    input: "rgba(255, 255, 255, 0.72)",
    inputBorder: "rgba(0, 0, 0, 0.08)",
    composerIcon: "#71717A",
    sendSurface: "#F4F4F5",
    sendIcon: "#71717A",
    agentBubble: "#F4F4F4",
    agentBubbleBorder: "transparent",
    agentBubbleText: "#1A1A1A",
    userBubble: "#18181B",
    userBubbleText: "#FFFFFF",
    shadow: "#000000",
};
/** Simulated glass surfaces — RN has no backdrop-filter; use solid fills + borders. */
export const GLASS_SURFACES = {
    light: {
        shell: "rgba(255, 255, 255, 0.62)",
        shellBorder: "rgba(255, 255, 255, 0.72)",
        header: "rgba(255, 255, 255, 0.38)",
        headerBorder: "rgba(0, 0, 0, 0.06)",
        thread: "rgba(255, 255, 255, 0.55)",
        text: LIGHT_GLASS.text,
        textMuted: LIGHT_GLASS.textMuted,
        input: LIGHT_GLASS.input,
        inputBorder: LIGHT_GLASS.inputBorder,
        composerIcon: LIGHT_GLASS.composerIcon,
        agentBubble: LIGHT_GLASS.agentBubble,
        agentBubbleBorder: "transparent",
        agentBubbleText: LIGHT_GLASS.agentBubbleText,
        userBubble: "#18181B",
        userBubbleText: "#FFFFFF",
        sendSurface: LIGHT_GLASS.sendSurface,
        sendIcon: LIGHT_GLASS.sendIcon,
        shadow: "#000000",
    },
    dark: DARK_GLASS,
};
export function glassSurfaces(scheme) {
    return scheme === "dark" ? GLASS_SURFACES.dark : GLASS_SURFACES.light;
}
export function glassPageBackdropColors(scheme, accentColor) {
    const accent = accentColor?.trim() || "#f97316";
    if (scheme === "dark") {
        return {
            backgroundColor: DARK_GLASS.thread,
            gradientTop: `${accent}18`,
            gradientBottom: `${accent}10`,
        };
    }
    return {
        backgroundColor: "#fafafa",
        gradientTop: `${accent}40`,
        gradientBottom: `${accent}28`,
    };
}
