import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

export default function AchievementNotification({ achievement, onComplete, visible }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      slideAnim.setValue(-100);
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 15,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 20,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [visible, achievement]);

  if (!visible || !achievement) return null;

  const getRewardText = () => {
    if (!achievement.reward) return '';
    if (achievement.reward.type === 'money') return `+$${achievement.reward.value}`;
    if (achievement.reward.type === 'reputation') return `+${achievement.reward.value}⭐`;
    return `+${achievement.reward.value} XP`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <PixelText size="large">{achievement.icon}</PixelText>
        </View>
        <View style={styles.textContainer}>
          <PixelText size="small" color={COLORS.gold} glow>
            🏆 {t(achievement.titleKey)}
          </PixelText>
          <PixelText size="tiny" color={COLORS.white} numberOfLines={2}>
            {t(achievement.descKey)}
          </PixelText>
          {achievement.reward && (
            <PixelText size="tiny" color={COLORS.accent}>
              {getRewardText()}
            </PixelText>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark,
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderRadius: 10,
    padding: 12,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.bgMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
});
