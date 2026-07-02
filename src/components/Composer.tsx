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
  sendButtonActiveStyle,
  themeSurfaceColors,
} from "../theme/resolve-colors";

interface ComposerProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled: boolean;
  config: WidgetConfig;
  colorScheme: ColorScheme;
  inputBackground?: string;
}

export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
  config,
  colorScheme,
  inputBackground,
}: ComposerProps) {
  const surfaces = themeSurfaceColors(colorScheme);
  const sendStyle = sendButtonActiveStyle(config, colorScheme);
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View
      style={[
        styles.shell,
        {
          borderTopColor: surfaces.border,
          backgroundColor: inputBackground ?? surfaces.background,
        },
      ]}
    >
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: surfaces.border,
            backgroundColor: colorScheme === "dark" ? "#27272A" : "#FFFFFF",
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: surfaces.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={surfaces.muted}
          multiline
          editable={!disabled}
          onSubmitEditing={canSend ? onSend : undefined}
        />
        <Pressable
          onPress={canSend ? onSend : undefined}
          disabled={!canSend}
          style={[
            styles.sendBtn,
            canSend
              ? { backgroundColor: sendStyle.backgroundColor }
              : styles.sendBtnDisabled,
          ]}
        >
          {disabled ? (
            <ActivityIndicator size="small" color={surfaces.muted} />
          ) : (
            <Text
              style={[
                styles.sendLabel,
                { color: canSend ? sendStyle.color : surfaces.muted },
              ]}
            >
              ↑
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: "transparent",
  },
  sendLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
});
