import type { ProductId, WidgetProfile } from "../types";
import type { Turn } from "../types";

export interface ChatHistoryScope {
  tenantId: string;
  productId: ProductId;
  profile?: WidgetProfile;
  endUserId?: string;
}

export interface CachedChatSession {
  sessionId: string;
  turns: Turn[];
  updatedAt: number;
}

/** Minimal async key-value store (AsyncStorage, MMKV, SecureStore wrapper, etc.). */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface ChatStorage {
  /** Optional for backwards compatibility with custom storage adapters. */
  list?(scope: ChatHistoryScope): Promise<CachedChatSession[]>;
  load(scope: ChatHistoryScope): Promise<CachedChatSession | null>;
  save(scope: ChatHistoryScope, session: CachedChatSession): Promise<void>;
  /** Clear only the active session, retaining recent conversations. */
  clearCurrent?(scope: ChatHistoryScope): Promise<void>;
  clear(scope: ChatHistoryScope): Promise<void>;
}
