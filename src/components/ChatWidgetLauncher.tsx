import React, { useEffect, useState, useCallback } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ChatWidgetProps } from "../types";
import { ChatWidgetProvider } from "../provider/ChatWidgetProvider";
import { ChatWidgetBody } from "./ChatWidgetBody";
import { WidgetLauncherIcon } from "./WidgetLauncherIcon";
import { signalChatClosed } from "../client/conversation-messages";
import { mergeWidgetConfig, createChatSessionId, logoLetter } from "../utils/session";
import { useBottomSafeInset } from "../utils/safe-area";
import { glassSurfaces } from "../theme/widget-glass";
import { applyThemeToWidgetConfig, resolveWidgetColorScheme } from "../theme/resolve-colors";
import { launcherButtonStyle } from "../theme/launcher-assets";
import {
  useLauncherBubbleAnimation,
  useWidgetSheetAnimation,
} from "../utils/widget-animations";

export function ChatWidgetLauncher(props: ChatWidgetProps) {
  const bottomInset = useBottomSafeInset();
  const [open, setOpen] = useState(false);
  const hadUserTurnRef = React.useRef(false);
  const [sessionId, setSessionId] = useState(
    () => props.sessionId ?? createChatSessionId("rn"),
  );
  const iconRotation = React.useRef(new Animated.Value(0)).current;
  const { mounted, backdropOpacity, panelTranslateY, panelScale } =
    useWidgetSheetAnimation(open);
  const bubbleAnimation = useLauncherBubbleAnimation(open);

  const handleSessionRotate = useCallback((nextSessionId: string) => {
    setSessionId(nextSessionId);
    hadUserTurnRef.current = false;
  }, []);

  useEffect(() => {
    Animated.spring(iconRotation, {
      toValue: open ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 260,
      mass: 0.7,
    }).start();
  }, [iconRotation, open]);

  useEffect(() => {
    if (props.sessionId !== undefined) {
      setSessionId(props.sessionId);
    }
  }, [props.sessionId]);

  const handleClose = () => {
    if (hadUserTurnRef.current) {
      signalChatClosed(props.tenantId, sessionId, {
        productId: "customer_support",
        apiKey: props.publishableKey,
      });
    }
    setOpen(false);
  };

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (!next) {
        if (hadUserTurnRef.current) {
          signalChatClosed(props.tenantId, sessionId, {
              productId: "customer_support",
            apiKey: props.publishableKey,
          });
        }
      } else if (props.sessionId === undefined) {
        setSessionId(createChatSessionId("rn"));
        hadUserTurnRef.current = false;
      }
      return next;
    });
  };

  const baseConfig = mergeWidgetConfig();
  const colorScheme = resolveWidgetColorScheme(baseConfig);
  const config = applyThemeToWidgetConfig(baseConfig, colorScheme);
  const letter = logoLetter(config.displayName || "Chat");
  const launcherStyle = launcherButtonStyle(config, colorScheme);
  const glass = glassSurfaces(colorScheme);
  const iconSpin = iconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.bubble,
          bubbleAnimation.style,
          {
            bottom: 24 + bottomInset,
            backgroundColor: launcherStyle.backgroundColor,
          },
        ]}
      >
        <Pressable
          onPress={toggleOpen}
          style={styles.bubblePressable}
          accessibilityLabel={open ? "Close chat" : "Open chat"}
        >
          <Animated.View
            style={{
              transform: [{ rotate: iconSpin }, { scale: iconRotation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.92],
              }) }],
            }}
          >
            {open ? (
              <Text style={[styles.closeIcon, { color: launcherStyle.color }]}>✕</Text>
            ) : (
              <WidgetLauncherIcon colorScheme={colorScheme} size={28} />
            )}
          </Animated.View>
          {!open ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{letter}</Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>

      <Modal
        visible={mounted}
        animationType="none"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.backdropTint, { opacity: backdropOpacity }]}
          />
          <Animated.View
            style={[
              styles.panel,
              {
                backgroundColor: glass.shell,
                borderColor: glass.shellBorder,
                borderWidth: 1,
                shadowColor: glass.shadow,
                transform: [{ translateY: panelTranslateY }, { scale: panelScale }],
              },
            ]}
          >
            <ChatWidgetProvider
              {...props}
              profile={props.profile ?? "mobile"}
              sessionId={sessionId}
              onSessionRotate={handleSessionRotate}
              onUserMessage={(text) => {
                hadUserTurnRef.current = true;
                props.onUserMessage?.(text);
              }}
            >
              <ChatWidgetBody
                variant="launcher"
                onClose={handleClose}
              />
            </ChatWidgetProvider>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    zIndex: 9999,
  },
  bubblePressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 22,
    fontWeight: "400",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#18181B",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropTint: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  panel: {
    height: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
});
