const EMPTY_INSETS = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};
let cachedInsetsHook;
function resolveSafeAreaInsetsHook() {
    if (cachedInsetsHook !== undefined) {
        return cachedInsetsHook;
    }
    try {
        const mod = require("react-native-safe-area-context");
        cachedInsetsHook = mod.useSafeAreaInsets;
    }
    catch {
        cachedInsetsHook = null;
    }
    return cachedInsetsHook;
}
function useSafeAreaInsets() {
    const useSafeAreaInsetsHook = resolveSafeAreaInsetsHook();
    if (!useSafeAreaInsetsHook)
        return EMPTY_INSETS;
    return useSafeAreaInsetsHook();
}
/** Optional react-native-safe-area-context — returns 0 when unavailable. */
export function useTopSafeInset() {
    return useSafeAreaInsets().top;
}
/** Bottom inset for home indicator / device corners. */
export function useBottomSafeInset() {
    return useSafeAreaInsets().bottom;
}
