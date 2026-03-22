import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';

const { width } = Dimensions.get('window');

export default function RewardsPopup({ 
  visible, 
  rewards = [], 
  onComplete,
  duration = 2000 
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const float = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      float.start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onComplete) onComplete();
        });
      }, duration - 300);

      return () => {
        clearTimeout(timer);
        float.stop();
      };
    }
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  const getRewardColor = (type) => {
    switch (type) {
      case 'money': return COLORS.gold;
      case 'xp': return COLORS.green;
      case 'reputation': return COLORS.accent;
      case 'streak': return COLORS.orange;
      case 'season': return COLORS.secondary;
      default: return COLORS.white;
    }
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case 'money': return '$';
      case 'xp': return 'XP';
      case 'reputation': return '★';
      case 'streak': return '🔥';
      case 'season': return '🌟';
      default: return '●';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
            { translateY: floatAnim }
          ]
        }
      ]}
    >
      <View style={styles.header}>
        <PixelText size="medium" color={COLORS.gold} glow>¡RECOMPENSA!</PixelText>
      </View>

      <View style={styles.rewardsContainer}>
        {rewards.map((reward, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.rewardItem,
              { 
                backgroundColor: getRewardColor(reward.type) + '22',
                borderColor: getRewardColor(reward.type),
              }
            ]}
          >
            <View style={styles.rewardIcon}>
              <PixelText size="medium" color={getRewardColor(reward.type)}>
                {getRewardIcon(reward.type)}
              </PixelText>
            </View>
            <PixelText size="medium" color={getRewardColor(reward.type)}>
              +{reward.amount}
            </PixelText>
            <PixelText size="tiny" color={COLORS.gray}>
              {reward.label || ''}
            </PixelText>
          </Animated.View>
        ))}
      </View>

      <View style={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * 200,
                top: Math.random() * 80,
                backgroundColor: [COLORS.gold, COLORS.green, COLORS.accent, COLORS.orange][Math.floor(Math.random() * 4)],
                transform: [
                  { 
                    translateX: floatAnim.interpolate({
                      inputRange: [0, -8],
                      outputRange: [0, (Math.random() - 0.5) * 20]
                    })
                  }
                ]
              }
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

export function FloatingRewardText({ value, type, x, y, onComplete }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: -60,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        delay: 1000,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  }, []);

  const getColor = () => {
    switch (type) {
      case 'money': return COLORS.gold;
      case 'xp': return COLORS.green;
      case 'reputation': return COLORS.accent;
      default: return COLORS.white;
    }
  };

  const getPrefix = () => {
    switch (type) {
      case 'money': return '+$';
      case 'xp': return '+';
      case 'reputation': return '+';
      default: return '+';
    }
  };

  return (
    <Animated.View
      style={[
        styles.floatingText,
        {
          left: x,
          top: y,
          opacity: fadeAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <PixelText size="small" color={getColor()} glow>
        {getPrefix()}{value}
      </PixelText>
    </Animated.View>
  );
}

export function MiniRewardPopup({ reward, type, visible, onComplete }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  const getColor = () => {
    switch (type) {
      case 'money': return COLORS.gold;
      case 'xp': return COLORS.green;
      case 'reputation': return COLORS.accent;
      default: return COLORS.white;
    }
  };

  return (
    <View style={styles.miniPopup}>
      <PixelText size="tiny" color={getColor()}>
        {type === 'money' ? `+$${reward}` : `+${reward}${type === 'xp' ? ' XP' : ' ★'}`}
      </PixelText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '30%',
    left: width * 0.1,
    width: width * 0.8,
    backgroundColor: COLORS.dark,
    borderWidth: 4,
    borderColor: COLORS.gold,
    padding: 20,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    marginBottom: 16,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 4,
  },
  rewardIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  floatingText: {
    position: 'absolute',
    zIndex: 100,
  },
  miniPopup: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    backgroundColor: COLORS.dark + 'EE',
    borderWidth: 2,
    borderColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 500,
  },
});
