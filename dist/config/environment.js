import { CHATROPIC_GENERATED_PRODUCTION_AGENT_URL } from "./generated";
export const CHATROPIC_DEVELOPMENT_AGENT_URL = CHATROPIC_GENERATED_PRODUCTION_AGENT_URL;
export const CHATROPIC_PRODUCTION_AGENT_URL = CHATROPIC_GENERATED_PRODUCTION_AGENT_URL;
function runtimeIsDev() {
    if (typeof __DEV__ === "boolean")
        return __DEV__;
    if (typeof process !== "undefined" && process.env?.NODE_ENV) {
        return process.env.NODE_ENV !== "production";
    }
    return false;
}
function cleanUrl(value) {
    return value.replace(/\/+$/, "");
}
export function resolveChatropicEnvironment(options = {}) {
    const requested = options.environment ?? "auto";
    const name = requested === "auto"
        ? runtimeIsDev()
            ? "development"
            : "production"
        : requested;
    return {
        name,
        agentUrl: cleanUrl(name === "development"
            ? (options.developmentAgentUrl ?? CHATROPIC_DEVELOPMENT_AGENT_URL)
            : (options.productionAgentUrl ?? CHATROPIC_PRODUCTION_AGENT_URL)),
    };
}
export function getDefaultAgentUrl(environment = "auto") {
    return resolveChatropicEnvironment({ environment }).agentUrl;
}
