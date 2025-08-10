import React, { JSX, useCallback, useEffect } from 'react';

import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SwipeOverlay from '@/components/SwipeOverlay';

import ActionBar from '../components/ActionBar';
import PhotoCard from '../components/PhotoCard';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useSwipeDeck } from '../hooks/useSwipeDeck';

export default function HomeScreen(): JSX.Element {
  const lib = useMediaLibrary({ pageSize: 200, mediaTypes: ['photo'] });

  const {
    current,
    next,
    currentCardStyle,
    nextCardScale,
    panResponder,
    resetPosition,
    index,
    setIndex,
    labelLeftOpacity,
    labelRightOpacity,
  } = useSwipeDeck(lib.assets, {
    resetKey: lib.refreshSeq,
    onSwipe: (direction, item) => {
      if (direction === 'left') lib.queue.enqueue(item.id);
    },
  });

  const onUndo = useCallback(() => {
    const last = lib.queue.dequeueLast();
    if (last) {
      setIndex(i => Math.max(0, i - 1));
      resetPosition();
    }
  }, [lib.queue, resetPosition, setIndex]);

  useEffect(() => {
    if (lib.page.hasNextPage && index > lib.assets.length - 40) {
      lib.loadMore();
    }
  }, [index, lib]);

  if (lib.permission.status !== 'granted') {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Autorise l’accès aux photos pour commencer.</Text>
      </SafeAreaView>
    );
  }

  if (lib.status === 'loadingInitial') {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Chargement de la pellicule…</Text>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Plus rien à trier 🎉</Text>
        <Text>
          {lib.queue.count ? `${lib.queue.count} en attente de suppression` : 'Pellicule clean !'}
        </Text>
        <ActionBar
          purging={lib.status === 'purging'}
          queuedCount={lib.queue.count}
          onPurge={lib.purge}
          onUndo={onUndo}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View>
        <Animated.View
          {...panResponder.panHandlers}
          key={current.id}
          style={[styles.currentWrapper, currentCardStyle]}
        >
          <PhotoCard
            overlay={
              <SwipeOverlay leftOpacity={labelLeftOpacity} rightOpacity={labelRightOpacity} />
            }
            uri={current.uri}
          />
        </Animated.View>
        {next && (
          <Animated.View
            pointerEvents="none"
            style={[styles.nextWrapper, { transform: [{ scale: nextCardScale }] }]}
          >
            <PhotoCard key={next.id} uri={next.uri} />
          </Animated.View>
        )}
      </View>
      <ActionBar
        purging={lib.status === 'purging'}
        queuedCount={lib.queue.count}
        onPurge={lib.purge}
        onUndo={onUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, flexDirection: 'column', justifyContent: 'space-between' },
  nextWrapper: { zIndex: 1, top: 0 },
  currentWrapper: { zIndex: 2, top: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
