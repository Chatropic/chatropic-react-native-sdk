import React, { useMemo } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import {
  parseAgentMarkdown,
  type InlineSpan,
  type MarkdownBlock,
} from "../markdown/parse-markdown";
import { isSafeExternalUrl } from "../markdown/link-safety";

function InlineMarkdown({
  spans,
  color,
  linkColor,
  textStyle,
}: {
  spans: InlineSpan[];
  color: string;
  linkColor: string;
  textStyle?: TextStyle;
}) {
  return (
    <Text style={[styles.inline, textStyle, { color }]}>
      {spans.map((span, index) => {
        switch (span.type) {
          case "bold":
            return (
              <Text key={index} style={styles.bold}>
                {span.value}
              </Text>
            );
          case "italic":
            return (
              <Text key={index} style={styles.italic}>
                {span.value}
              </Text>
            );
          case "code":
            return (
              <Text key={index} style={styles.code}>
                {span.value}
              </Text>
            );
          case "link":
            if (!isSafeExternalUrl(span.href)) {
              return <Text key={index}>{span.value}</Text>;
            }
            return (
              <Text
                key={index}
                style={[styles.link, { color: linkColor }]}
                onPress={() => {
                  void Linking.openURL(span.href);
                }}
              >
                {span.value}
              </Text>
            );
          default:
            return <Text key={index}>{span.value}</Text>;
        }
      })}
    </Text>
  );
}

function MarkdownBlockView({
  block,
  color,
  linkColor,
}: {
  block: MarkdownBlock;
  color: string;
  linkColor: string;
}) {
  if (block.type === "paragraph") {
    return (
      <View style={styles.paragraph}>
        {block.lines.map((line, index) => (
          <InlineMarkdown
            key={index}
            spans={line}
            color={color}
            linkColor={linkColor}
          />
        ))}
      </View>
    );
  }

  if (block.type === "ul") {
    return (
      <View style={styles.list}>
        {block.items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={[styles.bullet, { color }]}>{"\u2022 "}</Text>
            <View style={styles.listContent}>
              <InlineMarkdown spans={item} color={color} linkColor={linkColor} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {block.items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={[styles.bullet, { color }]}>{`${index + 1}. `}</Text>
          <View style={styles.listContent}>
            <InlineMarkdown spans={item} color={color} linkColor={linkColor} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ChatMarkdown({
  content,
  color,
  linkColor,
}: {
  content: string;
  color: string;
  linkColor?: string;
}) {
  const blocks = useMemo(() => parseAgentMarkdown(content), [content]);
  const resolvedLinkColor = linkColor ?? color;

  return (
    <View style={styles.root}>
      {blocks.map((block, index) => (
        <MarkdownBlockView
          key={index}
          block={block}
          color={color}
          linkColor={resolvedLinkColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  paragraph: {
    gap: 6,
  },
  inline: {
    fontSize: 13,
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
    fontSize: 13,
    lineHeight: 20,
    width: 20,
    fontWeight: "500",
  },
  listContent: {
    flex: 1,
  },
});
