import { textColorForBubble } from "./colors";
import { resolvePrimaryColor, resolveThreadColor, } from "./resolve-colors";
export function launcherButtonBackground(config, colorScheme) {
    return colorScheme === "dark"
        ? resolvePrimaryColor(config)
        : resolveThreadColor(config, colorScheme);
}
export function launcherButtonStyle(config, colorScheme) {
    const backgroundColor = launcherButtonBackground(config, colorScheme);
    return {
        backgroundColor,
        color: textColorForBubble(backgroundColor),
    };
}
