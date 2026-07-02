import React from "react";
import type { ColorScheme, WidgetConfig } from "../types";
interface MessageBubbleProps {
    role: "user" | "agent";
    text: string;
    running?: boolean;
    config: WidgetConfig;
    colorScheme: ColorScheme;
}
export declare function MessageBubble({ role, text, running, config, colorScheme, }: MessageBubbleProps): React.JSX.Element;
export declare function ThinkingBubble({ config, colorScheme, label, }: {
    config: WidgetConfig;
    colorScheme: ColorScheme;
    label?: string;
}): React.JSX.Element;
export {};
