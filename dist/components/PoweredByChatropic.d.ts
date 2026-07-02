import React from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import type { ColorScheme } from "../types";
interface PoweredByChatropicProps {
    colorScheme?: ColorScheme;
    label?: string;
    style?: StyleProp<ViewStyle>;
}
export declare function PoweredByChatropic({ colorScheme, label, style, }: PoweredByChatropicProps): React.JSX.Element;
export {};
