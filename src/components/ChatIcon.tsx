import React from "react";
import Svg, { Path } from "react-native-svg";

const paths = {
  attachment: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  microphone: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8",
  send: "M12 19V5m-7 7 7-7 7 7",
  back: "m15 18-6-6 6-6",
  close: "m18 6-12 12M6 6l12 12",
  more: "M4 12h.01M12 12h.01M20 12h.01",
  history: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
} as const;

export function ChatIcon({ name, color, size = 20 }: { name: keyof typeof paths; color: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityElementsHidden>
    <Path d={paths[name]} stroke={color} strokeWidth={name === "more" ? 3 : 2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
