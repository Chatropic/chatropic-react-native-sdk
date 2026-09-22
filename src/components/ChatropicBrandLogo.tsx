import React from "react";
import { View, type ViewStyle } from "react-native";
import Svg, { Circle, G, Rect } from "react-native-svg";
import type { ColorScheme } from "../types";

/** Matches playground `chatropicLogoSrc(isDarkSurface)`. */
export function chatropicLogoVariant(
  colorScheme: ColorScheme,
): "light" | "dark" {
  return colorScheme === "dark" ? "dark" : "light";
}

interface ChatropicBrandLogoProps {
  colorScheme?: ColorScheme;
  size?: number;
  style?: ViewStyle;
  /** Override the ink when the mark sits on a launcher surface. */
  color?: string;
}

/** Shared vector from the web widget's chatropic-mark light/dark assets. */
export function ChatropicBrandLogo({
  colorScheme = "light",
  size = 16,
  style,
  color,
}: ChatropicBrandLogoProps) {
  const ink = color ?? (chatropicLogoVariant(colorScheme) === "dark" ? "#F2F1EB" : "#171410");

  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
        <G fill={ink} transform="translate(2.2 -2.2)">
          <Rect x={10} y={51.2} width={66} height={11.6} />
          <Rect x={10} y={51.2} width={66} height={11.6} transform="rotate(90 43 57)" />
          <Rect x={10} y={51.2} width={66} height={11.6} transform="rotate(45 43 57)" />
          <Rect x={10} y={51.2} width={66} height={11.6} transform="rotate(135 43 57)" />
          <Circle cx={78} cy={22} r={7.6} />
        </G>
      </Svg>
    </View>
  );
}

/** Retained for compatibility; fallback uses the current mark too. */
export function ChatropicLogoFallback(props: ChatropicBrandLogoProps) {
  return <ChatropicBrandLogo {...props} />;
}
