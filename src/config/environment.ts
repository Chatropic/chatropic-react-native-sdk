import {
  CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL,
  CHATROPIC_GENERATED_PRODUCTION_AGENT_URL,
} from "./generated";

export type ChatropicEnvironmentName = "auto" | "development" | "production";

export interface ChatropicEnvironmentConfig {
  name: Exclude<ChatropicEnvironmentName, "auto">;
  agentUrl: string;
}

export interface ChatropicEnvironmentOptions {
  environment?: ChatropicEnvironmentName;
}

export const CHATROPIC_DEVELOPMENT_AGENT_URL = CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL;
export const CHATROPIC_PRODUCTION_AGENT_URL = CHATROPIC_GENERATED_PRODUCTION_AGENT_URL;

declare const __DEV__: boolean | undefined;

function runtimeIsDev(): boolean {
  if (typeof __DEV__ === "boolean") return __DEV__;
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== "production";
  }
  return false;
}

function cleanUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function requireAgentUrl(
  value: string,
  environment: Exclude<ChatropicEnvironmentName, "auto">,
): string {
  const clean = cleanUrl(value.trim());
  if (!clean) {
    throw new Error(
      `Chatropic ${environment} agent URL is not configured. Run npm run build:${environment} with CHATROPIC_GENERATED_${environment.toUpperCase()}_AGENT_URL set.`,
    );
  }
  return clean;
}

export function resolveChatropicEnvironment(
  options: ChatropicEnvironmentOptions = {},
): ChatropicEnvironmentConfig {
  const requested = options.environment ?? "auto";
  const name =
    requested === "auto"
      ? runtimeIsDev()
        ? "development"
        : "production"
      : requested;

  return {
    name,
    agentUrl: requireAgentUrl(
      name === "development"
        ? CHATROPIC_DEVELOPMENT_AGENT_URL
        : CHATROPIC_PRODUCTION_AGENT_URL,
      name,
    ),
  };
}

export function getDefaultAgentUrl(
  environment: ChatropicEnvironmentName = "auto",
): string {
  return resolveChatropicEnvironment({ environment }).agentUrl;
}
