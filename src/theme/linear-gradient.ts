import type { ComponentType, ReactNode } from "react";
import type { ViewStyle } from "react-native";

export type LinearGradientComponent = ComponentType<{
  colors: string[];
  locations?: number[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  style?: ViewStyle;
  children?: ReactNode;
}>;

export function loadLinearGradient(): LinearGradientComponent | null {
  try {
    return require("expo-linear-gradient").LinearGradient as LinearGradientComponent;
  } catch {
    return null;
  }
}
