import { PLATFORM_AGENT_DISPLAY_NAME } from "./defaults";
/** Visible agent name + logo for widget headers and bubbles (premium overrides). */
export function resolveWidgetBranding(config) {
    const displayName = config.displayNameManaged && config.displayName?.trim()
        ? config.displayName.trim()
        : PLATFORM_AGENT_DISPLAY_NAME;
    const logoUrl = config.logoUrlManaged && config.logoUrl?.trim()
        ? config.logoUrl.trim()
        : undefined;
    return {
        displayName,
        logoUrl,
        usePlatformLogo: !logoUrl,
    };
}
