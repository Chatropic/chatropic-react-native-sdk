import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PressableStateCallbackType } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { ColorScheme } from "../types";
import { formatRelativeTime } from "../utils/format-time";
import { submitMessageFeedback } from "../client/stream-chat";

function ThumbsUpIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      <Path d="M7 10v12" />
    </Svg>
  );
}

function ThumbsDownIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
      <Path d="M17 14V2" />
    </Svg>
  );
}

interface AgentFeedbackRowProps {
  timestamp?: number;
  colorScheme?: ColorScheme;
  sessionId?: string;
  turnId?: string;
  agentUrl?: string;
  tenantId?: string;
  apiKey?: string;
  productId?: string;
}

export function AgentFeedbackRow({
  timestamp,
  colorScheme = "light",
  sessionId,
  turnId,
  agentUrl,
  tenantId,
  apiKey,
  productId,
}: AgentFeedbackRowProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const isDark = colorScheme === "dark";

  const submitFeedback = useCallback(
    async (positive: boolean) => {
      if (!sessionId?.trim() || !agentUrl || !apiKey || !productId) return;
      await submitMessageFeedback(agentUrl, tenantId, productId, sessionId, turnId, positive, apiKey);
    },
    [agentUrl, tenantId, apiKey, productId, sessionId, turnId],
  );

  if (!timestamp) return null;

  const mutedColor = isDark ? "#8E9297" : "#A1A1AA";
  const activeColor = isDark ? "#FFFFFF" : "#18181B";

  return (
    <View style={styles.row}>
      <Text style={[styles.time, { color: mutedColor }]}>
        {formatRelativeTime(timestamp)}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Helpful"
          onPress={() => {
            const next = vote === "up" ? null : "up";
            setVote(next);
            if (next === "up") void submitFeedback(true);
          }}
          style={({ pressed }: PressableStateCallbackType) => [styles.voteBtn, pressed && styles.pressed]}
        >
          <ThumbsUpIcon color={vote === "up" ? activeColor : mutedColor} />
        </Pressable>
        <Pressable
          accessibilityLabel="Not helpful"
          onPress={() => {
            const next = vote === "down" ? null : "down";
            setVote(next);
            if (next === "down") void submitFeedback(false);
          }}
          style={({ pressed }: PressableStateCallbackType) => [styles.voteBtn, pressed && styles.pressed]}
        >
          <ThumbsDownIcon color={vote === "down" ? activeColor : mutedColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    paddingLeft: 2,
    width: "100%",
  },
  time: {
    fontSize: 11,
  },
  actions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  voteBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.6,
  },
});
