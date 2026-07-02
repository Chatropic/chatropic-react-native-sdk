import React from "react";
import type { ColorScheme } from "../types";
interface SuggestedPromptChipsProps {
    prompts: string[];
    onSelect: (prompt: string) => void;
    colorScheme: ColorScheme;
    disabled?: boolean;
    align?: "start" | "end";
    layout?: "stack" | "wrap";
    compact?: boolean;
}
export declare function SuggestedPromptChips({ prompts, onSelect, colorScheme, disabled, align, layout, compact, }: SuggestedPromptChipsProps): React.JSX.Element | null;
export {};
