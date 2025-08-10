import React from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onReject(): void;
  onKeep(): void;
  onUndo(): void;
  onPurge(): void;
  queuedCount: number;
  purging?: boolean;
}

export default function ActionBar({
  onReject,
  onKeep,
  onUndo,
  onPurge,
  queuedCount,
  purging,
}: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.btn, styles.gray]} onPress={onUndo}>
        <Text>↩️ Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.dark]} onPress={onReject}>
        <Text>🗑️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.primary]} onPress={onKeep}>
        <Text>✅</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={purging || queuedCount === 0}
        style={[styles.btn, styles.danger, purging && styles.disabled]}
        onPress={onPurge}
      >
        {purging ? <ActivityIndicator /> : <Text>🔥 Purger {queuedCount}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0b0b0b',
  },
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#222',
  },
  gray: { backgroundColor: '#2a2a2a' },
  dark: { backgroundColor: '#1e1e1e' },
  primary: { backgroundColor: '#0ea5e9' },
  danger: { backgroundColor: '#ef4444' },
  disabled: { opacity: 0.6 },
});
