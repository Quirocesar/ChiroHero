import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import soundManager from '../utils/soundManager';

const { width, height } = Dimensions.get('window');

// Pixel particle positions for the intro
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 4 + 2,
  speed: Math.random() * 2000 + 1500,
  color: [COLORS.primary, COLORS.accent, COLORS.gold, COLORS.green][i % 4],
}));

export default function IntroVideoScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const boneRotate = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  const navigateToMainMenu = () => {
    try {
      navigation.replace('MainMenu');
    } catch (e) {
      console.log('Navigation error:', e);
    }
  };

  useEffect(() => {
    soundManager.init();

    // Play intro sound
    setTimeout(() => {
      soundManager.playTone(220, 0.6, 'triangle', 0.08);
      soundManager.playTone(330, 0.5, 'triangle', 0.06, 0.2);
      soundManager.playTone(440, 0.4, 'triangle', 0.07, 0.4);
      soundManager.playTone(660, 0.6, 'sine', 0.05, 0.6);
      soundManager.playTone(880, 0.8, 'sine', 0.04, 0.8);
    }, 600);

    // Particle floating animations
    particleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: PARTICLES[i].speed, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: PARTICLES[i].speed, useNativeDriver: true }),
        ])
      ).start();
    });

    const sequence = Animated.sequence([
      Animated.delay(400),
      // Bone spins in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 8, friction: 4, useNativeDriver: true }),
        Animated.timing(boneRotate, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
      // Title slides up
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 12, friction: 5, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Decorative line expands
      Animated.timing(lineWidth, { toValue: 1, duration: 400, useNativeDriver: false }),
      // Subtitle fades in
      Animated.timing(subtitleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      // Hold
      Animated.delay(1800),
      // Fade everything out
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(subtitleFade, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]);

    sequence.start(() => {
      navigateToMainMenu();
    });

    // Fallback: navigate after 8 seconds regardless
    const fallbackTimeout = setTimeout(() => {
      navigateToMainMenu();
    }, 8000);

    return () => {
      sequence.stop();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const boneRotation = boneRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const lineWidthInterp = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.6],
  });

  const skipIntro = () => {
    navigateToMainMenu();
  };

  return (
    <View style={styles.container} onTouchEnd={skipIntro}>
      {/* Tap to skip hint */}
      <View style={styles.skipHint}>
        <PixelText size="tiny" color={COLORS.grayDark}>Toca para continuar</PixelText>
      </View>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: fadeAnim,
              transform: [{
                translateY: particleAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              }],
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.logoContainer, {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        {/* Bone icon with rotation */}
        <Animated.View style={{ transform: [{ rotate: boneRotation }] }}>
          <PixelText size="giant" color={COLORS.gold} center style={styles.icon}>
            🦴
          </PixelText>
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <PixelText size="xlarge" color={COLORS.primary} center glow style={styles.title}>
            CHIROPRACTIC
          </PixelText>
          <PixelText size="title" color={COLORS.accent} center glow style={styles.title}>
            CLINIC HERO
          </PixelText>
        </Animated.View>

        {/* Decorative line */}
        <Animated.View style={[styles.decorLine, { width: lineWidthInterp }]} />

        {/* Subtitle */}
        <Animated.View style={{ opacity: subtitleFade }}>
          <PixelText size="small" color={COLORS.gray} center style={styles.subtitle}>
            A Chiropractic Adventure Game
          </PixelText>
          <PixelText size="tiny" color={COLORS.grayDark} center style={styles.credit}>
            Developed with 💚
          </PixelText>
        </Animated.View>
      </Animated.View>

      {/* Bottom pixel decoration */}
      <Animated.View style={[styles.bottomDecor, { opacity: fadeAnim }]}>
        {Array.from({ length: Math.floor(width / 8) }).map((_, i) => (
          <View
            key={i}
            style={[styles.bottomPixel, {
              backgroundColor: i % 3 === 0 ? COLORS.primary : i % 3 === 1 ? COLORS.accent : COLORS.gold,
              opacity: 0.3 + (Math.sin(i * 0.5) * 0.3),
              height: 4 + (i % 4) * 2,
            }]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    lineHeight: 48,
  },
  decorLine: {
    height: 3,
    backgroundColor: COLORS.gold,
    marginVertical: 12,
    opacity: 0.6,
  },
  subtitle: {
    marginTop: 4,
    letterSpacing: 3,
    opacity: 0.9,
  },
  credit: {
    marginTop: 8,
    opacity: 0.5,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomPixel: {
    width: 6,
    marginHorizontal: 1,
  },
  skipHint: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    opacity: 0.6,
  },
});
