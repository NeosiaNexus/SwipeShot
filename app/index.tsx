import React, { useCallback, useEffect } from 'react';

import * as Haptics from 'expo-haptics';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActionBar from '../components/ActionBar';
import PhotoCard from '../components/PhotoCard';
import { useMediaLibrary } from '../hooks/useMediaLibrary';
import { useSwipeDeck } from '../hooks/useSwipeDeck';

export default function HomeScreen() {
  const lib = useMediaLibrary({ pageSize: 200, mediaTypes: ['photo', 'video'] });

  const {
    current,
    next,
    currentCardStyle,
    nextCardScale,
    panResponder,
    forceSwipe,
    resetPosition,
    index,
    setIndex,
  } = useSwipeDeck(lib.assets, {
    resetKey: lib.refreshSeq,
    onSwipe: (direction, item) => {
      if (direction === 'left') lib.queue.enqueue(item.id);
    },
  });

  const onKeep = useCallback(() => {
    Haptics.selectionAsync();
    forceSwipe('right');
  }, [forceSwipe]);

  const onReject = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    forceSwipe('left');
  }, [forceSwipe]);

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
  }, [index, lib.page.hasNextPage, lib.assets.length, lib.loadMore]);

  if (lib.permission.status !== 'granted') {
    return (
      <View style={styles.center}>
        <Text>Autorise l’accès aux photos pour commencer.</Text>
      </View>
    );
  }

  if (lib.status === 'loadingInitial') {
    return (
      <View style={styles.center}>
        <Text>Chargement de la pellicule…</Text>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 8 }}>Plus rien à trier 🎉</Text>
        <Text>
          {lib.queue.count ? `${lib.queue.count} en attente de suppression` : 'Pellicule clean !'}
        </Text>
        <ActionBar
          purging={lib.status === 'purging'}
          queuedCount={lib.queue.count}
          onKeep={() => {}}
          onPurge={lib.purge}
          onReject={() => {}}
          onUndo={onUndo}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        key={current.id}
        style={[styles.currentWrapper, currentCardStyle]}
      >
        <PhotoCard uri={current.uri} />
      </Animated.View>
      {next && (
        <Animated.View
          pointerEvents="none"
          style={[styles.nextWrapper, { transform: [{ scale: nextCardScale }] }]}
        >
          <PhotoCard key={next.id} uri={next.uri} />
        </Animated.View>
      )}
      <ActionBar
        purging={lib.status === 'purging'}
        queuedCount={lib.queue.count}
        onKeep={onKeep}
        onPurge={lib.purge}
        onReject={onReject}
        onUndo={onUndo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nextWrapper: { position: 'absolute', left: 16, right: 16, top: 64, zIndex: 1 },
  currentWrapper: { position: 'absolute', left: 16, right: 16, top: 64, zIndex: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
