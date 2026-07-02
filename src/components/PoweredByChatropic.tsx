import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ColorScheme } from "../types";
import { PLATFORM_POWERED_BY_LABEL } from "../utils/defaults";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";

interface PoweredByChatropicProps {
  colorScheme?: ColorScheme;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function PoweredByChatropic({
  colorScheme = "light",
  label = PLATFORM_POWERED_BY_LABEL,
  style,
}: PoweredByChatropicProps) {
  const surfaces = themeSurfaceColors(colorScheme);

  return (
    <View style={[styles.row, style]}>
      <ChatropicBrandLogo colorScheme={colorScheme} size={16} />
      <Text style={[styles.label, { color: surfaces.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  label: {
    fontSize: 10,
  },
});
