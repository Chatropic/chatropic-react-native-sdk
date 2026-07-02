import { jsx as _jsx } from "react/jsx-runtime";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { useChipEnterAnimation } from "../utils/chip-animations";
function AnimatedChip({ prompt, index, disabled, onSelect, chipStyle, textColor, }) {
    const animation = useChipEnterAnimation(index);
    return (_jsx(Animated.View, { style: animation.style, children: _jsx(Pressable, { disabled: disabled, onPress: () => onSelect(prompt), style: chipStyle, children: _jsx(Text, { style: [styles.chipText, { color: textColor }], children: prompt }) }) }));
}
export function SuggestedPromptChips({ prompts, onSelect, colorScheme, disabled, align = "end", layout = "stack", compact = false, }) {
    const surfaces = themeSurfaceColors(colorScheme);
    const isDark = colorScheme === "dark";
    if (!prompts.length)
        return null;
    const chipStyle = [
        styles.chip,
        {
            borderColor: surfaces.border,
            backgroundColor: isDark ? "#18181B" : "#FFFFFF",
            opacity: disabled ? 0.5 : 1,
        },
    ];
    if (layout === "wrap") {
        return (_jsx(View, { style: [
                styles.wrapRow,
                compact ? styles.compact : undefined,
                align === "end" ? styles.alignEnd : styles.alignStart,
            ], children: prompts.map((prompt, index) => (_jsx(AnimatedChip, { prompt: prompt, index: index, disabled: disabled, onSelect: onSelect, chipStyle: chipStyle, textColor: surfaces.foreground }, prompt))) }));
    }
    return (_jsx(View, { style: [
            styles.stack,
            compact ? styles.compact : undefined,
            align === "end" ? styles.alignEnd : styles.alignStart,
        ], children: prompts.map((prompt, index) => (_jsx(AnimatedChip, { prompt: prompt, index: index, disabled: disabled, onSelect: onSelect, chipStyle: chipStyle, textColor: surfaces.foreground }, prompt))) }));
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
