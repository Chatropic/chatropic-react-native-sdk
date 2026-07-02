import type { ColorScheme, WidgetConfig, WidgetSurfaceColors } from "../types";
export declare const DEFAULT_LIGHT_AGENT_BUBBLE = "#F4F4F4";
export declare const DEFAULT_DARK_AGENT_BUBBLE = "#2C2C2E";
export declare const DEFAULT_PRIMARY = "#18181B";
export declare const DEFAULT_LIGHT_THREAD = "#FFFFFF";
export declare const DEFAULT_DARK_THREAD = "#121214";
export declare function defaultLightSurfaceColors(primary?: string, thread?: string): WidgetSurfaceColors;
export declare function defaultDarkSurfaceColors(primary?: string, thread?: string): WidgetSurfaceColors;
export declare function resolveWidgetColorScheme(config: WidgetConfig, themeOverride?: ColorScheme): ColorScheme;
export declare function applyThemeToWidgetConfig(config: WidgetConfig, scheme: ColorScheme): WidgetConfig;
export declare function resolvePrimaryColor(config: Pick<WidgetConfig, "userBubbleColor">): string;
export declare function resolveThreadColor(config: Pick<WidgetConfig, "headerColor">, scheme?: ColorScheme): string;
export interface BubbleStyle {
    backgroundColor?: string;
    color: string;
}
export declare function userBubbleStyle(config: WidgetConfig, _colorScheme?: ColorScheme): BubbleStyle;
export declare function sendButtonActiveStyle(config: WidgetConfig, colorScheme: ColorScheme): BubbleStyle;
export declare function primaryAccentColor(config: WidgetConfig): string;
export declare function resolveSaasThreadBackground(config: WidgetConfig, scheme: ColorScheme): string;
export declare function resolveSaasInputBackground(config: WidgetConfig, scheme: ColorScheme): string;
export declare function themeSurfaceColors(scheme: ColorScheme): {
    background: string;
    foreground: string;
    muted: string;
    border: string;
    agentBubble: string;
};
