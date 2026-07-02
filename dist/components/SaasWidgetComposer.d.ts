import React from "react";
import type { ColorScheme, WidgetConfig } from "../types";
interface WidgetComposerProps {
    value: string;
    onChange: (text: string) => void;
    onSend: () => void;
    placeholder: string;
    disabled: boolean;
    config: WidgetConfig;
    colorScheme: ColorScheme;
}
export declare function WidgetComposer({ value, onChange, onSend, placeholder, disabled, config, colorScheme, }: WidgetComposerProps): React.JSX.Element;
/** @deprecated Use WidgetComposer */
export declare const SaasWidgetComposer: typeof WidgetComposer;
export {};
