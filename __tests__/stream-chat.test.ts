import {
  parseSseBlock,
  emitBufferedBlocks,
  consumeSseResponseText,
  flushSseResponseText,
  extractAgentDisplayText,
  suggestedRepliesFromDoneData,
} from "../src/client/stream-chat";
import { mergeWidgetConfig, createChatSessionId } from "../src/utils/session";

describe("parseSseBlock", () => {
  it("parses event and data", () => {
    const block = 'event: agent:typing\ndata: {"delta":"Hi"}\n';
    const parsed = parseSseBlock(block);
    expect(parsed).toEqual({
      event: "agent:typing",
      data: { delta: "Hi" },
    });
  });

  it("returns null for empty blocks", () => {
    expect(parseSseBlock("")).toBeNull();
    expect(parseSseBlock(": keepalive")).toBeNull();
  });
});

describe("emitBufferedBlocks", () => {
  it("emits complete blocks and returns remainder", () => {
    const events: string[] = [];
    const remainder = emitBufferedBlocks(
      'event: agent:typing\ndata: {"delta":"A"}\n\nevent: agent:typing\ndata: {"delta":"B"}\n\npartial',
      (ev) => events.push(ev.event),
    );
    expect(events).toEqual(["agent:typing", "agent:typing"]);
    expect(remainder).toBe("partial");
  });
});

describe("consumeSseResponseText", () => {
  it("parses incremental xhr chunks using response offsets", () => {
    const events: string[] = [];
    const state = { buffer: "", receivedLength: 0 };
    const full =
      'event: agent:typing\ndata: {"delta":"Hi"}\n\n' +
      'event: agent:done\ndata: {"full_text":"Hi"}\n\n';

    consumeSseResponseText(state, full.slice(0, 28), (ev) =>
      events.push(ev.event),
    );
    consumeSseResponseText(state, full, (ev) => events.push(ev.event));
    flushSseResponseText(state, full, (ev) => events.push(ev.event));

    expect(events).toEqual(["agent:typing", "agent:done"]);
  });
});

describe("extractAgentDisplayText", () => {
  it("strips code fences and suggested reply trailers", () => {
    const text = "Hello world\n---suggested_replies---\n[]";
    expect(extractAgentDisplayText(text)).toBe("Hello world");
  });
});

describe("suggestedRepliesFromDoneData", () => {
  it("returns up to 3 replies", () => {
    const replies = suggestedRepliesFromDoneData({
      suggested_replies: ["One", "Two", "Three", "Four"],
    });
    expect(replies).toEqual(["One", "Two", "Three"]);
  });
});

describe("mergeWidgetConfig", () => {
  it("merges patch with defaults", () => {
    const config = mergeWidgetConfig({
      displayName: "Support",
      headerColor: "#7C3AED",
    });
    expect(config.displayName).toBe("Support");
    expect(config.headerColor).toBe("#7C3AED");
    expect(config.poweredByLabel).toContain("Chatropic");
    expect(config.showVoice).toBe(true);
  });

  it("allows consumers to explicitly disable voice", () => {
    const config = mergeWidgetConfig({ showVoice: false });
    expect(config.showVoice).toBe(false);
  });
});

describe("createChatSessionId", () => {
  it("prefixes session ids", () => {
    expect(createChatSessionId("rn")).toMatch(/^rn-/);
  });
});
