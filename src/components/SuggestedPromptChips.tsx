import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import type { ColorScheme } from "../types";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { useChipEnterAnimation } from "../utils/chip-animations";

interface SuggestedPromptChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  colorScheme: ColorScheme;
  disabled?: boolean;
  align?: "start" | "end";
  layout?: "stack" | "wrap";
  compact?: boolean;
}

function AnimatedChip({
  prompt,
  index,
  disabled,
  onSelect,
  chipStyle,
  textColor,
}: {
  prompt: string;
  index: number;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
  chipStyle: object[];
  textColor: string;
}) {
  const animation = useChipEnterAnimation(index);
  return (
    <Animated.View style={animation.style}>
      <Pressable
        disabled={disabled}
        onPress={() => onSelect(prompt)}
        style={chipStyle}
      >
        <Text style={[styles.chipText, { color: textColor }]}>{prompt}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SuggestedPromptChips({
  prompts,
  onSelect,
  colorScheme,
  disabled,
  align = "end",
  layout = "stack",
  compact = false,
}: SuggestedPromptChipsProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  const isDark = colorScheme === "dark";
  if (!prompts.length) return null;

  const chipStyle = [
    styles.chip,
    {
      borderColor: surfaces.border,
      backgroundColor: isDark ? "#18181B" : "#FFFFFF",
      opacity: disabled ? 0.5 : 1,
    },
  ];

  if (layout === "wrap") {
    return (
      <View
        style={[
          styles.wrapRow,
          compact ? styles.compact : undefined,
          align === "end" ? styles.alignEnd : styles.alignStart,
        ]}
      >
        {prompts.map((prompt, index) => (
          <AnimatedChip
            key={prompt}
            prompt={prompt}
            index={index}
            disabled={disabled}
            onSelect={onSelect}
            chipStyle={chipStyle}
            textColor={surfaces.foreground}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.stack,
        compact ? styles.compact : undefined,
        align === "end" ? styles.alignEnd : styles.alignStart,
      ]}
    >
      {prompts.map((prompt, index) => (
        <AnimatedChip
          key={prompt}
          prompt={prompt}
          index={index}
          disabled={disabled}
          onSelect={onSelect}
          chipStyle={chipStyle}
          textColor={surfaces.foreground}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  compact: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: "92%",
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
