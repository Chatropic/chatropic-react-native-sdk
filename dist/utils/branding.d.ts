import type { WidgetConfig } from "../types";
export interface ResolvedWidgetBranding {
    displayName: string;
    logoUrl?: string;
    usePlatformLogo: boolean;
}
/** Visible agent name + logo for widget headers and bubbles (premium overrides). */
export declare function resolveWidgetBranding(config: WidgetConfig): ResolvedWidgetBranding;
