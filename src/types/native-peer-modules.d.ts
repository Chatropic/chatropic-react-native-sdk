declare module "react-native" {
  import type * as React from "react";

  export type ViewStyle = Record<string, unknown>;
  export type TextStyle = Record<string, unknown>;
  export type ImageStyle = Record<string, unknown>;
  export type StyleProp<T> = T | T[] | false | null | undefined;
  export type PressableStateCallbackType = { pressed: boolean };

  export const ActivityIndicator: React.ComponentType<any>;
  export const Animated: any;
  export const BackHandler: any;
  export const Easing: any;
  export const Image: React.ComponentType<any>;
  export const Linking: any;
  export const Modal: React.ComponentType<any>;
  export const NativeModules: Record<string, any>;
  export const Platform: any;
  export const Pressable: React.ComponentType<any>;
  export class ScrollView extends React.Component<any> {
    scrollToEnd(options?: { animated?: boolean }): void;
  }
  export const StatusBar: React.ComponentType<any> & { setBarStyle?: (...args: any[]) => void };
  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
    flatten(style: any): any;
    absoluteFill: ViewStyle;
    absoluteFillObject: ViewStyle;
    hairlineWidth: number;
  };
  export const Text: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const View: React.ComponentType<any>;

  export namespace Animated {
    class Value {
      constructor(value: number);
      interpolate(config: any): any;
    }
  }
}

declare module "react-native-svg" {
  import type * as React from "react";

  const Svg: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const Defs: React.ComponentType<any>;
  export const G: React.ComponentType<any>;
  export const LinearGradient: React.ComponentType<any>;
  export const Path: React.ComponentType<any>;
  export const Rect: React.ComponentType<any>;
  export const Stop: React.ComponentType<any>;
  export default Svg;
}
