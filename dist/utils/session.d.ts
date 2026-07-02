import type { WidgetConfig } from "../types";
export declare function mergeWidgetConfig(patch?: Partial<WidgetConfig>): WidgetConfig;
export declare function createChatSessionId(prefix?: string): string;
export declare function createTurnId(prefix: string): string;
export declare function logoLetter(displayName: string): string;
