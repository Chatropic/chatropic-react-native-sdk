import React from "react";
import type { ColorScheme, WidgetConfig } from "../types";
interface WidgetHeaderProps {
    config: WidgetConfig;
    colorScheme?: ColorScheme;
    onClose?: () => void;
    onBack?: () => void;
    showMenu?: boolean;
    topInset?: number;
    conversationResolved?: boolean;
}
export declare function WidgetHeader({ config, colorScheme, onClose, onBack, showMenu, topInset, conversationResolved, }: WidgetHeaderProps): React.JSX.Element;
export {};
