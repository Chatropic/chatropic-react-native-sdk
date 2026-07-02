import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { WidgetConfig } from "../types";
import { primaryAccentColor } from "../theme/resolve-colors";

interface AccentBackgroundProps {
  config: WidgetConfig;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function AccentBackground({
  config,
  style,
  children,
}: AccentBackgroundProps) {
  return (
    <View style={[style, { backgroundColor: primaryAccentColor(config) }]}>
      {children}
    </View>
  );
}

export function accentBubbleStyle(config: WidgetConfig): ViewStyle {
  return { backgroundColor: primaryAccentColor(config) };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

export function AccentHighlightOverlay() {
  return <View style={styles.overlay} pointerEvents="none" />;
}
