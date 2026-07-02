import React from "react";
import type { Turn } from "../types";
interface ChatWidgetTurnProps {
    turn: Turn;
    animate?: boolean;
}
export declare function ChatWidgetTurn({ turn, animate }: ChatWidgetTurnProps): React.JSX.Element;
export {};
