import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ColorScheme, WidgetConfig } from "../types";
import {
  resolveSaasInputBackground,
  sendButtonActiveStyle,
  themeSurfaceColors,
} from "../theme/resolve-colors";
import { glassSurfaces } from "../theme/widget-glass";
import { useBottomSafeInset } from "../utils/safe-area";
import { useChatWidget } from "../provider/ChatWidgetProvider";
import { PoweredByChatropic } from "./PoweredByChatropic";
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

function ComposerIcon({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      disabled
      style={styles.iconBtn}
      accessibilityLabel={label}
    >
      {typeof children === "string" ? (
        <Text style={[styles.gifLabel, { color }]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
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
  const { toggleVoiceSession } = useChatWidget();
  const surfaces = themeSurfaceColors(colorScheme);
  const isDark = colorScheme === "dark";
  const glass = glassSurfaces(colorScheme);
  const canSend = value.trim().length > 0 && !disabled;
  const sendStyle = sendButtonActiveStyle(config, colorScheme);
  const bottomInset = useBottomSafeInset();
  const iconColor = glass.composerIcon;
  const inputBackground = resolveSaasInputBackground(config, colorScheme);

  return (
    <View style={[styles.shell, { paddingBottom: 4 + bottomInset }]}>
      <View
        style={[
          styles.card,
          {
            borderColor: glass.inputBorder,
            backgroundColor: inputBackground,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: surfaces.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || "Message…"}
          placeholderTextColor={isDark ? glass.textMuted : "#A1A1AA"}
          multiline
          editable={!disabled}
        />

        <View style={styles.actionRow}>
          <View style={styles.iconRow}>
            <ComposerIcon label="Attach file" color={iconColor}>
              <Text style={[styles.iconGlyph, { color: iconColor }]}>📎</Text>
            </ComposerIcon>
            <ComposerIcon label="Add emoji" color={iconColor}>
              <Text style={[styles.iconGlyph, { color: iconColor }]}>☺</Text>
            </ComposerIcon>
            <ComposerIcon label="Add GIF" color={iconColor}>
              GIF
            </ComposerIcon>
          </View>

          {config.showVoice && !canSend ? (
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
          ) : (
            <Pressable
              onPress={canSend ? onSend : undefined}
              disabled={!canSend || disabled}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: canSend
                    ? sendStyle.backgroundColor
                    : glass.sendSurface,
                },
              ]}
              accessibilityLabel="Send message"
            >
              {disabled ? (
                <ActivityIndicator size="small" color={surfaces.muted} />
              ) : (
                <Text
                  style={[
                    styles.sendArrow,
                    {
                      color: canSend ? sendStyle.color : glass.sendIcon,
                    },
                  ]}
                >
                  ↑
                </Text>
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
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  poweredBy: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 0,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  input: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 28,
    maxHeight: 120,
    paddingVertical: 0,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  iconGlyph: {
    fontSize: 16,
  },
  gifLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendArrow: {
    fontSize: 16,
    fontWeight: "700",
  },
});
