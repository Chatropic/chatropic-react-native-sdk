import React from "react";
interface ChatWidgetBodyProps {
    variant?: "launcher" | "fullscreen";
    onClose?: () => void;
    onBack?: () => void;
}
export declare function ChatWidgetBody({ variant, onClose, onBack, }: ChatWidgetBodyProps): React.JSX.Element;
export {};
