import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { themeSurfaceColors } from "../theme/resolve-colors";
import { useBottomSafeInset } from "../utils/safe-area";
import { ChatIcon } from "./ChatIcon";
import type { CachedChatSession } from "../storage/types";

function formatRecentChatTime(timestamp: number): string {
  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RecentChats({ onSelect, onStartNew }: { onSelect: () => void; onStartNew: () => void }) {
  const { recentChats, refreshRecentChats, resumeChat, colorScheme, inputLocked } = useChatWidget();
  const colors = themeSurfaceColors(colorScheme);
  const inset = useBottomSafeInset();
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    refreshRecentChats().catch(() => { if (active) setError("Unable to load recent chats. Try opening this list again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshRecentChats]);
  const select = async (chat: CachedChatSession) => {
    if (opening || inputLocked) return;
    setOpening(true); setError("");
    request.current = new AbortController();
    try { await resumeChat(chat, request.current.signal); if (!request.current.signal.aborted) onSelect(); }
    catch { setError("Unable to open this chat. Check your connection and try again."); }
    finally { setOpening(false); }
  };
  return <View style={styles.root}>
    {loading ? <ActivityIndicator style={styles.empty} color={colors.muted} /> : recentChats.length ? (
      <ScrollView contentContainerStyle={styles.list}>
        {recentChats.map(chat => <Pressable key={chat.sessionId} onPress={() => void select(chat)} disabled={opening || inputLocked} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: colorScheme === "dark" ? "#18181B" : "#F4F4F5" }]}><ChatIcon name="history" color={colors.muted} size={18} /></View>
          <View style={styles.label}>
            <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>{chat.turns.find(turn => turn.role === "user")?.text?.trim() || "Image conversation"}</Text>
            <Text style={[styles.time, { color: colors.muted }]}>{formatRecentChatTime(chat.updatedAt)}</Text>
          </View>
        </Pressable>)}
      </ScrollView>
    ) : <View style={styles.empty}>
      <ChatIcon name="history" color={colors.muted} size={28} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No chats</Text>
      <Text style={[styles.description, { color: colors.muted }]}>Chats with AI and team will be shown here</Text>
    </View>}
    {!!error && <Text accessibilityRole="alert" style={[styles.description, { color: colors.foreground }]}>{error}</Text>}
    {opening && <ActivityIndicator color={colors.muted} />}
    <View style={[styles.footer, { paddingBottom: 28 + inset }]}>
      <Pressable disabled={opening || inputLocked || loading} onPress={onStartNew} style={[styles.newChat, { backgroundColor: colors.foreground, opacity: opening || inputLocked || loading ? 0.5 : 1 }]}>
        <Text style={{ color: colors.background, fontSize: 14, fontWeight: "500" }}>Start a new chat</Text>
      </Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, list: { padding: 12, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, minWidth: 0 }, title: { fontSize: 14, fontWeight: "500" }, time: { marginTop: 2, fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  emptyTitle: { fontSize: 22, fontWeight: "600" }, description: { fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
  footer: { alignItems: "center", paddingTop: 12 }, newChat: { borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
});
