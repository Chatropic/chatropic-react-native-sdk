type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type SafeAreaInsetsHook = () => SafeAreaInsets;

const EMPTY_INSETS: SafeAreaInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

let cachedInsetsHook: SafeAreaInsetsHook | null | undefined;

function resolveSafeAreaInsetsHook(): SafeAreaInsetsHook | null {
  if (cachedInsetsHook !== undefined) {
    return cachedInsetsHook;
  }

  try {
    const mod = require("react-native-safe-area-context") as {
      useSafeAreaInsets: SafeAreaInsetsHook;
    };
    cachedInsetsHook = mod.useSafeAreaInsets;
  } catch {
    cachedInsetsHook = null;
  }

  return cachedInsetsHook;
}

function useSafeAreaInsets(): SafeAreaInsets {
  const useSafeAreaInsetsHook = resolveSafeAreaInsetsHook();
  if (!useSafeAreaInsetsHook) return EMPTY_INSETS;
  return useSafeAreaInsetsHook();
}

/** Optional react-native-safe-area-context — returns 0 when unavailable. */
export function useTopSafeInset(): number {
  return useSafeAreaInsets().top;
}

/** Bottom inset for home indicator / device corners. */
export function useBottomSafeInset(): number {
  return useSafeAreaInsets().bottom;
}
