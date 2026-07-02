import type { ComponentType, ReactNode } from "react";
import type { ViewStyle } from "react-native";
export type LinearGradientComponent = ComponentType<{
    colors: string[];
    locations?: number[];
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    style?: ViewStyle;
    children?: ReactNode;
}>;
export declare function loadLinearGradient(): LinearGradientComponent | null;
