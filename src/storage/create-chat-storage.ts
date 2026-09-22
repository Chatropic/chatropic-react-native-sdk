import {
  buildChatHistoryScopeKey,
  parseCachedChatSession,
  serializeCachedChatSession,
} from "./chat-history";
import type {
  CachedChatSession,
  ChatHistoryScope,
  ChatStorage,
  KeyValueStorage,
} from "./types";

export function createMemoryKeyValueStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => Promise.resolve(data.get(key) ?? null),
    setItem: (key, value) => {
      data.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      data.delete(key);
      return Promise.resolve();
    },
  };
}

/** Falls back to in-memory storage when the primary backend throws (e.g. unlinked native module). */
export function createResilientKeyValueStorage(
  primary: KeyValueStorage,
  fallback: KeyValueStorage = createMemoryKeyValueStorage(),
): KeyValueStorage {
  return {
    async getItem(key) {
      try {
        return await primary.getItem(key);
      } catch {
        return fallback.getItem(key);
      }
    },
    async setItem(key, value) {
      try {
        await primary.setItem(key, value);
      } catch {
        await fallback.setItem(key, value);
      }
    },
    async removeItem(key) {
      try {
        await primary.removeItem(key);
      } catch {
        await fallback.removeItem(key);
      }
    },
  };
}

export function createChatStorage(kv: KeyValueStorage): ChatStorage {
  // Serialize archive updates so concurrent streaming saves cannot lose sessions.
  let pending: Promise<unknown> = Promise.resolve();
  const enqueue = <T,>(operation: () => Promise<T>): Promise<T> => {
    const result = pending.then(operation, operation);
    pending = result.catch(() => {});
    return result;
  };
  const readRecent = async (scope: ChatHistoryScope): Promise<CachedChatSession[]> => {
    const raw = await kv.getItem(`${buildChatHistoryScopeKey(scope)}/recent`);
    try {
      const rows: unknown = JSON.parse(raw ?? "[]");
      if (!Array.isArray(rows)) return [];
      return rows.flatMap(row => {
        const session = parseCachedChatSession(JSON.stringify(row));
        return session ? [session] : [];
      });
    } catch { return []; }
  };
  return {
    async load(scope) {
      await pending;
      const raw = await kv.getItem(buildChatHistoryScopeKey(scope));
      return raw ? parseCachedChatSession(raw) : null;
    },
    async list(scope) {
      await pending;
      const recent = await readRecent(scope);
      // Include sessions written by older SDK versions before the archive existed.
      const raw = await kv.getItem(buildChatHistoryScopeKey(scope));
      const current = raw ? parseCachedChatSession(raw) : null;
      return (current && !recent.some(row => row.sessionId === current.sessionId)
        ? [current, ...recent] : recent).sort((a, b) => b.updatedAt - a.updatedAt);
    },
    save(scope, session: CachedChatSession) {
      return enqueue(async () => {
        const key = buildChatHistoryScopeKey(scope);
        const recent = await readRecent(scope);
        const raw = await kv.getItem(key);
        const previous = raw ? parseCachedChatSession(raw) : null;
        if (previous && !recent.some(row => row.sessionId === previous.sessionId)) recent.push(previous);
        await kv.setItem(key, serializeCachedChatSession(session));
        const rows = [session, ...recent.filter(row => row.sessionId !== session.sessionId)]
          .sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 30);
        await kv.setItem(`${key}/recent`, `[${rows.map(serializeCachedChatSession).join(",")}]`);
      });
    },
    clearCurrent(scope) {
      return enqueue(async () => {
        const key = buildChatHistoryScopeKey(scope);
        const raw = await kv.getItem(key);
        const current = raw ? parseCachedChatSession(raw) : null;
        const recent = await readRecent(scope);
        if (current && !recent.some(row => row.sessionId === current.sessionId)) {
          recent.push(current);
          await kv.setItem(`${key}/recent`, `[${recent.map(serializeCachedChatSession).join(",")}]`);
        }
        await kv.removeItem(key);
      });
    },
    clear(scope) {
      return enqueue(async () => {
        const key = buildChatHistoryScopeKey(scope);
        await kv.removeItem(key);
        await kv.removeItem(`${key}/recent`);
      });
    },
  };
}
