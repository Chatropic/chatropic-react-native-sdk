import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image, StyleSheet, Text, View } from "react-native";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { resolveWidgetBranding } from "../utils/branding";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";
export function AgentBubbleHeader({ config, colorScheme = "light", }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const branding = resolveWidgetBranding(config);
    return (_jsxs(View, { style: styles.row, children: [branding.usePlatformLogo ? (_jsx(ChatropicBrandLogo, { colorScheme: colorScheme, size: 16 })) : (_jsx(Image, { source: { uri: branding.logoUrl }, style: styles.logo })), _jsx(Text, { style: [styles.label, { color: surfaces.foreground }], numberOfLines: 1, children: branding.displayName })] }));
}
const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 10,
    },
    logo: {
        width: 16,
        height: 16,
    },
    label: {
        flex: 1,
        fontSize: 11,
        lineHeight: 15,
        fontWeight: "400",
    },
});
