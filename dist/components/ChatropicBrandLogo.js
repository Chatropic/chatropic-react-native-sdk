import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View } from "react-native";
/** Matches playground `chatropicLogoSrc(isDarkSurface)`. */
export function chatropicLogoVariant(colorScheme) {
    return colorScheme === "dark" ? "dark" : "light";
}
function ChatropicLogoFallback({ size }) {
    return (_jsx(View, { style: {
            width: size,
            height: size,
            borderRadius: size * 0.25,
            backgroundColor: "#18181B",
            alignItems: "center",
            justifyContent: "center",
        }, children: _jsx(Text, { style: {
                color: "#FFFFFF",
                fontSize: size * 0.55,
                fontWeight: "700",
            }, children: "C" }) }));
}
function ChatropicLogoSvg({ variant, size, }) {
    const isDark = variant === "dark";
    const backgroundColor = isDark ? "#FAFAF9" : "#0A0A0A";
    const foregroundColor = isDark ? "#0A0A0A" : "#FAFAF9";
    return (_jsxs(View, { style: [
            styles.logo,
            {
                width: size,
                height: size,
                borderRadius: size * 0.25,
                backgroundColor,
            },
        ], children: [_jsx(View, { style: [
                    styles.glyphBar,
                    {
                        width: size * 0.44,
                        height: size * 0.48,
                        left: size * 0.28,
                        top: size * 0.26,
                        backgroundColor: foregroundColor,
                    },
                ] }), _jsx(View, { style: [
                    styles.glyphCutout,
                    {
                        width: size * 0.28,
                        height: size * 0.2,
                        right: size * 0.16,
                        top: size * 0.4,
                        backgroundColor,
                    },
                ] })] }));
}
export function ChatropicBrandLogo({ colorScheme = "light", size = 16, style, }) {
    const variant = chatropicLogoVariant(colorScheme);
    return (_jsx(View, { style: style, children: _jsx(ChatropicLogoSvg, { variant: variant, size: size }) }));
}
export { ChatropicLogoFallback };
const styles = StyleSheet.create({
    logo: {
        overflow: "hidden",
    },
    glyphBar: {
        position: "absolute",
    },
    glyphCutout: {
        position: "absolute",
    },
});
