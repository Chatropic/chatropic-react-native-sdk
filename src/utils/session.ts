import type { WidgetConfig } from "../types";
import { emptyWidgetConfig, PLATFORM_POWERED_BY_LABEL } from "./defaults";

function sanitizeUserBubbleColor(color: string, fallback = "#18181B"): string {
  const trimmed = color.trim();
  if (!trimmed) return fallback;
  return trimmed;
}

export function mergeWidgetConfig(
  patch?: Partial<WidgetConfig>,
): WidgetConfig {
  const defaults = emptyWidgetConfig();
  const merged = { ...defaults, ...patch };

  return {
    ...merged,
    poweredByLabel: merged.poweredByLabel?.trim()
      ? merged.poweredByLabel
      : PLATFORM_POWERED_BY_LABEL,
    userBubbleColor: sanitizeUserBubbleColor(
      merged.userBubbleColor || merged.headerColor,
      defaults.userBubbleColor,
    ),
  };
}

export function createChatSessionId(prefix = "rn"): string {
  const uuid =
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid}`;
}

export function createTurnId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function logoLetter(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "C";
  return trimmed.charAt(0).toUpperCase();
}
