import type { WidgetConfig } from "../types";

export const PLATFORM_POWERED_BY_LABEL = "Powered by Chatropic";
export const PLATFORM_AGENT_DISPLAY_NAME = "Chatropic";

export function emptyWidgetConfig(): WidgetConfig {
  return {
    displayName: PLATFORM_AGENT_DISPLAY_NAME,
    headerColor: "#FFFFFF",
    userBubbleColor: "#18181B",
    agentBubbleColor: "#F4F4F4",
    welcomeMessage: "",
    placeholder: "",
    suggestedPrompts: [],
    showVoice: true,
    showHeader: true,
    showPrivacyNotice: true,
    privacyNoticeText: "",
    poweredByLabel: PLATFORM_POWERED_BY_LABEL,
    widgetTheme: "light",
    model: "",
    instructionsPreset: "custom",
    instructions: "",
  };
}
