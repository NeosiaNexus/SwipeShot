import React from 'react';

import { Image } from 'expo-image';
import { StyleSheet, Dimensions, View } from 'react-native';

const { height } = Dimensions.get('window');

interface Props {
  uri: string;
  overlay?: React.ReactNode;
}

export default function PhotoCard({ uri, overlay }: Props) {
  return (
    <View style={styles.card}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri }}
        style={styles.image}
        transition={100}
      />
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    height: height * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#111',
  },
  image: { width: '100%', height: '100%' },
});
