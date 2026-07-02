import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import { textColorForBubble } from "../theme/colors";
import { resolveWidgetBranding } from "../utils/branding";
import { ChatropicBrandLogo } from "./ChatropicBrandLogo";

interface WidgetHeaderProps {
  config: WidgetConfig;
  colorScheme?: ColorScheme;
  onClose?: () => void;
  onBack?: () => void;
  showMenu?: boolean;
  topInset?: number;
  conversationResolved?: boolean;
}

export function WidgetHeader({
  config,
  colorScheme = "light",
  onClose,
  onBack,
  showMenu = true,
  topInset = 0,
  conversationResolved = false,
}: WidgetHeaderProps) {
  const branding = resolveWidgetBranding(config);
  const headerBg = config.headerColor;
  const headerTextColor = textColorForBubble(headerBg);
  const iconColor =
    headerTextColor === "#FFFFFF" ? "rgba(255,255,255,0.7)" : "#71717A";
  const headerBorder =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
        },
      ]}
    >
      <View style={{ paddingTop: topInset }}>
        <View style={styles.content}>
          <View style={styles.left}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                style={styles.backBtn}
                accessibilityLabel="Back"
                hitSlop={8}
              >
                <Text style={[styles.backIcon, { color: headerTextColor }]}>‹</Text>
              </Pressable>
            ) : null}
            {branding.usePlatformLogo ? (
              <ChatropicBrandLogo colorScheme={colorScheme} size={24} />
            ) : (
              <Image source={{ uri: branding.logoUrl }} style={styles.logo} />
            )}
            <Text style={[styles.title, { color: headerTextColor }]} numberOfLines={1}>
              {branding.displayName}
            </Text>
            {conversationResolved ? (
              <View style={styles.resolvedBadge}>
                <Text style={styles.resolvedText}>✓ Resolved</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actions}>
            {showMenu && !onClose && !onBack ? (
              <Pressable
                style={styles.iconBtn}
                accessibilityLabel="More options"
              >
                <Text style={[styles.menuIcon, { color: iconColor }]}>···</Text>
              </Pressable>
            ) : null}
            {onClose ? (
              <Pressable
                onPress={onClose}
                style={styles.iconBtn}
                accessibilityLabel="Close chat"
                hitSlop={8}
              >
                <Text style={[styles.menuIcon, { color: iconColor }]}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    overflow: "hidden",
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
    marginTop: -2,
  },
  logo: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.20)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.30)",
  },
  resolvedText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#34D399",
  },
});
