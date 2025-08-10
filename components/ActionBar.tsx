import React, { JSX } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onUndo(): void;
  onPurge(): void;
  queuedCount: number;
  purging?: boolean;
}

export default function ActionBar({ onUndo, onPurge, queuedCount, purging }: Props): JSX.Element {
  return (
    <View style={styles.actions}>
      <Pressable style={[styles.surface, styles.shadow, styles.circleBtn]} onPress={onUndo}>
        <Ionicons color="#4099ff" name="return-up-back" size={24} />
      </Pressable>

      <Pressable
        style={[styles.surface, styles.shadow, styles.circleBtn]}
        onPress={() => Alert.alert('Fonctionnalité non implémentée')}
      >
        <MaterialIcons color="#29ff37" name="favorite" size={24} />
      </Pressable>

      <Pressable
        disabled={purging || queuedCount === 0}
        style={[styles.surface, styles.shadow, styles.pillBtn, purging && styles.disabled]}
        onPress={onPurge}
      >
        {purging ? (
          <ActivityIndicator />
        ) : (
          <>
            <MaterialIcons color="#ff1f31" name="delete" size={30} />
            <Text style={styles.count}>{queuedCount}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const S = {
  white: '#fff',
  black: '#000',
  gap: 12,
  radiusCircle: 999,
  radiusPill: 10,
  btnSize: 55,
  padX: 10,
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: S.gap,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surface: {
    backgroundColor: S.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: S.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circleBtn: {
    width: S.btnSize,
    height: S.btnSize,
    borderRadius: S.radiusCircle,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: S.radiusPill,
    paddingHorizontal: S.padX,
    height: S.btnSize,
    gap: 6,
  },
  count: {
    fontWeight: '600',
  },
  disabled: { opacity: 0.6 },
});
