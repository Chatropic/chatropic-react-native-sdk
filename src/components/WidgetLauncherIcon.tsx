import React from "react";
import type { ColorScheme } from "../types";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";

interface WidgetLauncherIconProps {
  colorScheme: ColorScheme;
  size?: number;
  color?: string;
}

export function WidgetLauncherIcon({
  colorScheme,
  size = 28,
  color,
}: WidgetLauncherIconProps) {
  return <ChatropicBrandLogo colorScheme={colorScheme} size={size} color={color} />;
}
