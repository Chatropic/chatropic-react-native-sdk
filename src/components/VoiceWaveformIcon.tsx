import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const BAR_WIDTH = 3;
const GAP = 3;
const IDLE_HEIGHTS = [8, 14, 8];
const ACTIVE_DELAYS = [0, 120, 240, 120];

function ActiveBar({ delayMs }: { delayMs: number }) {
  const scale = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          delay: delayMs,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.45,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [delayMs, scale]);

  return (
    <Animated.View
      style={[
        styles.bar,
        styles.activeBar,
        { transform: [{ scaleY: scale }] },
      ]}
    />
  );
}

interface VoiceWaveformIconProps {
  active?: boolean;
  color?: string;
}

/** Chatbase-style live voice waveform button icon (matches SaaS composer). */
export function VoiceWaveformIcon({
  active = false,
  color = "#FFFFFF",
}: VoiceWaveformIconProps) {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no">
      {active ? (
        ACTIVE_DELAYS.map((delay, index) => (
          <ActiveBar key={index} delayMs={delay} />
        ))
      ) : (
        IDLE_HEIGHTS.map((height, index) => (
          <View
            key={index}
            style={[styles.bar, { height, backgroundColor: color }]}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: GAP,
    minWidth: 20,
    minHeight: 14,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  activeBar: {
    height: 14,
  },
});
