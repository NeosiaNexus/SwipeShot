import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { width } = Dimensions.get('window');

type Dir = 'left' | 'right';

export interface SwipeDeckItem {
  id: string;
  uri: string;
}

interface UseSwipeDeckOptions<T extends SwipeDeckItem> {
  thresholdRatio?: number;
  ejectDistanceRatio?: number;
  rotationMaxDeg?: number;
  durationMs?: number;
  onSwipe?: (direction: Dir, item: T) => void;
  onIndexChange?: (index: number) => void;
  resetKey?: number | string;
}

export function useSwipeDeck<T extends SwipeDeckItem>(
  data: T[],
  {
    thresholdRatio = 0.25,
    ejectDistanceRatio = 1.2,
    rotationMaxDeg = 12,
    durationMs = 200,
    onSwipe,
    onIndexChange,
    resetKey,
  }: UseSwipeDeckOptions<T> = {},
) {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [pendingReset, setPendingReset] = useState(false);

  const current = data[index];
  const next = data[index + 1];

  const SWIPE_THRESHOLD = width * thresholdRatio;
  const SWIPE_OUT_DISTANCE = width * ejectDistanceRatio;

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [`-${rotationMaxDeg}deg`, '0deg', `${rotationMaxDeg}deg`],
    extrapolate: 'clamp',
  });

  const currentCardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  } as const;

  const nextCardScale = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.96, 0.97, 0.96],
    extrapolate: 'clamp',
  });

  const labelRightOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const labelLeftOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [position]);

  const goToNext = useCallback(
    (dir: Dir) => {
      const item = data[index];
      if (!item) return;
      setIndex(i => i + 1);
      setPendingReset(true);
      onSwipe?.(dir, item);
    },
    [data, index, onSwipe],
  );

  const forceSwipe = useCallback(
    (direction: Dir) => {
      const toX = direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
      Animated.timing(position, {
        toValue: { x: toX, y: 0 },
        duration: durationMs,
        useNativeDriver: true,
      }).start(() => {
        goToNext(direction);
      });
    },
    [SWIPE_OUT_DISTANCE, durationMs, position, goToNext],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          position.setValue({ x: g.dx, y: g.dy });
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (g.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [SWIPE_THRESHOLD, forceSwipe, resetPosition, position],
  );

  useEffect(() => {
    if (!pendingReset) return;
    const id = requestAnimationFrame(() => {
      position.setValue({ x: 0, y: 0 });
      setPendingReset(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pendingReset, position]);

  useEffect(() => {
    if (index >= data.length) return;
    onIndexChange?.(index);
  }, [index, data.length, onIndexChange]);

  useEffect(() => {
    if (index > 0 && index >= data.length) {
      setIndex(Math.max(0, data.length - 1));
    }
  }, [data.length, index]);

  useEffect(() => {
    if (resetKey == null) return;
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [resetKey, position]);

  return {
    index,
    setIndex,
    position,
    current,
    next,
    currentCardStyle,
    nextCardScale,
    labelLeftOpacity,
    labelRightOpacity,
    panResponder,
    forceSwipe,
    resetPosition,
  } as const;
}
