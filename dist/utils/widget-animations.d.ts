export declare const WIDGET_PANEL_EXIT_MS = 280;
export declare const WIDGET_TURN_ENTER_MS = 380;
export declare function useEnteringTurnIds(turnIds: Array<string | undefined>): Set<string>;
export declare function useWidgetSheetAnimation(visible: boolean): {
    mounted: boolean;
    backdropOpacity: any;
    panelTranslateY: any;
    panelScale: any;
    progress: any;
};
export declare function useTurnEnterAnimation(active: boolean, role: "user" | "agent"): {
    style: {
        opacity: any;
        transform: ({
            translateX: any;
            translateY?: undefined;
            scale?: undefined;
        } | {
            translateY: any;
            translateX?: undefined;
            scale?: undefined;
        } | {
            scale: any;
            translateX?: undefined;
            translateY?: undefined;
        })[];
    };
};
export declare function useLauncherBubbleAnimation(open: boolean): {
    style: {
        transform: {
            scale: any;
        }[];
    };
};
export declare function useThinkingDotAnimation(delayMs: number): {
    style: {
        transform: ({
            translateY: any;
            scale?: undefined;
        } | {
            scale: any;
            translateY?: undefined;
        })[];
        opacity: any;
    };
};
