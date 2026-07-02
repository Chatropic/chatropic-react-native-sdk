import React from "react";
import type { ColorScheme, WidgetConfig } from "../types";
interface ComposerProps {
    value: string;
    onChange: (text: string) => void;
    onSend: () => void;
    placeholder: string;
    disabled: boolean;
    config: WidgetConfig;
    colorScheme: ColorScheme;
    inputBackground?: string;
}
export declare function Composer({ value, onChange, onSend, placeholder, disabled, config, colorScheme, inputBackground, }: ComposerProps): React.JSX.Element;
export {};
