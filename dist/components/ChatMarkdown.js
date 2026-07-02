import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Linking, StyleSheet, Text, View, } from "react-native";
import { parseAgentMarkdown, } from "../markdown/parse-markdown";
import { isSafeExternalUrl } from "../markdown/link-safety";
function InlineMarkdown({ spans, color, linkColor, textStyle, }) {
    return (_jsx(Text, { style: [styles.inline, textStyle, { color }], children: spans.map((span, index) => {
            switch (span.type) {
                case "bold":
                    return (_jsx(Text, { style: styles.bold, children: span.value }, index));
                case "italic":
                    return (_jsx(Text, { style: styles.italic, children: span.value }, index));
                case "code":
                    return (_jsx(Text, { style: styles.code, children: span.value }, index));
                case "link":
                    if (!isSafeExternalUrl(span.href)) {
                        return _jsx(Text, { children: span.value }, index);
                    }
                    return (_jsx(Text, { style: [styles.link, { color: linkColor }], onPress: () => {
                            void Linking.openURL(span.href);
                        }, children: span.value }, index));
                default:
                    return _jsx(Text, { children: span.value }, index);
            }
        }) }));
}
function MarkdownBlockView({ block, color, linkColor, }) {
    if (block.type === "paragraph") {
        return (_jsx(View, { style: styles.paragraph, children: block.lines.map((line, index) => (_jsx(InlineMarkdown, { spans: line, color: color, linkColor: linkColor }, index))) }));
    }
    if (block.type === "ul") {
        return (_jsx(View, { style: styles.list, children: block.items.map((item, index) => (_jsxs(View, { style: styles.listItem, children: [_jsx(Text, { style: [styles.bullet, { color }], children: "\u2022 " }), _jsx(View, { style: styles.listContent, children: _jsx(InlineMarkdown, { spans: item, color: color, linkColor: linkColor }) })] }, index))) }));
    }
    return (_jsx(View, { style: styles.list, children: block.items.map((item, index) => (_jsxs(View, { style: styles.listItem, children: [_jsx(Text, { style: [styles.bullet, { color }], children: `${index + 1}. ` }), _jsx(View, { style: styles.listContent, children: _jsx(InlineMarkdown, { spans: item, color: color, linkColor: linkColor }) })] }, index))) }));
}
export function ChatMarkdown({ content, color, linkColor, }) {
    const blocks = useMemo(() => parseAgentMarkdown(content), [content]);
    const resolvedLinkColor = linkColor ?? color;
    return (_jsx(View, { style: styles.root, children: blocks.map((block, index) => (_jsx(MarkdownBlockView, { block: block, color: color, linkColor: resolvedLinkColor }, index))) }));
}
const styles = StyleSheet.create({
    root: {
        gap: 10,
    },
    paragraph: {
        gap: 6,
    },
    inline: {
        fontSize: 14,
        lineHeight: 20,
    },
    bold: {
        fontWeight: "700",
    },
    italic: {
        fontStyle: "italic",
    },
    code: {
        fontFamily: "Menlo",
        fontSize: 13,
    },
    link: {
        textDecorationLine: "underline",
    },
    list: {
        gap: 8,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    bullet: {
        fontSize: 14,
        lineHeight: 20,
        width: 20,
        fontWeight: "500",
    },
    listContent: {
        flex: 1,
    },
});
