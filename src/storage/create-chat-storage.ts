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
  return {
    async load(scope) {
      const raw = await kv.getItem(buildChatHistoryScopeKey(scope));
      if (!raw) return null;
      return parseCachedChatSession(raw);
    },
    async save(scope, session: CachedChatSession) {
      await kv.setItem(
        buildChatHistoryScopeKey(scope),
        serializeCachedChatSession(session),
      );
    },
    async clear(scope) {
      await kv.removeItem(buildChatHistoryScopeKey(scope));
    },
  };
}
