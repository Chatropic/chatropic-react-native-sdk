import { jsx as _jsx } from "react/jsx-runtime";
import { StyleSheet, View } from "react-native";
import { primaryAccentColor } from "../theme/resolve-colors";
export function AccentBackground({ config, style, children, }) {
    return (_jsx(View, { style: [style, { backgroundColor: primaryAccentColor(config) }], children: children }));
}
export function accentBubbleStyle(config) {
    return { backgroundColor: primaryAccentColor(config) };
}
const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
});
export function AccentHighlightOverlay() {
    return _jsx(View, { style: styles.overlay, pointerEvents: "none" });
}
