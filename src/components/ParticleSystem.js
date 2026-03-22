import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import PixelText from './PixelText';
import { COLORS } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PARTICLE_CONFIGS = {
  money: {
    icon: '$',
    color: COLORS.gold,
    size: 20,
    duration: 2000,
    count: 8,
    spread: 100,
    startY: 0.4,
    endY: 0.1,
    wobble: true,
  },
  xp: {
    icon: 'XP',
    color: COLORS.green,
    size: 16,
    duration: 1800,
    count: 6,
    spread: 80,
    startY: 0.4,
    endY: 0.1,
    wobble: false,
  },
  achievement: {
    icon: '★',
    color: COLORS.goldLight,
    size: 24,
    duration: 2500,
    count: 12,
    spread: 150,
    startY: 0.5,
    endY: 0.15,
    wobble: true,
  },
  confetti: {
    icon: '◆',
    colors: [COLORS.primary, COLORS.gold, COLORS.accent, COLORS.red, COLORS.secondary],
    size: 14,
    duration: 3000,
    count: 20,
    spread: SCREEN_WIDTH,
    startY: 0.3,
    endY: 0.8,
    wobble: true,
  },
  coin: {
    icon: '●',
    color: COLORS.gold,
    size: 18,
    duration: 1500,
    count: 5,
    spread: 60,
    startY: 0.5,
    endY: 0.2,
    wobble: true,
  },
  star: {
    icon: '☆',
    color: COLORS.goldLight,
    size: 22,
    duration: 2200,
    count: 8,
    spread: 120,
    startY: 0.4,
    endY: 0.1,
    wobble: true,
  },
  bone: {
    icon: '🦴',
    size: 20,
    duration: 2000,
    count: 6,
    spread: 80,
    startY: 0.5,
    endY: 0.2,
    wobble: false,
    color: COLORS.bone,
  },
  heart: {
    icon: '♥',
    color: COLORS.red,
    size: 18,
    duration: 1800,
    count: 6,
    spread: 70,
    startY: 0.4,
    endY: 0.15,
    wobble: true,
  },
};

function Particle({ config, index, startX }) {
  const translateY = useRef(new Animated.Value(SCREEN_WIDTH * config.startY)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const targetX = startX + (Math.random() - 0.5) * config.spread;
  const targetY = SCREEN_WIDTH * config.endY + Math.random() * 50;

  useEffect(() => {
    const entranceDelay = index * 50;
    const particleDuration = config.duration;

    Animated.sequence([
      Animated.delay(entranceDelay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: targetY,
          duration: particleDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: targetX,
          duration: particleDuration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: particleDuration * 0.2,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: particleDuration * 0.1,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(rotate, {
          toValue: config.wobble ? (Math.random() - 0.5) * 2 : 0,
          duration: particleDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: particleDuration,
          delay: particleDuration * 0.6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const particleColor = config.colors 
    ? config.colors[index % config.colors.length] 
    : config.color;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
            { rotate: rotate.interpolate({
              inputRange: [-1, 1],
              outputRange: ['-30deg', '30deg'],
            })},
          ],
          opacity,
        },
      ]}
    >
      {typeof config.icon === 'string' && config.icon.length <= 2 ? (
        <PixelText
          size="small"
          color={particleColor}
          style={{ textAlign: 'center' }}
        >
          {config.icon}
        </PixelText>
      ) : (
        <PixelText size="medium">{config.icon}</PixelText>
      )}
    </Animated.View>
  );
}

export default function ParticleSystem({ 
  type = 'money', 
  active = true, 
  centerX = SCREEN_WIDTH / 2,
  onComplete,
}) {
  const [particles, setParticles] = useState([]);
  const config = PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.money;
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (active && !hasRunRef.current) {
      hasRunRef.current = true;
      const newParticles = [];
      for (let i = 0; i < config.count; i++) {
        newParticles.push({
          id: Date.now() + i,
          startX: centerX + (Math.random() - 0.5) * 40,
        });
      }
      setParticles(newParticles);

      if (onComplete) {
        setTimeout(() => {
          onComplete();
          hasRunRef.current = false;
        }, config.duration + config.count * 50);
      }
    } else if (!active) {
      hasRunRef.current = false;
      setParticles([]);
    }
  }, [active, type]);

  if (!active || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Particle
          key={particle.id}
          config={config}
          index={index}
          startX={particle.startX}
        />
      ))}
    </View>
  );
}

export function LevelUpOverlay({ visible, level, onComplete }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const [particlesActive, setParticlesActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setParticlesActive(true);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1500),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setParticlesActive(false);
        onComplete?.();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.levelUpOverlay} pointerEvents="none">
      <ParticleSystem
        type="confetti"
        active={particlesActive}
        centerX={SCREEN_WIDTH / 2}
      />
      
      <Animated.View
        style={[
          styles.levelUpContainer,
          {
            transform: [
              { scale },
              { rotate: rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })},
            ],
            opacity,
          },
        ]}
      >
        <View style={styles.levelUpBackground}>
          <PixelText size="tiny" color={COLORS.gold} style={styles.levelUpLabel}>
            LEVEL UP!
          </PixelText>
          <PixelText size="large" color={COLORS.gold} glow style={styles.levelUpNumber}>
            {level}
          </PixelText>
        </View>
        
        <View style={styles.levelUpRays}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.ray,
                {
                  transform: [{ rotate: `${i * 45}deg` }],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  levelUpContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  levelUpBackground: {
    backgroundColor: COLORS.deskDark + 'EE',
    borderWidth: 4,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
  },
  levelUpLabel: {
    letterSpacing: 4,
    marginBottom: 4,
  },
  levelUpNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  levelUpRays: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 60,
    backgroundColor: COLORS.goldLight + '44',
    transformOrigin: 'center bottom',
  },
});
