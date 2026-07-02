import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StyleSheet, Text, View, } from "react-native";
import { PLATFORM_POWERED_BY_LABEL } from "../utils/defaults";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";
export function PoweredByChatropic({ colorScheme = "light", label = PLATFORM_POWERED_BY_LABEL, style, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    return (_jsxs(View, { style: [styles.row, style], children: [_jsx(ChatropicBrandLogo, { colorScheme: colorScheme, size: 16 }), _jsx(Text, { style: [styles.label, { color: surfaces.muted }], children: label })] }));
}
const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 4,
    },
    label: {
        fontSize: 10,
    },
});
