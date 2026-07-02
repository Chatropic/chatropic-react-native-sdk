import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { MessageBubble, ThinkingBubble } from "./MessageBubble";
import { NavigationCard, ProductListWidget, UnknownWidgetFallback, } from "../widgets/TurnWidgets";
import { canRenderProductWidget } from "../widgets/product-widget-items";
import { SuggestedPromptChips } from "./SuggestedPromptChips";
import { AgentFeedbackRow } from "./AgentFeedbackRow";
import { useTurnEnterAnimation } from "../utils/widget-animations";
function AgentAvatar({ isDark }) {
    const bg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
    const iconColor = isDark ? "#FFFFFF" : "#1A1A1A";
    return (_jsx(View, { style: [styles.avatar, { backgroundColor: bg }], children: _jsx(Svg, { width: 14, height: 14, viewBox: "0 0 24 24", fill: iconColor, children: _jsx(Path, { d: "M23.9996 12.0235C17.5625 12.4117 12.4114 17.563 12.0232 24H11.9762C11.588 17.563 6.4369 12.4117 0 12.0235V11.9765C6.4369 11.5883 11.588 6.43719 11.9762 0H12.0232C12.4114 6.43719 17.5625 11.5883 23.9996 11.9765V12.0235Z" }) }) }));
}
export function ChatWidgetTurn({ turn, animate = false }) {
    const { config, colorScheme, sendMessage, inputLocked, onNavigate, sessionId, agentUrl, tenantId, apiKey, productId } = useChatWidget();
    const isDark = colorScheme === "dark";
    const hasWidget = Boolean(turn.ui &&
        turn.ui.component !== "UserChips" &&
        turn.ui.component !== "HumanHandoffWidget");
    const showBubble = Boolean(turn.text);
    const showThinking = turn.running && !turn.text;
    const enterAnimation = useTurnEnterAnimation(animate, turn.role === "user" ? "user" : "agent");
    if (turn.role === "user" && turn.text) {
        return (_jsx(Animated.View, { style: enterAnimation.style, children: _jsx(MessageBubble, { role: "user", text: turn.text, config: config, colorScheme: colorScheme }) }));
    }
    return (_jsxs(Animated.View, { style: [styles.agentRow, enterAnimation.style], children: [_jsx(View, { style: styles.avatarWrap, children: _jsx(AgentAvatar, { isDark: isDark }) }), _jsxs(View, { style: [styles.bubbleColumn, hasWidget ? styles.fullWidth : undefined], children: [showBubble ? (_jsx(MessageBubble, { role: "agent", text: turn.text ?? "", running: turn.running, config: config, colorScheme: colorScheme })) : null, showThinking ? (_jsx(ThinkingBubble, { config: config, colorScheme: colorScheme })) : null, hasWidget ? (_jsx(View, { style: [styles.widgetWrap, showBubble && styles.widgetWrapSpaced], children: turn.ui.component === "NavigationCard" ? (_jsx(NavigationCard, { label: String(turn.ui.props.label ?? ""), path: String(turn.ui.props.path ?? ""), requiresAuth: Boolean(turn.ui.props.requiresAuth), colorScheme: colorScheme, onNavigate: (path) => onNavigate?.(path) })) : canRenderProductWidget(turn.ui.component, turn.ui.props) ? (_jsx(ProductListWidget, { component: turn.ui.component, props: turn.ui.props, colorScheme: colorScheme, disabled: inputLocked, onAddToCart: (message, _item, displayMessage) => sendMessage(message, { displayText: displayMessage }) })) : (_jsx(UnknownWidgetFallback, { component: turn.ui.component, props: turn.ui.props, colorScheme: colorScheme })) })) : null, turn.suggestedReplies?.length ? (_jsx(View, { style: styles.replyChips, children: _jsx(SuggestedPromptChips, { prompts: turn.suggestedReplies, onSelect: (prompt) => sendMessage(prompt), colorScheme: colorScheme, disabled: inputLocked, align: "end", layout: "stack", compact: true }) })) : null, !turn.running && (showBubble || hasWidget) ? (_jsx(View, { style: styles.feedbackWrap, children: _jsx(AgentFeedbackRow, { timestamp: turn.createdAt, colorScheme: colorScheme, sessionId: sessionId, turnId: turn.turnId, agentUrl: agentUrl, tenantId: tenantId, apiKey: apiKey, productId: productId }) })) : null] })] }));
}
const styles = StyleSheet.create({
    agentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        width: "100%",
    },
    avatarWrap: {
        marginTop: 2,
        flexShrink: 0,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    bubbleColumn: {
        flex: 1,
        minWidth: 0,
        alignItems: "flex-start",
        maxWidth: "92%",
    },
    fullWidth: {
        maxWidth: "100%",
    },
    widgetWrap: {
        width: "100%",
    },
    widgetWrapSpaced: {
        paddingTop: 8,
    },
    replyChips: {
        marginTop: 4,
        alignSelf: "stretch",
    },
    feedbackWrap: {
        marginTop: 4,
        paddingHorizontal: 2,
        width: "100%",
    },
});
