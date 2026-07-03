import React, { useCallback, useEffect } from "react";
import { BackHandler, StatusBar, StyleSheet, View } from "react-native";
import type { ChatWidgetProps } from "../types";
import { ChatWidgetProvider, useChatWidget } from "../provider/ChatWidgetProvider";
import { ChatWidgetBody } from "./ChatWidgetBody";
import { glassPageBackdropColors } from "../theme/widget-glass";

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

/** Inner component rendered inside ChatWidgetProvider for themed fullscreen UI. */
function FullscreenContent({
  onBack,
}: {
  onBack?: () => void;
}) {
  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

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
      />
    </ChatWidgetProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
