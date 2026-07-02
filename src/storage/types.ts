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
  load(scope: ChatHistoryScope): Promise<CachedChatSession | null>;
  save(scope: ChatHistoryScope, session: CachedChatSession): Promise<void>;
  clear(scope: ChatHistoryScope): Promise<void>;
}
