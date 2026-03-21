import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import PixelText from './PixelText';
import { COLORS } from '../utils/theme';

export default function FloatingText({ text, x, y, color = COLORS.white, onComplete }) {
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -40, // float upwards
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <PixelText size="small" color={color} style={styles.text}>
        {text}
      </PixelText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Make sure it's above everything
  },
  text: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
