import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import { COLORS } from '../utils/theme';
import { useTutorial } from '../utils/TutorialContext';

const { width: SW } = Dimensions.get('window');
const PADDING = 8;

/**
 * Props:
 *   step   — { id, targetId, title, text } or null
 *   onNext — advance to next step
 *   onSkip — exit tutorial entirely
 */
export default function TutorialOverlay({ step, onNext, onSkip }) {
  const { getTarget } = useTutorial();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // fadeAnim is a stable ref value; include it in deps to satisfy lint (--max-warnings=0)
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step?.id, fadeAnim]);

  if (!step) return null;

  const target = step.targetId ? getTarget(step.targetId) : null;
  const tx = target ? target.x - PADDING : 0;
  const ty = target ? target.y - PADDING : 0;
  const tw = target ? target.width + PADDING * 2 : SW;
  const th = target ? target.height + PADDING * 2 : 0;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {target ? (
        <>
          {/* 4 mask rectangles surrounding the target */}
          <View style={[styles.mask, { top: 0, left: 0, right: 0, height: Math.max(0, ty) }]} />
          <View style={[styles.mask, { top: ty + th, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.mask, { top: ty, left: 0, width: Math.max(0, tx), height: th }]} />
          <View style={[styles.mask, { top: ty, left: tx + tw, right: 0, height: th }]} />
          {/* Highlight border around target */}
          <View style={[styles.highlight, { top: ty, left: tx, width: tw, height: th }]} />
        </>
      ) : (
        // Full-screen mask for non-targeted steps
        <View style={[styles.mask, StyleSheet.absoluteFill]} />
      )}

      {/* Instruction bubble — always at bottom */}
      <View style={styles.bubble}>
        <PixelText size="small" color={COLORS.gold} style={{ marginBottom: 4 }}>
          {step.title}
        </PixelText>
        <PixelText size="tiny" color={COLORS.white} style={{ marginBottom: 12 }}>
          {step.text}
        </PixelText>
        <View style={styles.bubbleActions}>
          <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <PixelText size="tiny" color={COLORS.gray}>Saltar tutorial</PixelText>
          </TouchableOpacity>
          <PixelButton title="SIGUIENTE →" color={COLORS.primary} onPress={onNext} small />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000 },
  mask: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.72)' },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  bubble: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: COLORS.deskDark,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '80',
    padding: 16,
  },
  bubbleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
