import type { WidgetConfig } from "../types";
import { PLATFORM_AGENT_DISPLAY_NAME } from "./defaults";

export interface ResolvedWidgetBranding {
  displayName: string;
  logoUrl?: string;
  usePlatformLogo: boolean;
}

/** Channel display name and explicitly managed logo for widget headers and bubbles. */
export function resolveWidgetBranding(
  config: WidgetConfig,
): ResolvedWidgetBranding {
  // Public channel configs may omit the editor-only management flag.
  const displayName = config.displayName?.trim() || PLATFORM_AGENT_DISPLAY_NAME;

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
