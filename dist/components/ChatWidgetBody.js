import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, } from "react-native";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { resolveSaasThreadBackground, themeSurfaceColors, } from "../theme/resolve-colors";
import { ChatWidgetTurn } from "./ChatWidgetTurn";
import { PrivacyBanner } from "./PrivacyBanner";
import { SuggestedPromptChips } from "./SuggestedPromptChips";
import { SaasWidgetComposer } from "./SaasWidgetComposer";
import { WidgetHeader } from "./WidgetHeader";
import { VoicePanel } from "./VoicePanel";
import { ShimmerThread } from "./ShimmerThread";
import { useTopSafeInset } from "../utils/safe-area";
import { useEnteringTurnIds } from "../utils/widget-animations";
export function ChatWidgetBody({ variant = "launcher", onClose, onBack, }) {
    const { config, colorScheme, turns, input, setInput, sendMessage, resetChat, privacyDismissed, dismissPrivacy, inputLocked, loading, error, voiceActive, voiceState, voiceTranscript, voiceError, endVoiceSession, conversationResolved, sessionHandoffNotice, } = useChatWidget();
    const topInset = useTopSafeInset();
    const scrollRef = useRef(null);
    const surfaces = themeSurfaceColors(colorScheme);
    const isDark = colorScheme === "dark";
    const threadBg = variant === "fullscreen" || variant === "launcher"
        ? resolveSaasThreadBackground(config, colorScheme)
        : surfaces.background;
    const showHeader = config.showHeader !== false;
    const hasUserTurn = turns.some((turn) => turn.role === "user");
    const showSuggestedPrompts = config.suggestedPrompts.length > 0 && !hasUserTurn && !inputLocked;
    const enteringTurnIds = useEnteringTurnIds(turns.map((turn) => turn.id));
    const scrollToBottom = useCallback((animated = true) => {
        scrollRef.current?.scrollToEnd({ animated });
    }, []);
    const closeResolvedSession = () => {
        if (conversationResolved) {
            resetChat();
        }
    };
    const handleClose = onClose
        ? () => {
            closeResolvedSession();
            onClose();
        }
        : undefined;
    const handleBack = onBack
        ? () => {
            closeResolvedSession();
            onBack();
        }
        : undefined;
    useEffect(() => {
        scrollToBottom();
    }, [scrollToBottom, turns]);
    if (loading) {
        return (_jsxs(View, { style: [
                styles.root,
                variant === "launcher" ? styles.launcherShell : undefined,
                { backgroundColor: variant === "launcher" ? "transparent" : threadBg },
            ], children: [showHeader ? (_jsx(WidgetHeader, { config: config, colorScheme: colorScheme, onClose: handleClose, onBack: variant === "fullscreen" ? handleBack : undefined, topInset: variant === "fullscreen" ? topInset : 0, showMenu: !handleClose })) : null, _jsx(View, { style: [styles.threadColumn, { backgroundColor: threadBg }], children: _jsx(ShimmerThread, { colorScheme: colorScheme }) })] }));
    }
    if (error) {
        return (_jsx(View, { style: [styles.centered, { backgroundColor: threadBg }], children: _jsx(Text, { style: [styles.errorText, { color: surfaces.foreground }], children: error }) }));
    }
    const voiceMode = config.showVoice && voiceActive && !inputLocked;
    if (voiceMode) {
        return (_jsx(View, { style: [
                styles.root,
                variant === "launcher" ? styles.launcherShell : undefined,
                { backgroundColor: isDarkSurface(colorScheme) ? "#09090B" : "#FFFFFF" },
            ], children: _jsx(VoicePanel, { active: voiceActive, state: voiceState, transcript: voiceTranscript, error: voiceError, onEnd: endVoiceSession, config: config, assistantName: config.displayName, colorScheme: colorScheme }) }));
    }
    return (_jsxs(View, { style: [
            styles.root,
            variant === "launcher" ? styles.launcherShell : undefined,
            { backgroundColor: variant === "launcher" ? "transparent" : threadBg },
        ], children: [showHeader ? (_jsx(WidgetHeader, { config: config, colorScheme: colorScheme, onClose: handleClose, onBack: variant === "fullscreen" ? handleBack : undefined, topInset: variant === "fullscreen" ? topInset : 0, showMenu: !handleClose, conversationResolved: conversationResolved })) : null, _jsxs(View, { style: [styles.threadColumn, { backgroundColor: threadBg }], children: [_jsx(ScrollView, { ref: scrollRef, style: styles.thread, contentContainerStyle: styles.threadContent, keyboardShouldPersistTaps: "handled", onContentSizeChange: () => scrollToBottom(false), children: _jsx(View, { style: styles.turnList, children: turns.map((turn, index) => {
                                const hasFollowUpUserTurn = turns
                                    .slice(index + 1)
                                    .some((nextTurn) => nextTurn.role === "user");
                                return (_jsx(ChatWidgetTurn, { turn: turn, animate: turn.id ? enteringTurnIds.has(turn.id) : false, showSuggestedReplies: !hasFollowUpUserTurn }, turn.id));
                            }) }) }), showSuggestedPrompts ? (_jsx(SuggestedPromptChips, { prompts: config.suggestedPrompts, onSelect: (prompt) => sendMessage(prompt), colorScheme: colorScheme, disabled: inputLocked, align: "end", layout: "stack" })) : null] }), _jsxs(View, { style: { backgroundColor: threadBg }, children: [_jsx(PrivacyBanner, { config: config, colorScheme: colorScheme, dismissed: privacyDismissed, onDismiss: dismissPrivacy }), voiceError ? (_jsx(Text, { style: [styles.voiceError, { color: "#EF4444" }], children: voiceError })) : null, conversationResolved ? (_jsx(View, { style: [
                            styles.noticeBanner,
                            isDark ? styles.resolvedBannerDark : styles.resolvedBannerLight,
                        ], children: _jsx(Text, { style: [styles.noticeText, { color: isDark ? "#6EE7B7" : "#065F46" }], children: "\u2713 This conversation has been resolved. Start a new chat if you need more help." }) })) : sessionHandoffNotice ? (_jsx(View, { style: [
                            styles.noticeBanner,
                            isDark ? styles.handoffBannerDark : styles.handoffBannerLight,
                        ], children: _jsx(Text, { style: [styles.noticeText, { color: isDark ? "#FDE68A" : "#78350F" }], children: sessionHandoffNotice }) })) : (_jsx(SaasWidgetComposer, { value: input, onChange: setInput, onSend: () => sendMessage(), placeholder: config.placeholder || "Message…", disabled: inputLocked, config: config, colorScheme: colorScheme }))] })] }));
}
function isDarkSurface(colorScheme) {
    return colorScheme === "dark";
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
        overflow: "hidden",
        position: "relative",
    },
    launcherShell: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    errorText: {
        fontSize: 14,
        textAlign: "center",
    },
    threadColumn: {
        flex: 1,
        minHeight: 0,
    },
    thread: {
        flex: 1,
    },
    threadContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        flexGrow: 1,
    },
    turnList: {
        gap: 16,
    },
    voiceError: {
        fontSize: 11,
        textAlign: "center",
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    noticeBanner: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    resolvedBannerLight: {
        borderColor: "#A7F3D0",
        backgroundColor: "#ECFDF5",
    },
    resolvedBannerDark: {
        borderColor: "rgba(16,185,129,0.25)",
        backgroundColor: "rgba(6,78,59,0.30)",
    },
    handoffBannerLight: {
        borderColor: "#FDE68A",
        backgroundColor: "#FFFBEB",
    },
    handoffBannerDark: {
        borderColor: "rgba(217,119,6,0.30)",
        backgroundColor: "rgba(120,53,15,0.40)",
    },
    noticeText: {
        fontSize: 13,
        lineHeight: 19,
    },
});
