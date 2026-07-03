import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect } from "react";
import { BackHandler, StatusBar, StyleSheet, View } from "react-native";
import { ChatWidgetProvider, useChatWidget } from "../provider/ChatWidgetProvider";
import { ChatWidgetBody } from "./ChatWidgetBody";
import { glassPageBackdropColors } from "../theme/widget-glass";
function FullscreenStatusBar() {
    const { config, colorScheme } = useChatWidget();
    const barStyle = colorScheme === "dark" ? "light-content" : "dark-content";
    return _jsx(StatusBar, { barStyle: barStyle });
}
function GlassBackdrop({ children }) {
    const { config, colorScheme } = useChatWidget();
    const backdrop = glassPageBackdropColors(colorScheme, config.userBubbleColor);
    return (_jsx(View, { style: [styles.root, { backgroundColor: backdrop.backgroundColor }], children: children }));
}
/** Inner component rendered inside ChatWidgetProvider for themed fullscreen UI. */
function FullscreenContent({ onBack, }) {
    const handleBack = useCallback(() => {
        onBack?.();
    }, [onBack]);
    const onHardwareBack = useCallback(() => {
        handleBack();
        // Always consume the event — fullscreen chat owns the back action.
        return true;
    }, [handleBack]);
    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
        return () => sub.remove();
    }, [onHardwareBack]);
    return (_jsxs(GlassBackdrop, { children: [_jsx(FullscreenStatusBar, {}), _jsx(ChatWidgetBody, { variant: "fullscreen", onBack: handleBack })] }));
}
export function ChatWidgetScreen(props) {
    return (_jsx(ChatWidgetProvider, { ...props, profile: props.profile ?? "mobile", children: _jsx(FullscreenContent, { onBack: props.onBack }) }));
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
});
