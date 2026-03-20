import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, checkAchievements, unlockAchievement } from '../data/achievements';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

const CATEGORY_INFO = {
  patients: { icon: '🏥', titleKey: 'ach_category_patients' },
  skill: { icon: '⭐', titleKey: 'ach_category_skill' },
  money: { icon: '💰', titleKey: 'ach_category_money' },
  streak: { icon: '🔥', titleKey: 'ach_category_streak' },
  special: { icon: '🌟', titleKey: 'ach_category_special' },
  milestone: { icon: '📅', titleKey: 'ach_category_milestone' },
};

export default function AchievementsScreen({ navigation }) {
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stats, setStats] = useState({});
  const [animValues] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (achievements.length > 0) {
      achievements.forEach((ach, i) => {
        if (!animValues[ach.id]) {
          animValues[ach.id] = new Animated.Value(0);
          setTimeout(() => {
            Animated.spring(animValues[ach.id], {
              toValue: 1,
              tension: 15,
              friction: 6,
              useNativeDriver: true,
            }).start();
          }, i * 80);
        }
      });
    }
  }, [achievements, selectedCategory]);

  const loadData = () => {
    const saved = gameState.get('achievements') || [];
    setAchievements(saved);
    setStats({
      patients: gameState.get('totalPatientsHealed') || 0,
      referrals: gameState.get('totalPatientsReferred') || 0,
      skillLevel: gameState.get('skillLevel') || 1,
      totalMoney: gameState.get('totalMoneyEarned') || 0,
      currentMoney: gameState.get('money') || 0,
      reputation: gameState.get('reputation') || 0,
      streak: (gameState.get('stats') || {}).currentStreak || 0,
      perfectDays: (gameState.get('stats') || {}).perfectDays || 0,
      vipPatients: gameState.get('premiumPatientsServed') || 0,
      returningPatients: (gameState.get('satisfiedPatients') || []).length,
      days: gameState.get('currentDay') || 1,
      perfectTreatments: (gameState.get('stats') || {}).perfectAdjustments || 0,
    });
  };

  const getProgress = (achievement) => {
    const state = {
      patients: stats.patients,
      referrals: stats.referrals,
      skillLevel: stats.skillLevel,
      totalMoney: stats.totalMoney,
      currentMoney: stats.currentMoney,
      reputation: stats.reputation,
      streak: stats.streak,
      perfectDays: stats.perfectDays,
      vipPatients: stats.vipPatients,
      returningPatients: stats.returningPatients,
      days: stats.days,
      perfectTreatments: stats.perfectTreatments,
    };
    const current = state[achievement.requirement.type] || 0;
    const target = achievement.requirement.count;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const filteredAchievements = selectedCategory
    ? ACHIEVEMENTS.filter(a => a.category === selectedCategory)
    : ACHIEVEMENTS;

  const unlockedCount = achievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText size="title" color={COLORS.gold} center glow>
            🏆 {t('achievements')}
          </PixelText>
          <PixelText size="small" color={COLORS.gray} center style={styles.progress}>
            {unlockedCount} / {totalCount} {t('unlocked')}
          </PixelText>
          
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(unlockedCount / totalCount) * 100}%` }]} />
          </View>
        </View>

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <PixelButton
            title={`🏆 ${t('all')}`}
            color={!selectedCategory ? COLORS.accent : COLORS.deskDark}
            onPress={() => setSelectedCategory(null)}
            small
            style={styles.categoryButton}
          />
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <PixelButton
              key={key}
              title={`${info.icon} ${t(info.titleKey)}`}
              color={selectedCategory === key ? COLORS.accent : COLORS.deskDark}
              onPress={() => setSelectedCategory(key)}
              small
              style={styles.categoryButton}
            />
          ))}
        </ScrollView>

        {/* Stats summary */}
        <PixelCard color={COLORS.bgMedium} borderColor={COLORS.accent}>
          <PixelText size="small" color={COLORS.accent} center style={styles.statsTitle}>
            📊 {t('yourStats')}
          </PixelText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>{t('patients')}</PixelText>
              <PixelText size="medium" color={COLORS.white}>{stats.patients}</PixelText>
            </View>
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>{t('reputation')}</PixelText>
              <PixelText size="medium" color={COLORS.green}>{stats.reputation}</PixelText>
            </View>
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>{t('skill')}</PixelText>
              <PixelText size="medium" color={COLORS.accent}>Lv.{stats.skillLevel}</PixelText>
            </View>
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>{t('day')}</PixelText>
              <PixelText size="medium" color={COLORS.gold}>{stats.days}</PixelText>
            </View>
          </View>
        </PixelCard>

        {/* Achievement list */}
        <View style={styles.achievementList}>
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = achievements.includes(achievement.id);
            const progress = getProgress(achievement);
            const animValue = animValues[achievement.id] || new Animated.Value(0);
            
            return (
              <Animated.View
                key={achievement.id}
                style={{
                  opacity: animValue,
                  transform: [{ scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
                }}
              >
                <PixelCard
                  color={isUnlocked ? COLORS.paperDark : COLORS.deskDark}
                  borderColor={isUnlocked ? COLORS.gold : COLORS.border}
                  style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}
                >
                  <View style={styles.achievementRow}>
                    <View style={[styles.iconContainer, isUnlocked && styles.iconUnlocked]}>
                      <PixelText size="large">{achievement.icon}</PixelText>
                    </View>
                    <View style={styles.achievementInfo}>
                      <PixelText
                        size="small"
                        color={isUnlocked ? COLORS.gold : COLORS.gray}
                        style={styles.achievementTitle}
                      >
                        {isUnlocked ? '✅ ' : '🔒 '}{t(achievement.titleKey)}
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.gray} style={styles.achievementDesc}>
                        {t(achievement.descKey)}
                      </PixelText>
                      {achievement.reward && (
                        <View style={styles.rewardRow}>
                          <PixelText size="tiny" color={COLORS.accent}>
                            🎁 {t('reward')}: {achievement.reward.type === 'money' ? `$${achievement.reward.value}` : 
                               achievement.reward.type === 'reputation' ? `+${achievement.reward.value}⭐` :
                               `+${achievement.reward.value} XP`}
                          </PixelText>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Progress bar */}
                  {!isUnlocked && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBarSmall}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <PixelText size="tiny" color={COLORS.gray}>
                        {progress}% ({stats[achievement.requirement.type] || 0}/{achievement.requirement.count})
                      </PixelText>
                    </View>
                  )}
                </PixelCard>
              </Animated.View>
            );
          })}
        </View>

        {/* Back button */}
        <View style={styles.backButton}>
          <PixelButton
            title={`⬅ ${t('back')}`}
            color={COLORS.secondary}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 12,
    paddingTop: 40,
  },
  header: {
    marginBottom: 15,
  },
  progress: {
    marginTop: 5,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.deskDark,
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  categoryScroll: {
    marginBottom: 15,
  },
  categoryButton: {
    marginRight: 8,
  },
  statsTitle: {
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  achievementList: {
    marginTop: 15,
    gap: 10,
  },
  achievementCard: {
    marginBottom: 0,
  },
  lockedCard: {
    opacity: 0.7,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.deskDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  iconUnlocked: {
    backgroundColor: COLORS.paperDark,
    borderColor: COLORS.gold,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    marginBottom: 2,
  },
  achievementDesc: {
    opacity: 0.8,
  },
  rewardRow: {
    marginTop: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  progressBarSmall: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.deskDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});
