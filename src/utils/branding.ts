import type { WidgetConfig } from "../types";
import { PLATFORM_AGENT_DISPLAY_NAME } from "./defaults";

export interface ResolvedWidgetBranding {
  displayName: string;
  logoUrl?: string;
  usePlatformLogo: boolean;
}

/** Visible agent name + logo for widget headers and bubbles (premium overrides). */
export function resolveWidgetBranding(
  config: WidgetConfig,
): ResolvedWidgetBranding {
  const displayName =
    config.displayNameManaged && config.displayName?.trim()
      ? config.displayName.trim()
      : PLATFORM_AGENT_DISPLAY_NAME;

  const logoUrl =
    config.logoUrlManaged && config.logoUrl?.trim()
      ? config.logoUrl.trim()
      : undefined;

  return {
    displayName,
    logoUrl,
    usePlatformLogo: !logoUrl,
  };
}
