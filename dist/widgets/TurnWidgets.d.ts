import React from "react";
import type { ColorScheme } from "../types";
import { type ProductWidgetItem } from "./product-widget-items";
interface NavigationCardProps {
    label: string;
    path: string;
    requiresAuth?: boolean;
    colorScheme: ColorScheme;
    onNavigate: (path: string) => void;
}
export declare function NavigationCard({ label, path, requiresAuth, colorScheme, onNavigate, }: NavigationCardProps): React.JSX.Element;
interface UnknownWidgetFallbackProps {
    component: string;
    props: Record<string, unknown>;
    colorScheme: ColorScheme;
}
export declare function UnknownWidgetFallback({ component, props, colorScheme, }: UnknownWidgetFallbackProps): React.JSX.Element;
interface ProductListWidgetProps {
    component: string;
    props: Record<string, unknown>;
    colorScheme: ColorScheme;
    disabled?: boolean;
    onAddToCart?: (message: string, item: ProductWidgetItem, displayMessage: string) => void;
}
export declare function ProductListWidget({ component, props, colorScheme, disabled, onAddToCart, }: ProductListWidgetProps): React.JSX.Element;
export {};
