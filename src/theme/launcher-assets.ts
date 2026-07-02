import type { ColorScheme, WidgetConfig } from "../types";
import { textColorForBubble } from "./colors";
import {
  resolvePrimaryColor,
  resolveThreadColor,
} from "./resolve-colors";

export function launcherButtonBackground(
  config: WidgetConfig,
  colorScheme: ColorScheme,
): string {
  return colorScheme === "dark"
    ? resolvePrimaryColor(config)
    : resolveThreadColor(config, colorScheme);
}

export function launcherButtonStyle(
  config: WidgetConfig,
  colorScheme: ColorScheme,
): { backgroundColor: string; color: string } {
  const backgroundColor = launcherButtonBackground(config, colorScheme);
  return {
    backgroundColor,
    color: textColorForBubble(backgroundColor),
  };
}
