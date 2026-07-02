import { buildChatHistoryScopeKey, parseCachedChatSession, serializeCachedChatSession, } from "./chat-history";
export function createMemoryKeyValueStorage() {
    const data = new Map();
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
export function createResilientKeyValueStorage(primary, fallback = createMemoryKeyValueStorage()) {
    return {
        async getItem(key) {
            try {
                return await primary.getItem(key);
            }
            catch {
                return fallback.getItem(key);
            }
        },
        async setItem(key, value) {
            try {
                await primary.setItem(key, value);
            }
            catch {
                await fallback.setItem(key, value);
            }
        },
        async removeItem(key) {
            try {
                await primary.removeItem(key);
            }
            catch {
                await fallback.removeItem(key);
            }
        },
    };
}
export function createChatStorage(kv) {
    return {
        async load(scope) {
            const raw = await kv.getItem(buildChatHistoryScopeKey(scope));
            if (!raw)
                return null;
            return parseCachedChatSession(raw);
        },
        async save(scope, session) {
            await kv.setItem(buildChatHistoryScopeKey(scope), serializeCachedChatSession(session));
        },
        async clear(scope) {
            await kv.removeItem(buildChatHistoryScopeKey(scope));
        },
    };
}
