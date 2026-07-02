import React from "react";
import type { ColorScheme } from "../types";
interface AgentFeedbackRowProps {
    timestamp?: number;
    colorScheme?: ColorScheme;
    sessionId?: string;
    turnId?: string;
    agentUrl?: string;
    tenantId?: string;
    apiKey?: string;
    productId?: string;
}
export declare function AgentFeedbackRow({ timestamp, colorScheme, sessionId, turnId, agentUrl, tenantId, apiKey, productId, }: AgentFeedbackRowProps): React.JSX.Element | null;
export {};
