import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import { themeSurfaceColors, userBubbleStyle } from "../theme/resolve-colors";
import { glassSurfaces } from "../theme/widget-glass";
import { ChatMarkdown } from "./ChatMarkdown";
import { useThinkingDotAnimation } from "../utils/widget-animations";

function StreamingCursor({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
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
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.cursor, { backgroundColor: color, opacity }]} />;
}

interface MessageBubbleProps {
  role: "user" | "agent";
  text: string;
  running?: boolean;
  config: WidgetConfig;
  colorScheme: ColorScheme;
}

function agentCardColors(
  config: WidgetConfig,
  colorScheme: ColorScheme,
): { backgroundColor: string; borderColor: string; color: string } {
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

export function MessageBubble({
  role,
  text,
  running = false,
  config,
  colorScheme,
}: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    const userStyle = userBubbleStyle(config, colorScheme);
    const glass = glassSurfaces(colorScheme);
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View
          style={[
            styles.bubble,
            styles.userBubble,
            { backgroundColor: userStyle.backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.userText,
              {
                color:
                  colorScheme === "dark"
                    ? glass.userBubbleText
                    : userStyle.color,
              },
            ]}
          >
            {text}
          </Text>
        </View>
      </View>
    );
  }

  const agentStyle = agentCardColors(config, colorScheme);
  const agentRadius =
    colorScheme === "dark"
      ? styles.agentCardDarkRadius
      : styles.agentCardLightRadius;

  return (
    <View style={[styles.row, styles.rowAgent]}>
      <View
        style={[
          styles.agentCard,
          agentRadius,
          {
            backgroundColor: agentStyle.backgroundColor,
            borderColor: agentStyle.borderColor,
          },
        ]}
      >
        <View style={styles.agentTextRow}>
          <View style={{ flexShrink: 1 }}><ChatMarkdown content={text} color={agentStyle.color} /></View>
          {running && <StreamingCursor color={agentStyle.color} />}
        </View>
      </View>
    </View>
  );
}

export function ThinkingBubble({
  config,
  colorScheme,
  label = "Thinking…",
}: {
  config: WidgetConfig;
  colorScheme: ColorScheme;
  label?: string;
}) {
  const surfaces = themeSurfaceColors(colorScheme);
  const card = agentCardColors(config, colorScheme);
  const agentRadius =
    colorScheme === "dark"
      ? styles.agentCardDarkRadius
      : styles.agentCardLightRadius;

  return (
    <View style={[styles.row, styles.rowAgent]}>
      <View
        style={[
          styles.agentCard,
          agentRadius,
          {
            backgroundColor: card.backgroundColor,
            borderColor: card.borderColor,
          },
        ]}
      >
        <View style={styles.thinkingRow}>
          <View style={styles.dots}>
            <ThinkingDot color={surfaces.muted} delayMs={0} />
            <ThinkingDot color={surfaces.muted} delayMs={150} />
            <ThinkingDot color={surfaces.muted} delayMs={300} />
          </View>
          <Text style={[styles.thinkingText, { color: surfaces.muted }]}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ThinkingDot({ color, delayMs }: { color: string; delayMs: number }) {
  const animation = useThinkingDotAnimation(delayMs);
  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color }, animation.style]}
    />
  );
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
    maxWidth: "88%",
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
    maxWidth: "100%",
    alignSelf: "flex-start",
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  agentText: {
    fontSize: 13,
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
