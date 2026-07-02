import type { Turn } from "../types";
import type { CachedChatSession, ChatHistoryScope } from "./types";
export declare function buildChatHistoryScopeKey(scope: ChatHistoryScope): string;
/** Keep first occurrence when the same turn id appears more than once. */
export declare function dedupeTurnsById(turns: Turn[]): Turn[];
export declare function sanitizeTurnsForStorage(turns: Turn[]): Turn[];
export declare function parseCachedChatSession(raw: string): CachedChatSession | null;
export declare function serializeCachedChatSession(session: CachedChatSession): string;
