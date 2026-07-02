import React from "react";
import Svg, { Path } from "react-native-svg";
import type { ColorScheme } from "../types";

interface WidgetLauncherIconProps {
  colorScheme: ColorScheme;
  size?: number;
}

export function WidgetLauncherIcon({
  colorScheme,
  size = 28,
}: WidgetLauncherIconProps) {
  if (colorScheme === "dark") {
    return (
      <Svg width={size} height={size} viewBox="0 0 151 147" fill="none">
        <Path
          d="M37.5965 0H112.788C122.76 0 132.322 3.961 139.373 11.0116C146.423 18.0622 150.384 27.6249 150.384 37.596V82.7112C150.384 92.6823 146.423 102.245 139.373 109.296C132.322 116.346 122.76 120.307 112.788 120.307H63.9137L18.7985 146.624L33.8369 120.307C24.531 119.372 15.9078 115.002 9.65111 108.05C3.39445 101.098 -0.0463969 92.0638 0.000472593 82.7112V37.596C0.000472593 27.6249 3.96147 18.0622 11.0121 11.0116C18.0627 3.961 27.6254 0 37.5965 0Z"
          fill="#FAFAF9"
        />
        <Path
          d="M50.7551 65.793C67.0467 84.591 83.3383 84.591 99.6299 65.793"
          stroke="#0A0A0A"
          strokeWidth={7.488}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 143 140" fill="none">
      <Path
        d="M35.6464 0H106.938C116.392 0 125.459 3.75555 132.144 10.4405C138.829 17.1254 142.584 26.1921 142.584 35.646V78.4212C142.584 87.8751 138.829 96.9418 132.144 103.627C125.459 110.312 116.392 114.067 106.938 114.067H60.5986L17.8234 139.019L32.0818 114.067C23.2586 113.181 15.0827 109.037 9.15054 102.446C3.21839 95.8545 -0.0439904 87.2887 0.000448081 78.4212V35.646C0.000448081 26.1921 3.756 17.1254 10.4409 10.4405C17.1258 3.75555 26.1925 0 35.6464 0Z"
        fill="#0A0A0A"
      />
      <Path
        d="M48.1226 62.3806C63.5692 80.2036 79.0158 80.2036 94.4624 62.3806"
        stroke="#FAFAF9"
        strokeWidth={7.488}
        strokeLinecap="round"
      />
    </Svg>
  );
}
