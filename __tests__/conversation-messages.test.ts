import { mergeServerTurns, serverMessagesToTurns } from "../src/client/conversation-messages";

describe("conversation messages", () => {
  it("maps server messages to turns without re-injecting welcome", () => {
    const turns = serverMessagesToTurns(
      [
        {
          id: "m1",
          role: "user",
          body: "Hello",
        },
      ],
      "Welcome",
    );
    expect(turns).toHaveLength(1);
    expect(turns[0]?.text).toBe("Hello");
  });

  it("returns welcome only for empty server history", () => {
    const turns = serverMessagesToTurns([], "Welcome");
    expect(turns).toHaveLength(1);
    expect(turns[0]).toMatchObject({ id: "welcome", role: "agent", text: "Welcome" });
  });

  it("does not duplicate welcome during server poll merge", () => {
    const local = [
      {
        id: "a-welcome",
        role: "agent" as const,
        text: "Hi, I'm Support assistant.",
        running: false,
        createdAt: 1000,
      },
      {
        id: "u1",
        role: "user" as const,
        text: "Where is my order?",
        running: false,
        createdAt: 2000,
      },
      {
        id: "m2",
        role: "agent" as const,
        text: "What's your order number?",
        running: false,
        createdAt: 3000,
      },
    ];
    const server = serverMessagesToTurns(
      [
        { id: "srv-u", role: "user", body: "Where is my order?", created_at: "2026-06-25T10:00:00Z" },
        {
          id: "srv-a",
          role: "assistant",
          body: "What's your order number?",
          created_at: "2026-06-25T10:00:05Z",
        },
      ],
      "Hi, I'm Support assistant.",
    );
    const merged = mergeServerTurns(local, server, "Hi, I'm Support assistant.");
    const greetings = merged.filter(
      (turn) => turn.role === "agent" && turn.text === "Hi, I'm Support assistant.",
    );
    expect(greetings).toHaveLength(1);
    expect(merged[0]?.text).toBe("Hi, I'm Support assistant.");
  });

  it("does not duplicate persisted turns when local and server ids differ", () => {
    const local = [
      { id: "local-u", role: "user" as const, text: "Where is my order?", createdAt: 1000 },
      {
        id: "local-a",
        role: "agent" as const,
        text: "I can help with that! What's your order number?",
        createdAt: 2000,
      },
    ];
    const server = [
      { id: "srv-u", role: "user" as const, text: "Where is my order?", createdAt: 1000 },
      {
        id: "srv-a",
        role: "agent" as const,
        text: "I can help with that! What's your order number?",
        createdAt: 2000,
      },
    ];
    const merged = mergeServerTurns(local, server);
    expect(merged).toHaveLength(2);
    expect(merged.map((turn) => turn.text)).toEqual([
      "Where is my order?",
      "I can help with that! What's your order number?",
    ]);
  });

  it("keeps local running turns when merging server history", () => {
    const local = [
      { id: "welcome", role: "agent" as const, text: "Hi", running: false },
      { id: "a1", role: "agent" as const, text: "...", running: true },
    ];
    const server = [
      { id: "welcome", role: "agent" as const, text: "Hi", running: false },
      { id: "m1", role: "user" as const, text: "Need help", running: false },
    ];
    const merged = mergeServerTurns(local, server, "Hi");
    expect(merged.find((turn) => turn.id === "a1")?.running).toBe(true);
  });

  it("does not duplicate when local optimistic turn text differs from server body", () => {
    // Simulates the streaming bug: local accumulated text differs from server-stored full_text
    const local = [
      { id: "u_local", role: "user" as const, text: "I need investment advice", createdAt: 1000, localId: "u_local" },
      { id: "a_local", role: "agent" as const, text: "# Investment Options\n- Beginner...", createdAt: 1001, localId: "a_local" },
    ];
    const server = [
      { id: "srv-u", role: "user" as const, text: "I need investment advice", createdAt: 900 },
      { id: "srv-a", role: "agent" as const, text: "# Investment Options for Nigerians\n- **Beginner...**", createdAt: 950 },
    ];
    const merged = mergeServerTurns(local, server);
    expect(merged).toHaveLength(2);
  });

  it("sorts user turn before agent turn when timestamps are equal or server agent timestamp predates user", () => {
    const local = [
      { id: "u_local", role: "user" as const, text: "Help", createdAt: 1000, localId: "u_local" },
      { id: "a_local", role: "agent" as const, text: "Sure!", createdAt: 1001, localId: "a_local" },
    ];
    const server = [
      // Server agent timestamp predates client user timestamp (clock skew)
      { id: "srv-u", role: "user" as const, text: "Help", createdAt: 900 },
      { id: "srv-a", role: "agent" as const, text: "Sure!", createdAt: 800 },
    ];
    const merged = mergeServerTurns(local, server);
    expect(merged).toHaveLength(2);
    expect(merged[0]!.role).toBe("user");
    expect(merged[1]!.role).toBe("agent");
  });

  it("maps human agent author from server ui metadata", () => {
    const turns = serverMessagesToTurns(
      [
        {
          id: "m-human",
          role: "assistant",
          body: "A human agent replied",
          ui: { author: "human_agent" },
        },
      ],
      "",
    );
    expect(turns[0]).toMatchObject({
      id: "m-human",
      role: "agent",
      author: "human_agent",
      text: "A human agent replied",
    });
  });
});
