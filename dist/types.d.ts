export type WidgetProfile = "chat" | "saas" | "mobile";
export type ColorScheme = "light" | "dark";
export type ProductId = string;
export interface WidgetSurfaceColors {
    headerColor?: string;
    userBubbleColor?: string;
    agentBubbleColor?: string;
    accentGradient?: string;
    accentPresetId?: string;
    saasThreadBackground?: string;
    saasInputBackground?: string;
}
export interface WidgetConfig {
    displayName: string;
    headerColor: string;
    userBubbleColor: string;
    accentGradient?: string;
    accentPresetId?: string;
    agentBubbleColor: string;
    logoUrl?: string;
    welcomeMessage: string;
    placeholder: string;
    suggestedPrompts: string[];
    suggestedPromptsManaged?: boolean;
    displayNameManaged?: boolean;
    logoUrlManaged?: boolean;
    showVoice: boolean;
    showHeader?: boolean;
    showPrivacyNotice: boolean;
    privacyNoticeText: string;
    poweredByLabel: string;
    model: string;
    modelProvider?: string;
    instructionsPreset: string;
    instructions: string;
    currency?: string;
    endUserId?: string;
    /** Visitor display name for chat logs. */
    userName?: string;
    /** Visitor email for chat logs. */
    userEmail?: string;
    ragTopK?: number;
    ragMinScore?: number;
    agentRole?: string;
    agentDescription?: string;
    agentPersonality?: "professional" | "friendly" | "humorous";
    agentWebsiteUrl?: string;
    widgetTheme?: ColorScheme;
    lightColors?: WidgetSurfaceColors;
    darkColors?: WidgetSurfaceColors;
    saasThreadBackground?: string;
    saasInputBackground?: string;
}
export interface NavigationCardProps {
    label: string;
    path: string;
    requiresAuth?: boolean;
}
export interface TurnUI {
    component: string;
    props: Record<string, unknown>;
}
export interface Turn {
    id: string;
    role: "user" | "agent";
    author?: "human_agent";
    text?: string;
    createdAt?: number;
    running?: boolean;
    ui?: TurnUI;
    suggestedReplies?: string[];
    /** Server-assigned turn/message id for feedback and tracing. */
    turnId?: string;
    /** Marks a locally-created optimistic turn; replaced by server turn on sync. */
    localId?: string;
}
export interface PublicAppTenant {
    id: string;
    name: string;
    slug: string;
}
export interface PublicAppConfig {
    tenant: PublicAppTenant;
    config: Partial<WidgetConfig>;
    profile?: WidgetProfile;
}
export interface AgentStreamEvent {
    event: string;
    data: Record<string, unknown>;
}
export type AgentHistoryMessage = {
    role: "user" | "assistant";
    content: string;
};
export interface AgentStreamOptions {
    publishableKey?: string;
    productId?: ProductId;
    endUserId?: string;
    serverAgentConfig?: boolean;
    inboxChannel?: string;
    userName?: string;
    userEmail?: string;
    agentConfig?: Record<string, unknown>;
    history?: AgentHistoryMessage[];
}
export interface ChatWidgetProps {
    /** Publishable mobile/widget API key. Preferred for new mobile integrations. */
    publishableKey?: string;
    /** Deprecated for mobile runtime auth. Use publishableKey instead. */
    tenantId?: string;
    profile?: WidgetProfile;
    sessionId?: string;
    endUserId?: string;
    /** Visitor display name for chat logs. */
    userName?: string;
    /** Visitor email for chat logs. */
    userEmail?: string;
    theme?: ColorScheme;
    onNavigate?: (path: string) => void;
    onBack?: () => void;
    onUserMessage?: (text: string) => void;
    onAgentDone?: (text: string) => void;
    /** Called when the server session is closed and a new session id is required. */
    onSessionRotate?: (newSessionId: string) => void;
}
