import type { ChatStorage, KeyValueStorage } from "./types";
export declare function createMemoryKeyValueStorage(): KeyValueStorage;
/** Falls back to in-memory storage when the primary backend throws (e.g. unlinked native module). */
export declare function createResilientKeyValueStorage(primary: KeyValueStorage, fallback?: KeyValueStorage): KeyValueStorage;
export declare function createChatStorage(kv: KeyValueStorage): ChatStorage;
