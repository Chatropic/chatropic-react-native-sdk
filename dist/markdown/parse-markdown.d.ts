export type InlineSpan = {
    type: "text";
    value: string;
} | {
    type: "bold";
    value: string;
} | {
    type: "italic";
    value: string;
} | {
    type: "code";
    value: string;
} | {
    type: "link";
    value: string;
    href: string;
};
export type MarkdownBlock = {
    type: "paragraph";
    lines: InlineSpan[][];
} | {
    type: "ul";
    items: InlineSpan[][];
} | {
    type: "ol";
    items: InlineSpan[][];
};
export declare function parseInlineMarkdown(line: string): InlineSpan[];
export declare function parseAgentMarkdown(content: string): MarkdownBlock[];
