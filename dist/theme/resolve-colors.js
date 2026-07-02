import { normalizeHexColor, textColorForBubble } from "./colors";
export const DEFAULT_LIGHT_AGENT_BUBBLE = "#F4F4F4";
export const DEFAULT_DARK_AGENT_BUBBLE = "#2C2C2E";
export const DEFAULT_PRIMARY = "#18181B";
export const DEFAULT_LIGHT_THREAD = "#FFFFFF";
export const DEFAULT_DARK_THREAD = "#121214";
export function defaultLightSurfaceColors(primary = DEFAULT_PRIMARY, thread = DEFAULT_LIGHT_THREAD) {
    const threadColor = normalizeHexColor(thread, DEFAULT_LIGHT_THREAD);
    return {
        headerColor: threadColor,
        userBubbleColor: normalizeHexColor(primary, DEFAULT_PRIMARY),
        agentBubbleColor: DEFAULT_LIGHT_AGENT_BUBBLE,
        saasThreadBackground: threadColor,
        saasInputBackground: threadColor,
    };
}
export function defaultDarkSurfaceColors(primary = DEFAULT_PRIMARY, thread = DEFAULT_DARK_THREAD) {
    const threadColor = normalizeHexColor(thread, DEFAULT_DARK_THREAD);
    return {
        headerColor: threadColor,
        userBubbleColor: normalizeHexColor(primary, DEFAULT_PRIMARY),
        agentBubbleColor: DEFAULT_DARK_AGENT_BUBBLE,
        saasThreadBackground: threadColor,
        saasInputBackground: threadColor,
    };
}
export function resolveWidgetColorScheme(config, themeOverride) {
    if (themeOverride)
        return themeOverride;
    return config.widgetTheme === "dark" ? "dark" : "light";
}
export function applyThemeToWidgetConfig(config, scheme) {
    const light = {
        ...defaultLightSurfaceColors(config.userBubbleColor, config.headerColor),
        ...config.lightColors,
    };
    const dark = {
        ...defaultDarkSurfaceColors(config.userBubbleColor, config.headerColor),
        ...config.darkColors,
    };
    const surfaces = scheme === "dark" ? dark : light;
    const themed = {
        ...config,
        headerColor: surfaces.headerColor ?? config.headerColor,
        userBubbleColor: surfaces.userBubbleColor ?? config.userBubbleColor,
        agentBubbleColor: surfaces.agentBubbleColor ?? config.agentBubbleColor,
        saasThreadBackground: surfaces.saasThreadBackground ?? config.saasThreadBackground,
        saasInputBackground: surfaces.saasInputBackground ?? config.saasInputBackground,
    };
    delete themed.accentGradient;
    delete themed.accentPresetId;
    return themed;
}
export function resolvePrimaryColor(config) {
    return normalizeHexColor(config.userBubbleColor, DEFAULT_PRIMARY);
}
export function resolveThreadColor(config, scheme = "light") {
    const fallback = scheme === "dark" ? DEFAULT_DARK_THREAD : DEFAULT_LIGHT_THREAD;
    return normalizeHexColor(config.headerColor, fallback);
}
export function userBubbleStyle(config, _colorScheme = "light") {
    const bg = resolvePrimaryColor(config);
    return {
        backgroundColor: bg,
        color: textColorForBubble(bg),
    };
}
export function sendButtonActiveStyle(config, colorScheme) {
    const bg = resolvePrimaryColor(config);
    if (colorScheme === "dark") {
        return {
            backgroundColor: bg,
            color: resolveThreadColor(config, colorScheme),
        };
    }
    return {
        backgroundColor: bg,
        color: textColorForBubble(bg),
    };
}
export function primaryAccentColor(config) {
    return resolvePrimaryColor(config);
}
export function resolveSaasThreadBackground(config, scheme) {
    const fallback = scheme === "dark" ? DEFAULT_DARK_THREAD : DEFAULT_LIGHT_THREAD;
    const raw = config.saasThreadBackground?.trim() || config.headerColor?.trim();
    if (!raw)
        return fallback;
    return normalizeHexColor(raw, fallback);
}
export function resolveSaasInputBackground(config, scheme) {
    const fallback = scheme === "dark" ? DEFAULT_DARK_THREAD : DEFAULT_LIGHT_THREAD;
    const raw = config.saasInputBackground?.trim() || config.headerColor?.trim();
    if (!raw)
        return fallback;
    return normalizeHexColor(raw, fallback);
}
export function themeSurfaceColors(scheme) {
    const isDark = scheme === "dark";
    return {
        background: isDark ? DEFAULT_DARK_THREAD : DEFAULT_LIGHT_THREAD,
        foreground: isDark ? "#FFFFFF" : "#18181B",
        muted: isDark ? "#8E8E93" : "#71717A",
        border: isDark ? "rgba(255, 255, 255, 0.08)" : "#E4E4E7",
        agentBubble: isDark ? DEFAULT_DARK_AGENT_BUBBLE : DEFAULT_LIGHT_AGENT_BUBBLE,
    };
}
