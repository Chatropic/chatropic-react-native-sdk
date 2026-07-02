import React from "react";
import type { ColorScheme, WidgetConfig } from "../types";
interface PrivacyBannerProps {
    config: WidgetConfig;
    colorScheme: ColorScheme;
    dismissed: boolean;
    onDismiss: () => void;
}
export declare function PrivacyBanner({ config, colorScheme, dismissed, onDismiss, }: PrivacyBannerProps): React.JSX.Element | null;
export {};
