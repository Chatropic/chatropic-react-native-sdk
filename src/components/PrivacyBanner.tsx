import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
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
    <View style={styles.banner}>
      <Text style={[styles.text, { color: surfaces.muted }]}>
        {config.privacyNoticeText}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss privacy notice">
        <Text style={[styles.dismiss, { color: surfaces.muted }]}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  text: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  dismiss: {
    fontSize: 14,
    padding: 4,
  },
});
