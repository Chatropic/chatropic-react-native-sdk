import React from "react";
import type { Turn } from "../types";
interface ChatWidgetTurnProps {
    turn: Turn;
    animate?: boolean;
    showSuggestedReplies?: boolean;
}
export declare function ChatWidgetTurn({ turn, animate, showSuggestedReplies, }: ChatWidgetTurnProps): React.JSX.Element;
export {};
