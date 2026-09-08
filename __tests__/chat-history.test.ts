import {
  buildChatHistoryScopeKey,
  dedupeTurnsById,
  parseCachedChatSession,
  sanitizeTurnsForStorage,
  serializeCachedChatSession,
} from "../src/storage/chat-history";
import type { Turn } from "../src/types";

describe("chat history storage", () => {
  it("builds a stable scope key", () => {
    expect(
      buildChatHistoryScopeKey({
        tenantId: "tenant-1",
        productId: "customer_support",
        profile: "mobile",
        endUserId: "user-42",
      }),
    ).toBe(
      "@chatropic/rn/v1/tenant-1/customer_support/mobile/user-42",
    );
  });

  it("drops in-flight turns before persisting", () => {
    const turns: Turn[] = [
      { id: "a1", role: "agent", text: "Hi", running: false },
      { id: "a2", role: "agent", text: "...", running: true },
    ];
    expect(sanitizeTurnsForStorage(turns)).toEqual([
      { id: "a1", role: "agent", text: "Hi", running: false },
    ]);
  });

  it("dedupes turns by id", () => {
    const turns: Turn[] = [
      { id: "u1", role: "user", text: "Hello" },
      { id: "u1", role: "user", text: "Hello again" },
    ];
    expect(dedupeTurnsById(turns)).toHaveLength(1);
  });

  it("round-trips cached sessions", () => {
    const session = {
      sessionId: "rn-abc",
      updatedAt: 1_700_000_000_000,
      turns: [{ id: "u1", role: "user" as const, text: "Need help" }],
    };
    const parsed = parseCachedChatSession(
      serializeCachedChatSession(session),
    );
    expect(parsed).toEqual({
      ...session,
      turns: [{ id: "u1", role: "user", text: "Need help", running: false }],
    });
  });
});

import { createChatStorage, createMemoryKeyValueStorage } from "../src/storage/create-chat-storage";

const scope = { tenantId: "tenant-1", productId: "customer_support", endUserId: "alice" };
const cached = (sessionId: string, updatedAt: number) => ({ sessionId, updatedAt, turns: [{ id: `u-${sessionId}`, role: "user" as const, text: sessionId }] });

describe("recent conversation archive", () => {
  it("retains concurrent sessions, updates existing ones and orders newest first", async () => {
    const storage = createChatStorage(createMemoryKeyValueStorage());
    await Promise.all([storage.save(scope, cached("one", 1)), storage.save(scope, cached("two", 2)), storage.save(scope, cached("one", 3))]);
    expect((await storage.list!(scope)).map(row => row.sessionId)).toEqual(["one", "two"]);
    expect((await storage.load(scope))?.sessionId).toBe("one");
  });

  it("preserves history on new chat but clears all history on explicit clear", async () => {
    const storage = createChatStorage(createMemoryKeyValueStorage());
    await storage.save(scope, cached("one", 1));
    await storage.clearCurrent!(scope);
    expect(await storage.load(scope)).toBeNull();
    expect(await storage.list!(scope)).toHaveLength(1);
    await storage.clear(scope);
    expect(await storage.list!(scope)).toEqual([]);
  });

  it("isolates tenants, users and profiles", async () => {
    const storage = createChatStorage(createMemoryKeyValueStorage());
    await storage.save(scope, cached("one", 1));
    for (const other of [{ ...scope, tenantId: "other" }, { ...scope, endUserId: "bob" }, { ...scope, profile: "saas" as const }]) {
      expect(await storage.list!(other)).toEqual([]);
    }
  });

  it("migrates the previous current-session cache and tolerates a corrupt archive", async () => {
    const kv = createMemoryKeyValueStorage();
    await kv.setItem(buildChatHistoryScopeKey(scope), serializeCachedChatSession(cached("legacy", 1)));
    await kv.setItem(`${buildChatHistoryScopeKey(scope)}/recent`, "broken");
    expect((await createChatStorage(kv).list!(scope)).map(row => row.sessionId)).toEqual(["legacy"]);
  });

  it("bounds history and strips incomplete streaming turns", async () => {
    const storage = createChatStorage(createMemoryKeyValueStorage());
    await Promise.all(Array.from({ length: 35 }, (_, i) => storage.save(scope, { ...cached(String(i), i), turns: [...cached(String(i), i).turns, { id: "pending", role: "agent", running: true }] })));
    const rows = await storage.list!(scope);
    expect(rows).toHaveLength(30);
    expect(rows[0].sessionId).toBe("34");
    expect(rows.every(row => row.turns.every(turn => !turn.running))).toBe(true);
  });
});
