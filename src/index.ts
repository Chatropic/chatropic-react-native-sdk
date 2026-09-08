export type {
  AgentStreamEvent,
  AgentStreamOptions,
  ChatWidgetProps,
  ColorScheme,
  NavigationCardProps,
  ProductId,
  PublicAppConfig,
  PublicAppTenant,
  Turn,
  TurnUI,
  WidgetConfig,
  WidgetProfile,
  WidgetSurfaceColors,
} from "./types";

export {
  fetchPublicAppConfig,
  streamChat,
  parseSseBlock,
  emitBufferedBlocks,
  consumeSseResponseText,
  flushSseResponseText,
  extractAgentDisplayText,
} from "./client/stream-chat";

export {
  VoiceClient,
  voiceWsUrl,
  type VoiceAgentState,
  type VoiceTranscriptLine,
  type VoiceClientCallbacks,
  type VoiceConnectOptions,
} from "./client/voice-client";

export {
  fetchSessionConversationMessages,
  mergeServerTurns,
  serverMessagesToTurns,
  type ServerConversationMessage,
  type SessionConversationMessagesResponse,
} from "./client/conversation-messages";

export {
  ChatWidgetProvider,
} from "./provider/ChatWidgetProvider";

export { ChatWidgetBody } from "./components/ChatWidgetBody";
export { ChatWidgetLauncher } from "./components/ChatWidgetLauncher";
export { WidgetLauncherIcon } from "./components/WidgetLauncherIcon";
export { ChatWidgetScreen } from "./components/ChatWidgetScreen";
export { VoicePanel } from "./components/VoicePanel";
export { VoiceWaveform } from "./components/VoiceWaveform";
export { VoiceWaveformIcon } from "./components/VoiceWaveformIcon";
export { ChatWidgetTurn } from "./components/ChatWidgetTurn";
export { ChatMarkdown } from "./components/ChatMarkdown";
export { MessageBubble, ThinkingBubble } from "./components/MessageBubble";
export { AgentBubbleHeader } from "./components/AgentBubbleHeader";
export { SaasWidgetComposer } from "./components/SaasWidgetComposer";
export { Composer } from "./components/Composer";
export { SuggestedPromptChips } from "./components/SuggestedPromptChips";
export { PrivacyBanner } from "./components/PrivacyBanner";
export { PoweredByChatropic } from "./components/PoweredByChatropic";
export { ChatropicBrandLogo, chatropicLogoVariant } from "./components/ChatropicBrandLogo";
export { WidgetHeader } from "./components/WidgetHeader";
export { AccentBackground } from "./components/AccentBackground";
export { AgentFeedbackRow } from "./components/AgentFeedbackRow";

export {
  NavigationCard,
  UnknownWidgetFallback,
} from "./widgets/TurnWidgets";

export {
  mergeWidgetConfig,
  createChatSessionId,
  createTurnId,
  logoLetter,
} from "./utils/session";

export {
  applyThemeToWidgetConfig,
  resolveWidgetColorScheme,
  themeSurfaceColors,
  userBubbleStyle,
  sendButtonActiveStyle,
  resolvePrimaryColor,
  resolveThreadColor,
} from "./theme/resolve-colors";

export {
  launcherButtonBackground,
  launcherButtonStyle,
} from "./theme/launcher-assets";

export {
  createChatStorage,
  createMemoryKeyValueStorage,
  createResilientKeyValueStorage,
} from "./storage/create-chat-storage";
export type { CachedChatSession, ChatHistoryScope, ChatStorage, KeyValueStorage } from "./storage/types";

export { parseLinearGradient } from "./theme/parse-gradient";
export { formatRelativeTime } from "./utils/format-time";

export {
  emptyWidgetConfig,
  PLATFORM_POWERED_BY_LABEL,
  PLATFORM_AGENT_DISPLAY_NAME,
} from "./utils/defaults";
export { resolveWidgetBranding } from "./utils/branding";

export { expoImagePicker, configureImageGrantStorage, uploadImage, imagePreview, attachmentRefs } from "./client/image-attachments";
export type { ChatAttachment, AttachmentRef, PickedImage, ImagePicker } from "./client/image-attachments";
