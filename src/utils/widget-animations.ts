import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

export const WIDGET_PANEL_EXIT_MS = 280;
export const WIDGET_TURN_ENTER_MS = 380;

export function useEnteringTurnIds(
  turnIds: Array<string | undefined>,
): Set<string> {
  const seenTurnIds = useRef(new Set<string>());
  const isInitialMount = useRef(true);
  const [enteringTurnIds, setEnteringTurnIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    const currentIds = turnIds.filter((id): id is string => Boolean(id));

    if (isInitialMount.current) {
      currentIds.forEach((id) => seenTurnIds.current.add(id));
      isInitialMount.current = false;
      return;
    }

    const newIds = currentIds.filter((id) => !seenTurnIds.current.has(id));
    if (newIds.length === 0) return;

    newIds.forEach((id) => seenTurnIds.current.add(id));
    setEnteringTurnIds(new Set(newIds));

    const timer = setTimeout(
      () => setEnteringTurnIds(new Set()),
      WIDGET_TURN_ENTER_MS,
    );
    return () => clearTimeout(timer);
  }, [turnIds]);

  return enteringTurnIds;
}

export function useWidgetSheetAnimation(visible: boolean) {
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(progress, {
        toValue: 1,
        useNativeDriver: true,
        damping: 24,
        stiffness: 290,
        mass: 0.85,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: WIDGET_PANEL_EXIT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }: { finished: boolean }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const panelTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
  });
  const panelScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return { mounted, backdropOpacity, panelTranslateY, panelScale, progress };
}

export function useTurnEnterAnimation(active: boolean, role: "user" | "agent") {
  const opacity = useRef(new Animated.Value(active ? 0 : 1)).current;
  const translateX = useRef(
    new Animated.Value(active && role === "user" ? 10 : active ? -8 : 0),
  ).current;
  const translateY = useRef(new Animated.Value(active ? 6 : 0)).current;
  const scale = useRef(new Animated.Value(active ? 0.86 : 1)).current;

  useEffect(() => {
    if (!active) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 340,
        mass: 0.75,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 340,
        mass: 0.75,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        stiffness: 320,
        mass: 0.7,
      }),
    ]).start();
  }, [active, opacity, role, translateX, translateY, scale]);

  return {
    style: {
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    },
  };
}

export function useLauncherBubbleAnimation(open: boolean) {
  const scale = useRef(new Animated.Value(open ? 0.95 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: open ? 0.95 : 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 320,
      mass: 0.7,
    }).start();
  }, [open, scale]);

  return { style: { transform: [{ scale }] } };
}

export function useThinkingDotAnimation(delayMs: number) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -5,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.25,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 260,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 260,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 260,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1200 - delayMs - 520),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delayMs, translateY, scale, opacity]);

  return { style: { transform: [{ translateY }, { scale }], opacity } };
}
