import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { primaryAccentColor } from "../theme/resolve-colors";
const BAR_COUNT = 5;
function barTiming(state, index) {
    const center = (BAR_COUNT - 1) / 2;
    const distance = Math.abs(index - center) / Math.max(center, 1);
    const duration = state === "speaking"
        ? 420 + distance * 120
        : state === "listening"
            ? 620 + distance * 140
            : 950 + distance * 100;
    const delay = index * 90;
    return { duration, delay };
}
export function VoiceWaveform({ state, config, size = "lg", }) {
    const active = state === "listening" ||
        state === "speaking" ||
        state === "thinking" ||
        state === "connecting";
    const barWidth = size === "lg" ? 10 : 7;
    const barHeight = size === "lg" ? 88 : 56;
    const gap = size === "lg" ? 12 : 8;
    const fillColor = state === "error" ? "#F87171" : primaryAccentColor(config);
    const scales = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.32))).current;
    useEffect(() => {
        const animations = scales.map((scale, index) => {
            const timing = barTiming(state, index);
            if (!active) {
                return Animated.timing(scale, {
                    toValue: 0.32,
                    duration: 250,
                    useNativeDriver: true,
                });
            }
            return Animated.loop(Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1,
                    duration: timing.duration,
                    delay: timing.delay,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.28,
                    duration: timing.duration,
                    useNativeDriver: true,
                }),
            ]));
        });
        animations.forEach((animation) => animation.start());
        return () => {
            animations.forEach((animation) => animation.stop());
        };
    }, [active, scales, state]);
    return (_jsx(View, { style: [styles.row, { gap }], accessibilityLabel: "Voice activity", children: scales.map((scale, index) => (_jsx(Animated.View, { style: [
                styles.bar,
                {
                    width: barWidth,
                    height: barHeight,
                    backgroundColor: fillColor,
                    opacity: active ? 1 : 0.35,
                    transform: [{ scaleY: scale }],
                },
            ] }, index))) }));
}
const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    bar: {
        borderRadius: 999,
    },
});
