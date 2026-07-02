import type { Turn } from "../types";
import type { CachedChatSession, ChatHistoryScope } from "./types";

const STORAGE_PREFIX = "@chatropic/rn/v1";

export function buildChatHistoryScopeKey(scope: ChatHistoryScope): string {
  const profile = scope.profile ?? "chat";
  const user = scope.endUserId?.trim() || "anon";
  return `${STORAGE_PREFIX}/${scope.tenantId}/${scope.productId}/${profile}/${user}`;
}

/** Keep first occurrence when the same turn id appears more than once. */
export function dedupeTurnsById(turns: Turn[]): Turn[] {
  const seen = new Set<string>();
  const deduped: Turn[] = [];
  for (const turn of turns) {
    if (seen.has(turn.id)) continue;
    seen.add(turn.id);
    deduped.push(turn);
  }
  return deduped;
}

export function sanitizeTurnsForStorage(turns: Turn[]): Turn[] {
  return dedupeTurnsById(
    turns
      .filter((turn) => !turn.running)
      .map((turn) => ({
        ...turn,
        running: false,
      })),
  );
}

export function parseCachedChatSession(raw: string): CachedChatSession | null {
  try {
    const parsed = JSON.parse(raw) as CachedChatSession;
    if (!parsed || typeof parsed.sessionId !== "string") return null;
    if (!Array.isArray(parsed.turns)) return null;
    return {
      sessionId: parsed.sessionId,
      turns: sanitizeTurnsForStorage(parsed.turns),
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function serializeCachedChatSession(
  session: CachedChatSession,
): string {
  return JSON.stringify({
    sessionId: session.sessionId,
    turns: sanitizeTurnsForStorage(session.turns),
    updatedAt: session.updatedAt,
  });
}
