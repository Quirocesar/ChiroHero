import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PixelText from './PixelText';
import { COLORS } from '../utils/theme';

const QUOTES = [
  'A crujir se ha dicho',
  'Las vértebras no se alinean solas',
  'Otro día, otra subluxación',
  'Tu espalda. Mi pasión.',
  'Hoy nadie sale sin su crack',
  'Manos listas. Pacientes listos. ¡Vamos!',
  'El crack de cada mañana',
  'Espalda que no cruje... paciente que no vuelve',
  'Tus manos son tu mejor herramienta',
  'Hoy vas a ser imparable',
  'Cada paciente es una historia nueva',
  'La quiropráctica: donde el ruido es buena señal',
];

export default function DayTransition({ day, visible, onDone }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const quoteRef = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    if (!visible) return;

    quoteRef.current = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    scaleAnim.setValue(0);
    opacityAnim.setValue(0);

    Animated.sequence([
      // Fade in + scale up
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(1200),
      // Fade out
      Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      onDone?.();
    });
  }, [visible, scaleAnim, opacityAnim, onDone]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: opacityAnim },
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <PixelText size="title" color={COLORS.primary} center glow>
          DÍA {day}
        </PixelText>
        <PixelText size="small" color={COLORS.gray} center style={styles.quote}>
          {quoteRef.current}
        </PixelText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  quote: {
    marginTop: 16,
    fontStyle: 'italic',
  },
});
