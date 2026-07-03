export type ChatropicEnvironmentName = "auto" | "development" | "production";
export interface ChatropicEnvironmentConfig {
    name: Exclude<ChatropicEnvironmentName, "auto">;
    agentUrl: string;
}
export interface ChatropicEnvironmentOptions {
    environment?: ChatropicEnvironmentName;
}
export declare const CHATROPIC_DEVELOPMENT_AGENT_URL = "http://localhost:8000";
export declare const CHATROPIC_PRODUCTION_AGENT_URL = "https://app.chatropic.com";
export declare function resolveChatropicEnvironment(options?: ChatropicEnvironmentOptions): ChatropicEnvironmentConfig;
export declare function getDefaultAgentUrl(environment?: ChatropicEnvironmentName): string;
