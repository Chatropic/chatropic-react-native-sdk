import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { buildAddToCartDisplayMessage, buildAddToCartMessage, productWidgetItemsFromProps, } from "./product-widget-items";
export function NavigationCard({ label, path, requiresAuth, colorScheme, onNavigate, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const chipText = `Go to ${label}`;
    return (_jsx(Pressable, { onPress: () => onNavigate(path), accessibilityLabel: requiresAuth
            ? `${chipText}. You may need to sign in first.`
            : chipText, style: [
            styles.chip,
            {
                borderColor: surfaces.border,
                backgroundColor: colorScheme === "dark" ? "#18181B" : "#FFFFFF",
            },
        ], children: _jsx(Text, { style: [styles.text, { color: surfaces.foreground }], children: chipText }) }));
}
export function UnknownWidgetFallback({ component, props, colorScheme, }) {
    const [expanded, setExpanded] = useState(false);
    const surfaces = themeSurfaceColors(colorScheme);
    return (_jsxs(View, { style: [
            styles.card,
            {
                borderColor: surfaces.border,
                backgroundColor: colorScheme === "dark" ? "#18181B" : "#FAFAFA",
            },
        ], children: [_jsxs(Pressable, { onPress: () => setExpanded((v) => !v), children: [_jsx(Text, { style: [styles.title, { color: surfaces.foreground }], children: component }), _jsx(Text, { style: [styles.hint, { color: surfaces.muted }], children: expanded ? "Tap to collapse" : "Tap to view payload" })] }), expanded ? (_jsx(Text, { style: [styles.json, { color: surfaces.muted }], children: JSON.stringify(props, null, 2) })) : null] }));
}
export function ProductListWidget({ component, props, colorScheme, disabled, onAddToCart, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const items = productWidgetItemsFromProps(props);
    const title = typeof props.title === "string" && props.title.trim()
        ? props.title.trim()
        : typeof props.widgetName === "string" && props.widgetName.trim()
            ? props.widgetName.trim()
            : component === "CustomWidget"
                ? "Products"
                : component;
    return (_jsxs(View, { style: [
            styles.card,
            {
                borderColor: surfaces.border,
                backgroundColor: colorScheme === "dark" ? "#18181B" : "#FFFFFF",
            },
        ], children: [_jsx(Text, { style: [styles.title, { color: surfaces.foreground }], children: title }), _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.productRow, children: items.map((item, index) => (_jsxs(View, { style: [
                        styles.productCard,
                        {
                            borderColor: surfaces.border,
                            backgroundColor: colorScheme === "dark" ? "#111113" : "#FAFAFA",
                        },
                    ], children: [item.image ? (_jsx(Image, { source: { uri: item.image }, accessibilityLabel: item.name, style: styles.productImage })) : null, _jsx(Text, { numberOfLines: 2, style: [styles.productName, { color: surfaces.foreground }], children: item.name }), item.category ? (_jsx(Text, { numberOfLines: 1, style: [styles.productCategory, { color: surfaces.muted }], children: item.category })) : null, item.price ? (_jsx(Text, { style: [styles.productPrice, { color: surfaces.foreground }], children: item.price })) : null, _jsx(Pressable, { disabled: disabled, onPress: () => onAddToCart?.(buildAddToCartMessage(item), item, buildAddToCartDisplayMessage(item)), accessibilityLabel: `Add ${item.name || "product"} to cart`, style: ({ pressed }) => [
                                styles.addButton,
                                {
                                    backgroundColor: colorScheme === "dark" ? "#FFFFFF" : "#18181B",
                                    opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
                                },
                            ], children: _jsx(Text, { style: [
                                    styles.addButtonText,
                                    { color: colorScheme === "dark" ? "#18181B" : "#FFFFFF" },
                                ], children: "Add to Cart" }) })] }, item.id || `${item.name}-${index}`))) })] }));
}
const styles = StyleSheet.create({
    chip: {
        alignSelf: "flex-start",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 8,
    },
    text: {
        fontSize: 13,
    },
    card: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        maxWidth: "95%",
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
    },
    hint: {
        fontSize: 11,
        marginTop: 4,
    },
    json: {
        fontSize: 10,
        fontFamily: "Menlo",
        marginTop: 8,
    },
    productRow: {
        gap: 10,
        paddingTop: 10,
        paddingRight: 4,
    },
    productCard: {
        width: 148,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    },
    productImage: {
        width: "100%",
        height: 88,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: "#E5E7EB",
    },
    productName: {
        fontSize: 13,
        fontWeight: "600",
        minHeight: 34,
    },
    productCategory: {
        fontSize: 11,
        marginTop: 3,
    },
    productPrice: {
        fontSize: 13,
        fontWeight: "700",
        marginTop: 6,
    },
    addButton: {
        minHeight: 34,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        paddingHorizontal: 10,
    },
    addButtonText: {
        fontSize: 12,
        fontWeight: "700",
    },
});
