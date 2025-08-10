import { JSX } from 'react';

import { Animated, StyleSheet, View } from 'react-native';

const SwipeOverlay = ({
  leftOpacity,
  rightOpacity,
}: {
  leftOpacity: Animated.AnimatedInterpolation<number>;
  rightOpacity: Animated.AnimatedInterpolation<number>;
}): JSX.Element => {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[StyleSheet.absoluteFill, overlayStyles.redOverlay, { opacity: leftOpacity }]}
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, overlayStyles.greenOverlay, { opacity: rightOpacity }]}
      />

      <View style={overlayStyles.labelContainer}>
        <Animated.Text style={[overlayStyles.label, { opacity: leftOpacity }]}>
          SUPPRIMER
        </Animated.Text>
        <Animated.Text style={[overlayStyles.label, { opacity: rightOpacity }]}>
          GARDER
        </Animated.Text>
      </View>
    </View>
  );
};

export default SwipeOverlay;

const overlayStyles = StyleSheet.create({
  redOverlay: {
    backgroundColor: 'rgba(244,63,94,0.5)',
  },
  greenOverlay: {
    backgroundColor: 'rgba(34,197,94,0.5)',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    position: 'absolute',
  },
});
