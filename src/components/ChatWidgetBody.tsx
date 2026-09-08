import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import {
  resolveSaasThreadBackground,
  themeSurfaceColors,
} from "../theme/resolve-colors";
import { ChatWidgetTurn } from "./ChatWidgetTurn";
import { SuggestedPromptChips } from "./SuggestedPromptChips";
import { WidgetComposer } from "./SaasWidgetComposer";
import { RecentChats } from "./RecentChats";
import { WidgetHeader } from "./WidgetHeader";
import { VoicePanel } from "./VoicePanel";
import { ShimmerThread } from "./ShimmerThread";
import { useTopSafeInset } from "../utils/safe-area";
import { useEnteringTurnIds } from "../utils/widget-animations";

interface ChatWidgetBodyProps {
  variant?: "launcher" | "fullscreen";
  onClose?: () => void;
  onBack?: () => void;
}

export function ChatWidgetBody(props: ChatWidgetBodyProps) {
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ChatWidgetContent {...props} />
  </KeyboardAvoidingView>;
}

function ChatWidgetContent({
  variant = "launcher",
  onClose,
  onBack,
}: ChatWidgetBodyProps) {
  const {
    config,
    colorScheme,
    turns,
    input,
    setInput,
    sendMessage,
    resetChat,
    canChangeSession,
    inputLocked,
    loading,
    error,
    voiceActive,
    voiceState,
    voiceTranscript,
    voiceError,
    endVoiceSession,
    conversationResolved,
    sessionHandoffNotice,
  } = useChatWidget();

  const [showRecentChats, setShowRecentChats] = useState(false);
  const topInset = useTopSafeInset();
  const scrollRef = useRef<ScrollView>(null);
  const surfaces = themeSurfaceColors(colorScheme);
  const isDark = colorScheme === "dark";
  const threadBg =
    variant === "fullscreen" || variant === "launcher"
      ? resolveSaasThreadBackground(config, colorScheme)
      : surfaces.background;
  const showHeader = config.showHeader !== false;
  const hasUserTurn = turns.some((turn) => turn.role === "user");
  const showSuggestedPrompts =
    config.suggestedPrompts.length > 0 && !hasUserTurn && !inputLocked;

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
    return (
      <View
        style={[
          styles.root,
          variant === "launcher" ? styles.launcherShell : undefined,
          { backgroundColor: variant === "launcher" ? "transparent" : threadBg },
        ]}
      >
        {showHeader ? (
          <WidgetHeader
            config={config}
            colorScheme={colorScheme}
            onClose={handleClose}
            onBack={variant === "fullscreen" ? handleBack : undefined}
            topInset={variant === "fullscreen" ? topInset : 0}
            showMenu={false}
          />
        ) : null}
        <View style={[styles.threadColumn, { backgroundColor: threadBg }]}>
          <ShimmerThread colorScheme={colorScheme} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: threadBg }]}>
        <Text style={[styles.errorText, { color: surfaces.foreground }]}>
          {error}
        </Text>
      </View>
    );
  }

  const voiceMode = config.showVoice && voiceActive && !inputLocked;

  if (voiceMode) {
    return (
      <View
        style={[
          styles.root,
          variant === "launcher" ? styles.launcherShell : undefined,
          { backgroundColor: isDarkSurface(colorScheme) ? "#09090B" : "#FFFFFF" },
        ]}
      >
        <VoicePanel
          active={voiceActive}
          state={voiceState}
          transcript={voiceTranscript}
          error={voiceError}
          onEnd={endVoiceSession}
          config={config}
          assistantName={config.displayName}
          colorScheme={colorScheme}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        variant === "launcher" ? styles.launcherShell : undefined,
        { backgroundColor: variant === "launcher" ? "transparent" : threadBg },
      ]}
    >
      <View style={{ flex: 1, display: showRecentChats ? "none" : "flex" }}>
        {showHeader ? (
          <WidgetHeader
            config={config}
            colorScheme={colorScheme}
            onClose={handleClose}
            onBack={variant === "fullscreen" ? handleBack : undefined}
            topInset={variant === "fullscreen" ? topInset : 0}
            showMenu={canChangeSession}
            onMenu={() => setShowRecentChats(true)}
            conversationResolved={conversationResolved}
          />
        ) : null}

        <View style={[styles.threadColumn, { backgroundColor: threadBg }]}>
          <ScrollView
            ref={scrollRef}
            style={styles.thread}
            contentContainerStyle={styles.threadContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToBottom(false)}
          >
            <View style={styles.turnList}>
              {turns.map((turn, index) => {
                const hasFollowUpUserTurn = turns
                  .slice(index + 1)
                  .some((nextTurn) => nextTurn.role === "user");
                return (
                  <ChatWidgetTurn
                    key={turn.id}
                    turn={turn}
                    animate={turn.id ? enteringTurnIds.has(turn.id) : false}
                    showSuggestedReplies={!hasFollowUpUserTurn}
                  />
                );
              })}
            </View>
          </ScrollView>

          {showSuggestedPrompts ? (
            <SuggestedPromptChips
              prompts={config.suggestedPrompts}
              onSelect={(prompt) => sendMessage(prompt)}
              colorScheme={colorScheme}
              disabled={inputLocked}
              align="end"
              layout="stack"
            />
          ) : null}

        </View>

        <View style={{ backgroundColor: threadBg }}>
          {voiceError ? (
            <Text style={[styles.voiceError, { color: "#EF4444" }]}>{voiceError}</Text>
          ) : null}
          {conversationResolved ? (
            <View
              style={[
                styles.noticeBanner,
                isDark ? styles.resolvedBannerDark : styles.resolvedBannerLight,
              ]}
            >
              <Text style={[styles.noticeText, { color: isDark ? "#6EE7B7" : "#065F46" }]}>
                ✓ This conversation has been resolved. Start a new chat if you need more help.
              </Text>
            </View>
          ) : sessionHandoffNotice ? (
            <View
              style={[
                styles.noticeBanner,
                isDark ? styles.handoffBannerDark : styles.handoffBannerLight,
              ]}
            >
              <Text style={[styles.noticeText, { color: isDark ? "#FDE68A" : "#78350F" }]}>
                {sessionHandoffNotice}
              </Text>
            </View>
          ) : (
            <WidgetComposer
              value={input}
              onChange={setInput}
              onSend={() => sendMessage()}
              placeholder={config.placeholder || "Message…"}
              disabled={inputLocked}
              config={config}
              colorScheme={colorScheme}
            />
          )}
        </View>
      </View>
      {showRecentChats ? <View style={{ flex: 1 }}>
        <WidgetHeader config={config} colorScheme={colorScheme} title="Recent chats" history
          onBack={() => setShowRecentChats(false)} onClose={handleClose}
          topInset={variant === "fullscreen" ? topInset : 0} showMenu={false} />
        <RecentChats onSelect={() => setShowRecentChats(false)} onStartNew={() => { resetChat(); setShowRecentChats(false); }} />
      </View> : null}
    </View>
  );
}

function isDarkSurface(colorScheme: ReturnType<typeof useChatWidget>["colorScheme"]) {
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
