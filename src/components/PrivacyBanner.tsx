import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import { ChatIcon } from "./ChatIcon";
import { themeSurfaceColors } from "../theme/resolve-colors";

interface PrivacyBannerProps {
  config: WidgetConfig;
  colorScheme: ColorScheme;
  dismissed: boolean;
  onDismiss: () => void;
}

export function PrivacyBanner({
  config,
  colorScheme,
  dismissed,
  onDismiss,
}: PrivacyBannerProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  if (!config.showPrivacyNotice || dismissed || !config.privacyNoticeText) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: colorScheme === "dark" ? "#27272A" : "#F4F4F5" }]}>
      <Text style={[styles.text, { color: surfaces.muted }]}>
        {config.privacyNoticeText}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss privacy notice">
        <ChatIcon name="close" color={surfaces.muted} size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: -26,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 38,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  dismiss: {
    fontSize: 14,
    padding: 4,
  },
});
