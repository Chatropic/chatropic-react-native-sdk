import React, { useState } from "react";
import { useImageUploads } from "./use-image-uploads";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import {
  resolveSaasInputBackground,
  themeSurfaceColors,
} from "../theme/resolve-colors";
import { useBottomSafeInset } from "../utils/safe-area";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { PoweredByChatropic } from "./PoweredByChatropic";
import { PrivacyBanner } from "./PrivacyBanner";
import { ChatIcon } from "./ChatIcon";
import { VoiceWaveformIcon } from "./VoiceWaveformIcon";

interface WidgetComposerProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled: boolean;
  config: WidgetConfig;
  colorScheme: ColorScheme;
}

export function WidgetComposer({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
  config,
  colorScheme,
}: WidgetComposerProps) {
  const { toggleVoiceSession, privacyDismissed, dismissPrivacy } = useChatWidget();
  const uploads = useImageUploads();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const surfaces = themeSurfaceColors(colorScheme);
  const isDark = colorScheme === "dark";
  const canSend = (value.trim().length > 0 || uploads.drafts.length > 0) && uploads.ready && !disabled;
  const ink = isDark ? "#FAFAFA" : "#0A0A0A";
  const sendStyle = { backgroundColor: ink, color: isDark ? "#121214" : "#FFFFFF" };
  const bottomInset = useBottomSafeInset();
  const iconColor = isDark ? "#A1A1AA" : "#71717A";
  const inputBackground = resolveSaasInputBackground(config, colorScheme);

  return (
    <View style={[styles.shell, { paddingBottom: 4 + bottomInset }]}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 }}>
        {uploads.drafts.map(d => <View key={d.key} style={{ width: 88, padding: 4 }}>
          <Image source={{ uri: d.file.uri }} style={{ width: 80, height: 64, borderRadius: 10 }} accessibilityLabel={d.file.name} />
          <Text numberOfLines={1} style={{ color: surfaces.foreground, fontSize: 11 }}>{d.file.name}</Text>
          <Text accessibilityLiveRegion="polite" style={{ color: surfaces.foreground, fontSize: 11 }}>{d.error || (d.image ? "Ready" : `Uploading ${d.progress}%`)}</Text>
          {!!d.error && <Pressable disabled={disabled} accessibilityLabel={`Retry ${d.file.name}`} onPress={() => void uploads.retry(d)}><Text style={{ color: surfaces.foreground }}>Retry</Text></Pressable>}
          <Pressable disabled={disabled} accessibilityLabel={`Remove ${d.file.name}`} onPress={() => uploads.remove(d)}><Text style={{ color: surfaces.foreground }}>Remove</Text></Pressable>
        </View>)}
      </View>
      {!!uploads.error && <Text accessibilityRole="alert" style={{ color: surfaces.foreground }}>{uploads.error}</Text>}
      {sourcesOpen && <View style={{ flexDirection: "row", gap: 16, padding: 12 }}>
        {(["library", "camera"] as const).map(source => <Pressable key={source} disabled={disabled || uploads.picking} onPress={() => { setSourcesOpen(false); void uploads.pick(source); }} accessibilityLabel={source === "camera" ? "Take photo" : "Choose photos"}><Text style={{ color: surfaces.foreground }}>{source === "camera" ? "Take photo" : "Choose photos"}</Text></Pressable>)}
      </View>}
      <PrivacyBanner config={config} colorScheme={colorScheme} dismissed={privacyDismissed} onDismiss={dismissPrivacy} />
      <View
        style={[
          styles.card,
          {
            borderColor: ink,
            backgroundColor: inputBackground,
          },
        ]}
      >
        <Pressable accessibilityLabel="Attach file" disabled={!uploads.enabled || disabled || uploads.picking || uploads.drafts.length >= 4} onPress={() => setSourcesOpen(v => !v)} style={styles.iconBtn} hitSlop={6}>
          <ChatIcon name="attachment" color={iconColor} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: ink }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || "Message…"}
          placeholderTextColor="#A1A1AA"
          accessibilityLabel="Message the agent"
          multiline
          editable={!disabled}
        />
        <View style={styles.actions}>
          {config.showVoice && !canSend && !uploads.drafts.length ? (
            <>
            <Pressable accessibilityLabel="Use microphone" onPress={toggleVoiceSession} disabled={disabled} style={styles.iconBtn} hitSlop={6}>
              <ChatIcon name="microphone" color={iconColor} />
            </Pressable>
            <Pressable
              onPress={toggleVoiceSession}
              disabled={disabled}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: sendStyle.backgroundColor,
                },
              ]}
              accessibilityLabel="Start live voice"
            >
              <VoiceWaveformIcon active={false} color={sendStyle.color} />
            </Pressable>
            </>
          ) : (
            <Pressable
              onPress={canSend ? () => uploads.drafts.length ? uploads.send(value) : onSend() : undefined}
              disabled={!canSend || disabled}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: sendStyle.backgroundColor,
                  opacity: canSend ? 1 : 0.5,
                },
              ]}
              accessibilityLabel="Send message"
            >
              {disabled ? (
                <ActivityIndicator size="small" color={surfaces.muted} />
              ) : (
                <ChatIcon name="send" color={sendStyle.color} />
              )}
            </Pressable>
          )}
        </View>
      </View>
      <PoweredByChatropic
        colorScheme={colorScheme}
        label={config.poweredByLabel}
        style={styles.poweredBy}
      />
    </View>
  );
}

/** @deprecated Use WidgetComposer */
export const SaasWidgetComposer = WidgetComposer;

const styles = StyleSheet.create({
  shell: {
    paddingTop: 4,
  },
  poweredBy: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1.5,
    borderRadius: 28,
    minHeight: 52,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 7,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 20,
    minHeight: 28,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { width: 28, height: 32, alignItems: "center", justifyContent: "center" },
  sendBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
