import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { ColorScheme } from "../types";

function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [anim]);
  return anim;
}

function ShimmerBar({
  width,
  height = 12,
  anim,
  isDark,
}: {
  width: number | `${number}%`;
  height?: number;
  anim: any;
  isDark: boolean;
}) {
  const baseColor = isDark ? "#2C2C2E" : "#E4E4E7";
  const highlightColor = isDark ? "#3A3A3C" : "#F4F4F5";

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseColor, highlightColor],
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        { width, height, borderRadius: height / 2, backgroundColor },
      ]}
    />
  );
}

function AgentShimmerTurn({
  anim,
  isDark,
  lines,
}: {
  anim: any;
  isDark: boolean;
  lines: Array<number | `${number}%`>;
}) {
  const avatarColor = isDark ? "#2C2C2E" : "#E4E4E7";
  const bubbleBg = isDark ? "#232325" : "#F0F0F0";

  return (
    <View style={styles.agentRow}>
      {/* Avatar */}
      <Animated.View style={[styles.avatar, { backgroundColor: avatarColor }]} />

      {/* Bubble */}
      <View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
        <View style={styles.lines}>
          {lines.map((w, i) => (
            <ShimmerBar key={i} width={w} height={12} anim={anim} isDark={isDark} />
          ))}
        </View>
      </View>
    </View>
  );
}

function UserShimmerTurn({
  anim,
  isDark,
  width,
}: {
  anim: any;
  isDark: boolean;
  width: `${number}%`;
}) {
  const bubbleBase = isDark ? "#3A3A3C" : "#D4D4D8";
  const bubbleHighlight = isDark ? "#4A4A4C" : "#E4E4E7";
  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [bubbleBase, bubbleHighlight],
  });

  return (
    <View style={styles.userRow}>
      <Animated.View
        style={[styles.userBubble, { width, backgroundColor }]}
      />
    </View>
  );
}

export function ShimmerThread({ colorScheme = "light" }: { colorScheme?: ColorScheme }) {
  const anim = useShimmer();
  const isDark = colorScheme === "dark";

  return (
    <View style={styles.thread}>
      <AgentShimmerTurn anim={anim} isDark={isDark} lines={["85%", "70%"]} />
      <UserShimmerTurn anim={anim} isDark={isDark} width="55%" />
      <AgentShimmerTurn anim={anim} isDark={isDark} lines={["90%", "78%", "40%"]} />
      <UserShimmerTurn anim={anim} isDark={isDark} width="45%" />
      <AgentShimmerTurn anim={anim} isDark={isDark} lines={["80%", "60%"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  thread: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    flex: 1,
    maxWidth: "88%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lines: {
    gap: 8,
  },
  bar: {
    borderRadius: 6,
  },
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    height: 36,
    borderRadius: 18,
  },
});
