import React from "react";
import { type ViewStyle } from "react-native";
import type { WidgetConfig } from "../types";
interface AccentBackgroundProps {
    config: WidgetConfig;
    style?: ViewStyle;
    children?: React.ReactNode;
}
export declare function AccentBackground({ config, style, children, }: AccentBackgroundProps): React.JSX.Element;
export declare function accentBubbleStyle(config: WidgetConfig): ViewStyle;
export declare function AccentHighlightOverlay(): React.JSX.Element;
export {};
