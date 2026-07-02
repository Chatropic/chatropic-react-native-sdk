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
