import React, { useCallback, useEffect } from "react";
import { BackHandler, StatusBar, StyleSheet, View } from "react-native";
import type { ChatWidgetProps } from "../types";
import { ChatWidgetProvider, useChatWidget } from "../provider/ChatWidgetProvider";
import { ChatWidgetBody } from "./ChatWidgetBody";
import { glassPageBackdropColors } from "../theme/widget-glass";
import { signalChatClosed } from "../client/conversation-messages";

function FullscreenStatusBar() {
  const { config, colorScheme } = useChatWidget();
  const barStyle = colorScheme === "dark" ? "light-content" : "dark-content";

  return <StatusBar barStyle={barStyle} />;
}

function GlassBackdrop({ children }: { children: React.ReactNode }) {
  const { config, colorScheme } = useChatWidget();
  const backdrop = glassPageBackdropColors(colorScheme, config.userBubbleColor);

  return (
    <View style={[styles.root, { backgroundColor: backdrop.backgroundColor }]}>
      {children}
    </View>
  );
}

/**
 * Inner component — rendered inside ChatWidgetProvider so it can read the
 * live sessionId from context, which may differ from the prop when the
 * provider auto-generates or rotates the session.
 */
function FullscreenContent({
  onBack,
  tenantId,
  apiKey,
  productId,
}: {
  onBack?: () => void;
  tenantId?: string;
  apiKey?: string;
  productId?: string;
}) {
  const { sessionId, turns } = useChatWidget();

  const handleBack = useCallback(() => {
    // Only signal resolution if there were real user turns in this session.
    const hasUserTurns = turns.some((t) => t.role === "user");
    if (hasUserTurns) {
      signalChatClosed(tenantId, sessionId, { productId, apiKey });
    }
    onBack?.();
  }, [onBack, tenantId, apiKey, sessionId, productId, turns]);

  const onHardwareBack = useCallback(() => {
    handleBack();
    // Always consume the event — fullscreen chat owns the back action.
    return true;
  }, [handleBack]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [onHardwareBack]);

  return (
    <GlassBackdrop>
      <FullscreenStatusBar />
      <ChatWidgetBody variant="fullscreen" onBack={handleBack} />
    </GlassBackdrop>
  );
}

export function ChatWidgetScreen(props: ChatWidgetProps) {
  return (
    <ChatWidgetProvider {...props} profile={props.profile ?? "mobile"}>
      <FullscreenContent
        onBack={props.onBack}
        tenantId={props.tenantId}
        apiKey={props.publishableKey}
        productId="customer_support"
      />
    </ChatWidgetProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
