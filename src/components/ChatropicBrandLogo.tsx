import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
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
}

function ChatropicLogoFallback({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor: "#18181B",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.55,
          fontWeight: "700",
        }}
      >
        C
      </Text>
    </View>
  );
}

function ChatropicLogoSvg({
  variant,
  size,
}: {
  variant: "light" | "dark";
  size: number;
}) {
  const isDark = variant === "dark";
  const backgroundColor = isDark ? "#FAFAF9" : "#0A0A0A";
  const foregroundColor = isDark ? "#0A0A0A" : "#FAFAF9";

  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.glyphBar,
          {
            width: size * 0.44,
            height: size * 0.48,
            left: size * 0.28,
            top: size * 0.26,
            backgroundColor: foregroundColor,
          },
        ]}
      />
      <View
        style={[
          styles.glyphCutout,
          {
            width: size * 0.28,
            height: size * 0.2,
            right: size * 0.16,
            top: size * 0.4,
            backgroundColor,
          },
        ]}
      />
    </View>
  );
}

export function ChatropicBrandLogo({
  colorScheme = "light",
  size = 16,
  style,
}: ChatropicBrandLogoProps) {
  const variant = chatropicLogoVariant(colorScheme);

  return (
    <View style={style}>
      <ChatropicLogoSvg variant={variant} size={size} />
    </View>
  );
}

export { ChatropicLogoFallback };

const styles = StyleSheet.create({
  logo: {
    overflow: "hidden",
  },
  glyphBar: {
    position: "absolute",
  },
  glyphCutout: {
    position: "absolute",
  },
});
