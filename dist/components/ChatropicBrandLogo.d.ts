import React from "react";
import { type ViewStyle } from "react-native";
import type { ColorScheme } from "../types";
/** Matches playground `chatropicLogoSrc(isDarkSurface)`. */
export declare function chatropicLogoVariant(colorScheme: ColorScheme): "light" | "dark";
interface ChatropicBrandLogoProps {
    colorScheme?: ColorScheme;
    size?: number;
    style?: ViewStyle;
}
declare function ChatropicLogoFallback({ size }: {
    size: number;
}): React.JSX.Element;
export declare function ChatropicBrandLogo({ colorScheme, size, style, }: ChatropicBrandLogoProps): React.JSX.Element;
export { ChatropicLogoFallback };
