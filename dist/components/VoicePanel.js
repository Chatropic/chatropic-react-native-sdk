import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { sendButtonActiveStyle, primaryAccentColor, } from "../theme/resolve-colors";
import { pickVoiceDisplayLine, trimVoiceDisplayText, VOICE_DISPLAY_MAX_LINES, VOICE_HINT, VOICE_STATUS_LABEL, } from "../utils/voice-display";
import { AccentBackground } from "./AccentBackground";
import { VoiceWaveform } from "./VoiceWaveform";
import { useBottomSafeInset, useTopSafeInset } from "../utils/safe-area";
export function VoicePanel({ active, state, transcript, error, onEnd, config, assistantName = "Assistant", colorScheme = "light", }) {
    const topInset = useTopSafeInset();
    const bottomInset = useBottomSafeInset();
    const isDark = colorScheme === "dark";
    const endButtonStyle = sendButtonActiveStyle(config, colorScheme);
    if (!active)
        return null;
    const displayLine = pickVoiceDisplayLine(transcript, state);
    const displayText = displayLine
        ? trimVoiceDisplayText(displayLine.text)
        : "";
    const statusLabel = VOICE_STATUS_LABEL[state];
    const emptyHint = error ?? VOICE_HINT[state];
    const statusColor = state === "error" ? "#EF4444" : primaryAccentColor(config);
    return (_jsxs(View, { style: [
            styles.root,
            {
                backgroundColor: isDark ? "#09090B" : "#FFFFFF",
                paddingTop: topInset,
                paddingBottom: bottomInset,
            },
        ], accessibilityViewIsModal: true, accessibilityLabel: "Voice conversation", children: [_jsx(View, { pointerEvents: "none", style: [
                    styles.glow,
                    {
                        backgroundColor: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.03)",
                    },
                ] }), _jsxs(View, { style: styles.header, children: [_jsx(Text, { style: [styles.assistantName, { color: isDark ? "#A1A1AA" : "#71717A" }], children: assistantName }), _jsx(Pressable, { onPress: onEnd, style: [
                            styles.closeBtn,
                            {
                                borderColor: isDark ? "#3F3F46" : "#E4E4E7",
                                backgroundColor: isDark ? "#18181B" : "#FFFFFF",
                            },
                        ], accessibilityLabel: "End voice session", children: _jsx(Text, { style: [styles.closeIcon, { color: isDark ? "#D4D4D8" : "#52525B" }], children: "\u2715" }) })] }), _jsxs(View, { style: styles.center, children: [_jsx(VoiceWaveform, { state: state, config: config, size: "lg" }), _jsx(Text, { style: [
                            styles.status,
                            { color: statusColor },
                        ], children: statusLabel.toUpperCase() }), displayLine ? (_jsxs(View, { style: styles.transcriptBlock, children: [_jsx(Text, { style: [styles.roleLabel, { color: isDark ? "#71717A" : "#A1A1AA" }], children: displayLine.role === "user" ? "You" : assistantName }), _jsx(Text, { numberOfLines: VOICE_DISPLAY_MAX_LINES, ellipsizeMode: "head", style: [
                                    styles.transcript,
                                    {
                                        color: displayLine.role === "user"
                                            ? isDark
                                                ? "#D4D4D8"
                                                : "#52525B"
                                            : isDark
                                                ? "#FFFFFF"
                                                : "#18181B",
                                        opacity: displayLine.final ? 1 : 0.9,
                                    },
                                ], children: displayText })] })) : null, !displayLine && emptyHint ? (_jsx(Text, { style: [
                            styles.hint,
                            {
                                color: error ? "#EF4444" : isDark ? "#A1A1AA" : "#71717A",
                            },
                        ], children: emptyHint })) : null, error && state === "error" ? (_jsx(Text, { style: [
                            styles.hint,
                            { color: "#EF4444", marginTop: displayLine ? 16 : 0 },
                        ], children: error })) : null] }), _jsx(View, { style: styles.footer, children: _jsx(Pressable, { onPress: onEnd, accessibilityLabel: "End voice session", children: _jsx(AccentBackground, { config: config, style: styles.endOrb, children: _jsx(View, { style: [
                                styles.endSquare,
                                { backgroundColor: endButtonStyle.color },
                            ] }) }) }) })] }));
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
        overflow: "hidden",
    },
    glow: {
        position: "absolute",
        top: "12%",
        left: "10%",
        right: "10%",
        height: "40%",
        borderRadius: 999,
        opacity: 0.9,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
        zIndex: 1,
    },
    assistantName: {
        fontSize: 13,
        fontWeight: "600",
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    closeIcon: {
        fontSize: 18,
        fontWeight: "400",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 32,
        zIndex: 1,
        overflow: "hidden",
    },
    status: {
        marginTop: 40,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1.4,
    },
    transcriptBlock: {
        marginTop: 32,
        alignItems: "center",
        gap: 8,
        maxWidth: 320,
        maxHeight: 30 * VOICE_DISPLAY_MAX_LINES + 8,
        overflow: "hidden",
    },
    roleLabel: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    transcript: {
        fontSize: 22,
        lineHeight: 30,
        fontWeight: "500",
        textAlign: "center",
    },
    hint: {
        marginTop: 32,
        fontSize: 15,
        lineHeight: 24,
        textAlign: "center",
        maxWidth: 280,
    },
    footer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 16,
        paddingBottom: 40,
        zIndex: 1,
    },
    endOrb: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    endSquare: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },
});
