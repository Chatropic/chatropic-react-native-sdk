function parseHexColor(hex) {
    const normalized = hex.replace(/^#/, "").trim();
    if (normalized.length === 3) {
        const r = parseInt(normalized[0] + normalized[0], 16);
        const g = parseInt(normalized[1] + normalized[1], 16);
        const b = parseInt(normalized[2] + normalized[2], 16);
        if ([r, g, b].some((v) => Number.isNaN(v)))
            return null;
        return { r, g, b };
    }
    if (normalized.length === 6) {
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        if ([r, g, b].some((v) => Number.isNaN(v)))
            return null;
        return { r, g, b };
    }
    return null;
}
function channelLuminance(channel) {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
export function relativeLuminance(hex) {
    const rgb = parseHexColor(hex);
    if (!rgb)
        return 0;
    return (0.2126 * channelLuminance(rgb.r) +
        0.7152 * channelLuminance(rgb.g) +
        0.0722 * channelLuminance(rgb.b));
}
export function textColorForBubble(background) {
    return relativeLuminance(background) > 0.6 ? "#18181B" : "#FFFFFF";
}
export function normalizeHexColor(hex, fallback) {
    const trimmed = hex.trim();
    if (!trimmed.startsWith("#"))
        return fallback;
    return parseHexColor(trimmed) ? trimmed : fallback;
}
