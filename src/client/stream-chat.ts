import type {
  AgentStreamEvent,
  AgentStreamOptions,
  PublicAppConfig,
  TurnUI,
  WidgetProfile,
} from "../types";
import { getDefaultAgentUrl } from "../config/environment";

export async function fetchPublicAppConfig(
  tenantRef: string | undefined,
  agentUrl: string = getDefaultAgentUrl(),
  profile: WidgetProfile = "chat",
  publishableKey?: string,
): Promise<PublicAppConfig> {
  const query =
    profile === "chat" ? "" : `?profile=${encodeURIComponent(profile)}`;
  const base = agentUrl.replace(/\/$/, "");
  const res = publishableKey?.trim()
    ? await fetch(
        `${base}/mobile/widget/config${query || "?profile=chat"}`,
        { headers: { Authorization: `Bearer ${publishableKey.trim()}` } },
      )
    : await fetch(`${base}/tenants/${tenantRef}/public-app${query}`);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Failed to load app config (${res.status})`);
  }
  return res.json() as Promise<PublicAppConfig>;
}

export function parseSseBlock(block: string): AgentStreamEvent | null {
  const trimmed = block.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;

  let event = "message";
  let data = "";
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    return { event, data: JSON.parse(data) as Record<string, unknown> };
  } catch {
    return null;
  }
}

export function emitBufferedBlocks(
  buffer: string,
  onEvent: (ev: AgentStreamEvent) => void,
): string {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");
  const remainder = parts.pop() ?? "";
  for (const part of parts) {
    const parsed = parseSseBlock(part);
    if (parsed) onEvent(parsed);
  }
  return remainder;
}

export type SseStreamState = {
  buffer: string;
  receivedLength: number;
};

/** Append new XHR responseText and emit any complete SSE blocks. */
export function consumeSseResponseText(
  state: SseStreamState,
  responseText: string,
  onEvent: (ev: AgentStreamEvent) => void,
): void {
  const chunk = responseText.slice(state.receivedLength);
  if (!chunk) return;
  state.receivedLength = responseText.length;
  state.buffer += chunk;
  state.buffer = emitBufferedBlocks(state.buffer, onEvent);
}

/** Flush trailing SSE data when the XHR stream completes. */
export function flushSseResponseText(
  state: SseStreamState,
  responseText: string,
  onEvent: (ev: AgentStreamEvent) => void,
): void {
  const chunk = responseText.slice(state.receivedLength);
  if (chunk) {
    state.receivedLength = responseText.length;
    state.buffer += chunk;
  }
  state.buffer = emitBufferedBlocks(state.buffer + "\n\n", onEvent);
}

export function mapUiRender(
  component: string,
  props: Record<string, unknown>,
): TurnUI {
  return { component, props };
}

export function resolveTurnUiFromDoneData(
  turnUi: TurnUI | null,
  data: Record<string, unknown>,
): TurnUI | null {
  if (turnUi) return turnUi;
  const uiRaw = data.ui;
  if (!uiRaw || typeof uiRaw !== "object") return null;
  const row = uiRaw as { component?: string; props?: Record<string, unknown> };
  if (!row.component) return null;
  return mapUiRender(String(row.component), row.props ?? {});
}

export function suggestedRepliesFromDoneData(
  data: Record<string, unknown>,
): string[] | undefined {
  if (!Array.isArray(data.suggested_replies)) return undefined;
  const replies = data.suggested_replies
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
  return replies.length ? replies : undefined;
}

const INTERNAL_TRAILER_PATTERNS = [
  /\s*---\s*suggested[_\s-]*replies\s*(?:---)?[\s\S]*$/i,
  /\s*---\s*resolution[_\s-]*offer\s*(?:---)?[\s\S]*$/i,
];

function stripInternalTrailers(raw: string): string {
  return INTERNAL_TRAILER_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, ""),
    raw,
  );
}

function stripChatCodeFences(text: string): string {
  return text
    .replace(/```[\w-]*\n?[\s\S]*?```/gi, "")
    .replace(/```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripMarkdownSyntax(text: string): string {
  let cleaned = text;
  // Remove headings
  cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, "");
  // Strip bold and italic markers, keep content
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  // Strip inline code backticks, keep content
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  // Strip bullet list markers
  cleaned = cleaned.replace(/^\s*[-*]\s+/gm, "");
  // Strip numbered list markers
  cleaned = cleaned.replace(/^\s*\d+[.)]\s+/gm, "");
  // Strip markdown links, keep label text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Collapse extra blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

