// Juice effects — screen shake, pulse, celebration animations
import { Animated } from 'react-native';

export function screenShake(animValue, intensity = 10) {
  Animated.sequence([
    Animated.timing(animValue, { toValue: intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: intensity / 2, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();
}

export function pulseScale(animValue) {
  Animated.sequence([
    Animated.timing(animValue, { toValue: 1.15, duration: 150, useNativeDriver: true }),
    Animated.spring(animValue, { toValue: 1, friction: 3, useNativeDriver: true }),
  ]).start();
}

export function celebrationBurst(shakeAnim, scaleAnim) {
  screenShake(shakeAnim, 15);
  pulseScale(scaleAnim);
}

export function bounceIn(animValue) {
  animValue.setValue(0);
  Animated.spring(animValue, {
    toValue: 1,
    friction: 4,
    tension: 80,
    useNativeDriver: true,
  }).start();
}

export function slideInRight(animValue, distance = 300) {
  animValue.setValue(distance);
  Animated.spring(animValue, {
    toValue: 0,
    friction: 8,
    tension: 60,
    useNativeDriver: true,
  }).start();
}

export function fadeInUp(opacityAnim, translateAnim) {
  opacityAnim.setValue(0);
  translateAnim.setValue(30);
  Animated.parallel([
    Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    Animated.spring(translateAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
  ]).start();
}
