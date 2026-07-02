import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { themeSurfaceColors, userBubbleStyle } from "../theme/resolve-colors";
import { glassSurfaces } from "../theme/widget-glass";
import { useThinkingDotAnimation } from "../utils/widget-animations";
function StreamingCursor({ color }) {
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        const anim = Animated.loop(Animated.sequence([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 450,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]));
        anim.start();
        return () => anim.stop();
    }, [opacity]);
    return _jsx(Animated.View, { style: [styles.cursor, { backgroundColor: color, opacity }] });
}
function agentCardColors(config, colorScheme) {
    const glass = glassSurfaces(colorScheme);
    if (config.agentBubbleColor) {
        return {
            backgroundColor: config.agentBubbleColor,
            borderColor: glass.agentBubbleBorder,
            color: colorScheme === "dark" ? glass.text : glass.agentBubbleText,
        };
    }
    return {
        backgroundColor: glass.agentBubble,
        borderColor: glass.agentBubbleBorder,
        color: colorScheme === "dark" ? glass.text : glass.agentBubbleText,
    };
}
export function MessageBubble({ role, text, running = false, config, colorScheme, }) {
    const isUser = role === "user";
    if (isUser) {
        const userStyle = userBubbleStyle(config, colorScheme);
        const glass = glassSurfaces(colorScheme);
        return (_jsx(View, { style: [styles.row, styles.rowUser], children: _jsx(View, { style: [
                    styles.bubble,
                    styles.userBubble,
                    { backgroundColor: userStyle.backgroundColor },
                ], children: _jsx(Text, { style: [
                        styles.userText,
                        {
                            color: colorScheme === "dark"
                                ? glass.userBubbleText
                                : userStyle.color,
                        },
                    ], children: text }) }) }));
    }
    const agentStyle = agentCardColors(config, colorScheme);
    const agentRadius = colorScheme === "dark"
        ? styles.agentCardDarkRadius
        : styles.agentCardLightRadius;
    return (_jsx(View, { style: [styles.row, styles.rowAgent], children: _jsx(View, { style: [
                styles.agentCard,
                agentRadius,
                {
                    backgroundColor: agentStyle.backgroundColor,
                    borderColor: agentStyle.borderColor,
                },
            ], children: _jsxs(View, { style: styles.agentTextRow, children: [_jsx(Text, { style: [styles.agentText, { color: agentStyle.color }], children: text }), running && _jsx(StreamingCursor, { color: agentStyle.color })] }) }) }));
}
export function ThinkingBubble({ config, colorScheme, label = "Thinking…", }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const card = agentCardColors(config, colorScheme);
    const agentRadius = colorScheme === "dark"
        ? styles.agentCardDarkRadius
        : styles.agentCardLightRadius;
    return (_jsx(View, { style: [styles.row, styles.rowAgent], children: _jsx(View, { style: [
                styles.agentCard,
                agentRadius,
                {
                    backgroundColor: card.backgroundColor,
                    borderColor: card.borderColor,
                },
            ], children: _jsxs(View, { style: styles.thinkingRow, children: [_jsxs(View, { style: styles.dots, children: [_jsx(ThinkingDot, { color: surfaces.muted, delayMs: 0 }), _jsx(ThinkingDot, { color: surfaces.muted, delayMs: 150 }), _jsx(ThinkingDot, { color: surfaces.muted, delayMs: 300 })] }), _jsx(Text, { style: [styles.thinkingText, { color: surfaces.muted }], children: label })] }) }) }));
}
function ThinkingDot({ color, delayMs }) {
    const animation = useThinkingDotAnimation(delayMs);
    return (_jsx(Animated.View, { style: [styles.dot, { backgroundColor: color }, animation.style] }));
}
const styles = StyleSheet.create({
    row: {
        width: "100%",
    },
    rowUser: {
        alignItems: "flex-end",
    },
    rowAgent: {
        alignItems: "flex-start",
    },
    bubble: {
        maxWidth: "92%",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    userBubble: {
        borderRadius: 18,
    },
    userText: {
        fontSize: 13,
        lineHeight: 18,
    },
    agentCard: {
        maxWidth: "92%",
        alignSelf: "flex-start",
        borderWidth: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    agentText: {
        fontSize: 14,
        lineHeight: 20,
        flexShrink: 1,
    },
    agentTextRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        flexWrap: "wrap",
    },
    agentCardLightRadius: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 4,
    },
    agentCardDarkRadius: {
        borderRadius: 16,
    },
    thinkingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    thinkingText: {
        fontSize: 13,
        lineHeight: 18,
    },
    dots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    cursor: {
        width: 2,
        height: 14,
        borderRadius: 1,
        marginLeft: 2,
        marginBottom: 1,
    },
});
