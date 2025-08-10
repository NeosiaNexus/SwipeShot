import React, { JSX, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DISTANCE = width * 1.2;
const ROTATION_MAX_DEG = 12;

export interface DeckItem {
  id: string;
  uri: string;
}

interface Props {
  data: DeckItem[];
  onSwipeLeft?: (item: DeckItem) => void;
  onSwipeRight?: (item: DeckItem) => void;
  onEnd?: () => void;
}

export default function SwipeDeck({ data, onSwipeLeft, onSwipeRight, onEnd }: Props): JSX.Element {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const current = data[index];
  const next = data[index + 1];

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [`-${ROTATION_MAX_DEG}deg`, '0deg', `${ROTATION_MAX_DEG}deg`],
    extrapolate: 'clamp',
  });

  const currentCardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  };

  const nextCardScale = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.96, 0.97, 0.96],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [],
  );

  function resetPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }

  function forceSwipe(direction: 'left' | 'right') {
    const toX = direction === 'right' ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  }

  function onSwipeComplete(direction: 'left' | 'right') {
    const item = data[index];
    if (direction === 'left') onSwipeLeft?.(item);
    else onSwipeRight?.(item);
    position.setValue({ x: 0, y: 0 });
    const nextIndex = index + 1;
    if (nextIndex >= data.length) {
      setIndex(nextIndex);
      onEnd?.();
    } else {
      setIndex(nextIndex);
    }
  }

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text>Plus rien à trier 🎉</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Next card */}
      {next && (
        <Animated.View style={[styles.card, { transform: [{ scale: nextCardScale }] }]}>
          <Image source={{ uri: next.uri }} style={styles.image} />
        </Animated.View>
      )}

      {/* Current card */}
      <Animated.View {...panResponder.panHandlers} style={[styles.card, currentCardStyle]}>
        <Image source={{ uri: current.uri }} style={styles.image} />
      </Animated.View>

      {/* Actions (optionnelles) */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => forceSwipe('left')}>
          <Text>🗑️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => forceSwipe('right')}>
          <Text>✅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: height * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#111',
    marginBottom: 16,
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  actions: { position: 'absolute', bottom: 24, flexDirection: 'row', gap: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#222', borderRadius: 999 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