export function extractAgentDisplayText(raw: string): string {
  const text = stripInternalTrailers(raw);
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("```")) return "";
  const withoutFences = stripChatCodeFences(trimmed);
  return stripMarkdownSyntax(withoutFences);
}

/** SSE stream via XMLHttpRequest — reliable across React Native versions. */
export function streamChat(
  agentUrl: string,
  sessionId: string,
  tenantId: string | undefined,
  message: string,
  onEvent: (ev: AgentStreamEvent) => void,
  options?: AgentStreamOptions,
): { abort: () => void; promise: Promise<void> } {
  const base = agentUrl.replace(/\/$/, "");
  const xhr = new XMLHttpRequest();
  const sseState: SseStreamState = { buffer: "", receivedLength: 0 };
  let settled = false;

  const abort = () => {
    if (!settled) {
      settled = true;
      xhr.abort();
    }
  };

  const promise = new Promise<void>((resolve, reject) => {
    xhr.open("POST", `${base}/chat/stream`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "text/event-stream");
    if (options?.publishableKey?.trim()) {
      xhr.setRequestHeader("Authorization", `Bearer ${options.publishableKey.trim()}`);
    }
    if (options?.endUserId) {
      xhr.setRequestHeader("X-End-User-Id", options.endUserId);
    }

    const body: Record<string, unknown> = {
      session_id: sessionId,
      user_id: tenantId ?? "",
      end_user_id: options?.endUserId ?? "",
      message,
      product_id: options?.productId ?? "customer_support",
      history: options?.history ?? [],
    };
    if (options?.serverAgentConfig) {
      body.agent_config = {
        channel: options.inboxChannel ?? "mobile",
        product_id: options?.productId ?? "customer_support",
        ...(options.userName?.trim()
          ? { user_name: options.userName.trim() }
          : {}),
        ...(options.userEmail?.trim()
          ? { user_email: options.userEmail.trim() }
          : {}),
      };
    } else if (options?.agentConfig) {
      body.agent_config = options.agentConfig;
    }

    xhr.onprogress = () => {
      consumeSseResponseText(sseState, xhr.responseText, onEvent);
    };

    xhr.onload = () => {
      if (settled) return;
      settled = true;
      if (xhr.status >= 200 && xhr.status < 300) {
        flushSseResponseText(sseState, xhr.responseText, onEvent);
        resolve();
      } else {
        reject(new Error(`Agent error: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      if (settled) return;
      settled = true;
      reject(new Error("Network error while streaming chat"));
    };

    xhr.onabort = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    xhr.send(JSON.stringify(body));
  });

  return { abort, promise };
}

export async function submitMessageFeedback(
  agentUrl: string,
  tenantId: string | undefined,
  productId: string,
  sessionId: string,
  messageId: string | undefined,
  positive: boolean,
  apiKey?: string,
): Promise<void> {
  const base = agentUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!apiKey?.trim()) {
    return;
  }
  headers.Authorization = `Bearer ${apiKey.trim()}`;
  try {
    await fetch(`${base}/products/${productId}/analytics/feedback`, {
      method: "POST",
      headers,
      body: JSON.stringify({ session_id: sessionId, message_id: messageId, positive }),
    });
  } catch {
    // Offline — keep local vote state only.
  }
}
