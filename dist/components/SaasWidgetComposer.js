import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, } from "react-native";
import { resolveSaasInputBackground, sendButtonActiveStyle, themeSurfaceColors, } from "../theme/resolve-colors";
import { glassSurfaces } from "../theme/widget-glass";
import { useBottomSafeInset } from "../utils/safe-area";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { PoweredByChatropic } from "./PoweredByChatropic";
import { VoiceWaveformIcon } from "./VoiceWaveformIcon";
function ComposerIcon({ label, color, children, }) {
    return (_jsx(Pressable, { disabled: true, style: styles.iconBtn, accessibilityLabel: label, children: typeof children === "string" ? (_jsx(Text, { style: [styles.gifLabel, { color }], children: children })) : (children) }));
}
export function WidgetComposer({ value, onChange, onSend, placeholder, disabled, config, colorScheme, }) {
    const { toggleVoiceSession } = useChatWidget();
    const surfaces = themeSurfaceColors(colorScheme);
    const isDark = colorScheme === "dark";
    const glass = glassSurfaces(colorScheme);
    const canSend = value.trim().length > 0 && !disabled;
    const sendStyle = sendButtonActiveStyle(config, colorScheme);
    const bottomInset = useBottomSafeInset();
    const iconColor = glass.composerIcon;
    const inputBackground = resolveSaasInputBackground(config, colorScheme);
    return (_jsxs(View, { style: [styles.shell, { paddingBottom: 4 + bottomInset }], children: [_jsxs(View, { style: [
                    styles.card,
                    {
                        borderColor: glass.inputBorder,
                        backgroundColor: inputBackground,
                    },
                ], children: [_jsx(TextInput, { style: [styles.input, { color: surfaces.foreground }], value: value, onChangeText: onChange, placeholder: placeholder || "Message…", placeholderTextColor: isDark ? glass.textMuted : "#A1A1AA", multiline: true, editable: !disabled }), _jsxs(View, { style: styles.actionRow, children: [_jsxs(View, { style: styles.iconRow, children: [_jsx(ComposerIcon, { label: "Attach file", color: iconColor, children: _jsx(Text, { style: [styles.iconGlyph, { color: iconColor }], children: "\uD83D\uDCCE" }) }), _jsx(ComposerIcon, { label: "Add emoji", color: iconColor, children: _jsx(Text, { style: [styles.iconGlyph, { color: iconColor }], children: "\u263A" }) }), _jsx(ComposerIcon, { label: "Add GIF", color: iconColor, children: "GIF" })] }), config.showVoice && !canSend ? (_jsx(Pressable, { onPress: toggleVoiceSession, disabled: disabled, style: [
                                    styles.sendBtn,
                                    {
                                        backgroundColor: sendStyle.backgroundColor,
                                    },
                                ], accessibilityLabel: "Start live voice", children: _jsx(VoiceWaveformIcon, { active: false, color: sendStyle.color }) })) : (_jsx(Pressable, { onPress: canSend ? onSend : undefined, disabled: !canSend || disabled, style: [
                                    styles.sendBtn,
                                    {
                                        backgroundColor: canSend
                                            ? sendStyle.backgroundColor
                                            : glass.sendSurface,
                                    },
                                ], accessibilityLabel: "Send message", children: disabled ? (_jsx(ActivityIndicator, { size: "small", color: surfaces.muted })) : (_jsx(Text, { style: [
                                        styles.sendArrow,
                                        {
                                            color: canSend ? sendStyle.color : glass.sendIcon,
                                        },
                                    ], children: "\u2191" })) }))] })] }), _jsx(PoweredByChatropic, { colorScheme: colorScheme, label: config.poweredByLabel, style: styles.poweredBy })] }));
}
/** @deprecated Use WidgetComposer */
export const SaasWidgetComposer = WidgetComposer;
const styles = StyleSheet.create({
    shell: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    poweredBy: {
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: 0,
    },
    card: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
    },
    input: {
        fontSize: 14,
        lineHeight: 22,
        minHeight: 28,
        maxHeight: 120,
        paddingVertical: 0,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    iconBtn: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    iconGlyph: {
        fontSize: 16,
    },
    gifLabel: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.4,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    sendArrow: {
        fontSize: 16,
        fontWeight: "700",
    },
});
