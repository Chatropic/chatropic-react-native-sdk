import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { resolveWidgetBranding } from "../utils/branding";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";

interface AgentBubbleHeaderProps {
  config: WidgetConfig;
  colorScheme?: ColorScheme;
}

export function AgentBubbleHeader({
  config,
  colorScheme = "light",
}: AgentBubbleHeaderProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  const branding = resolveWidgetBranding(config);

  return (
    <View style={styles.row}>
      {branding.usePlatformLogo ? (
        <ChatropicBrandLogo colorScheme={colorScheme} size={16} />
      ) : (
        <Image source={{ uri: branding.logoUrl }} style={styles.logo} />
      )}
      <Text
        style={[styles.label, { color: surfaces.foreground }]}
        numberOfLines={1}
      >
        {branding.displayName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  logo: {
    width: 16,
    height: 16,
  },
  label: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
  },
});
