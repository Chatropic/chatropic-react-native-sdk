import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, } from "react-native";
import { sendButtonActiveStyle, themeSurfaceColors, } from "../theme/resolve-colors";
export function Composer({ value, onChange, onSend, placeholder, disabled, config, colorScheme, inputBackground, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const sendStyle = sendButtonActiveStyle(config, colorScheme);
    const canSend = value.trim().length > 0 && !disabled;
    return (_jsx(View, { style: [
            styles.shell,
            {
                borderTopColor: surfaces.border,
                backgroundColor: inputBackground ?? surfaces.background,
            },
        ], children: _jsxs(View, { style: [
                styles.inputWrap,
                {
                    borderColor: surfaces.border,
                    backgroundColor: colorScheme === "dark" ? "#27272A" : "#FFFFFF",
                },
            ], children: [_jsx(TextInput, { style: [styles.input, { color: surfaces.foreground }], value: value, onChangeText: onChange, placeholder: placeholder, placeholderTextColor: surfaces.muted, multiline: true, editable: !disabled, onSubmitEditing: canSend ? onSend : undefined }), _jsx(Pressable, { onPress: canSend ? onSend : undefined, disabled: !canSend, style: [
                        styles.sendBtn,
                        canSend
                            ? { backgroundColor: sendStyle.backgroundColor }
                            : styles.sendBtnDisabled,
                    ], children: disabled ? (_jsx(ActivityIndicator, { size: "small", color: surfaces.muted })) : (_jsx(Text, { style: [
                            styles.sendLabel,
                            { color: canSend ? sendStyle.color : surfaces.muted },
                        ], children: "\u2191" })) })] }) }));
}
const styles = StyleSheet.create({
    shell: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "flex-end",
        borderWidth: 1,
        borderRadius: 12,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 6,
        minHeight: 44,
    },
    input: {
        flex: 1,
        fontSize: 15,
        maxHeight: 120,
        paddingVertical: 4,
    },
    sendBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    sendBtnDisabled: {
        backgroundColor: "transparent",
    },
    sendLabel: {
        fontSize: 18,
        fontWeight: "600",
    },
});
