import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { themeSurfaceColors } from "../theme/resolve-colors";
export function PrivacyBanner({ config, colorScheme, dismissed, onDismiss, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    if (!config.showPrivacyNotice || dismissed || !config.privacyNoticeText) {
        return null;
    }
    return (_jsxs(View, { style: styles.banner, children: [_jsx(Text, { style: [styles.text, { color: surfaces.muted }], children: config.privacyNoticeText }), _jsx(Pressable, { onPress: onDismiss, hitSlop: 8, accessibilityLabel: "Dismiss privacy notice", children: _jsx(Text, { style: [styles.dismiss, { color: surfaces.muted }], children: "\u2715" }) })] }));
}
const styles = StyleSheet.create({
    banner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 2,
    },
    text: {
        flex: 1,
        fontSize: 11,
        lineHeight: 15,
    },
    dismiss: {
        fontSize: 14,
        padding: 4,
    },
});
