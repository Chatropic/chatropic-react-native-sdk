import {
  parseAgentMarkdown,
  parseInlineMarkdown,
} from "../src/markdown/parse-markdown";

describe("parseInlineMarkdown", () => {
  it("parses bold text", () => {
    expect(parseInlineMarkdown("**Check your balance**")).toEqual([
      { type: "bold", value: "Check your balance" },
    ]);
  });

  it("parses mixed inline formatting", () => {
    expect(
      parseInlineMarkdown("See [docs](https://example.com) for **details**"),
    ).toEqual([
      { type: "text", value: "See " },
      { type: "link", value: "docs", href: "https://example.com" },
      { type: "text", value: " for " },
      { type: "bold", value: "details" },
    ]);
  });
});

describe("parseAgentMarkdown", () => {
  it("parses bullet lists with bold items", () => {
    const blocks = parseAgentMarkdown(
      "Here's what I can help you with:\n\n- **Check your balance**\n- **View spending**",
    );

    expect(blocks).toEqual([
      {
        type: "paragraph",
        lines: [[{ type: "text", value: "Here's what I can help you with:" }]],
      },
      {
        type: "ul",
        items: [
          [{ type: "bold", value: "Check your balance" }],
          [{ type: "bold", value: "View spending" }],
        ],
      },
    ]);
  });
});
