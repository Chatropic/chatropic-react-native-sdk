import React from "react";
import { Text, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
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
  if (variant === "dark") {
    return (
      <Svg width={size} height={size} viewBox="0 0 133 133">
        <Path
          d="M95.76 7.98H37.24C21.0802 7.98 7.98001 21.0801 7.98001 37.24V95.76C7.98001 111.92 21.0802 125.02 37.24 125.02H95.76C111.92 125.02 125.02 111.92 125.02 95.76V37.24C125.02 21.0801 111.92 7.98 95.76 7.98Z"
          fill="#0A0A0A"
        />
        <Path
          d="M99.75 0H33.25C14.8865 0 0 14.8865 0 33.25V99.75C0 118.113 14.8865 133 33.25 133H99.75C118.113 133 133 118.113 133 99.75V33.25C133 14.8865 118.113 0 99.75 0Z"
          fill="#FAFAF9"
        />
        <Path
          d="M37.24 34.58H95.76L75.81 54.53H57.19V78.47H75.81L95.76 98.42H37.24V34.58Z"
          fill="#0A0A0A"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 133 133">
      <Path
        d="M95.76 7.98H37.24C21.0802 7.98 7.98001 21.0801 7.98001 37.24V95.76C7.98001 111.92 21.0802 125.02 37.24 125.02H95.76C111.92 125.02 125.02 111.92 125.02 95.76V37.24C125.02 21.0801 111.92 7.98 95.76 7.98Z"
        fill="#0A0A0A"
      />
      <Path
        d="M99.75 0H33.25C14.8865 0 0 14.8865 0 33.25V99.75C0 118.113 14.8865 133 33.25 133H99.75C118.113 133 133 118.113 133 99.75V33.25C133 14.8865 118.113 0 99.75 0Z"
        fill="#0A0A0A"
      />
      <Path
        d="M37.24 34.58H95.76L75.81 54.53H57.19V78.47H75.81L95.76 98.42H37.24V34.58Z"
        fill="#FAFAF9"
      />
    </Svg>
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
