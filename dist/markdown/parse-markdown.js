const INLINE_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
export function parseInlineMarkdown(line) {
    const spans = [];
    let lastIndex = 0;
    for (const match of line.matchAll(INLINE_PATTERN)) {
        const index = match.index ?? 0;
        if (index > lastIndex) {
            spans.push({ type: "text", value: line.slice(lastIndex, index) });
        }
        if (match[1]) {
            spans.push({ type: "bold", value: match[1] });
        }
        else if (match[2]) {
            spans.push({ type: "italic", value: match[2] });
        }
        else if (match[3]) {
            spans.push({ type: "code", value: match[3] });
        }
        else if (match[4] && match[5]) {
            spans.push({ type: "link", value: match[4], href: match[5] });
        }
        lastIndex = index + match[0].length;
    }
    if (lastIndex < line.length) {
        spans.push({ type: "text", value: line.slice(lastIndex) });
    }
    return spans.length > 0 ? spans : [{ type: "text", value: line }];
}
export function parseAgentMarkdown(content) {
    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index];
        if (!line.trim()) {
            index += 1;
            continue;
        }
        const unordered = line.match(/^[-*]\s+(.*)$/);
        if (unordered) {
            const items = [];
            while (index < lines.length) {
                const match = lines[index].match(/^[-*]\s+(.*)$/);
                if (!match)
                    break;
                items.push(parseInlineMarkdown(match[1]));
                index += 1;
            }
            blocks.push({ type: "ul", items });
            continue;
        }
        const ordered = line.match(/^\d+\.\s+(.*)$/);
        if (ordered) {
            const items = [];
            while (index < lines.length) {
                const match = lines[index].match(/^\d+\.\s+(.*)$/);
                if (!match)
                    break;
                items.push(parseInlineMarkdown(match[1]));
                index += 1;
            }
            blocks.push({ type: "ol", items });
            continue;
        }
        const paragraphLines = [];
        while (index < lines.length &&
            lines[index].trim() &&
            !/^[-*]\s+/.test(lines[index]) &&
            !/^\d+\.\s+/.test(lines[index])) {
            paragraphLines.push(lines[index]);
            index += 1;
        }
        blocks.push({
            type: "paragraph",
            lines: paragraphLines.map((paragraphLine) => parseInlineMarkdown(paragraphLine)),
        });
    }
    return blocks;
}
