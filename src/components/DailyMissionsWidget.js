import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelCard from './PixelCard';
import gameState, { getReputationTitle, getCurrentRank, getSeasonNumber } from '../utils/gameState';
import { generateDailyMissions, updateMissionProgress, claimMissionReward, getMissionProgress } from '../data/dailyMissions';

export default function DailyMissionsWidget({ onMissionComplete, compact = false }) {
  const [missions, setMissions] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 3, percentage: 0 });
  const [showReward, setShowReward] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const loadMissions = async () => {
    const day = gameState.get('currentDay') || 1;
    const skillLevel = gameState.get('skillLevel') || 1;
    const newMissions = await generateDailyMissions(day, skillLevel);
    if (Array.isArray(newMissions)) {
      setMissions(newMissions);
      setProgress(getMissionProgress(newMissions));
    }
  };

  const handleClaimReward = (mission) => {
    if (!mission.completed || mission.claimed) return;

    const updatedMissions = claimMissionReward(missions, mission.id);
    setMissions(updatedMissions);
    setProgress(getMissionProgress(updatedMissions));

    gameState.earnMoney(mission.reward.money);
    gameState.addExperience(mission.reward.xp);
    gameState.updateReputation(mission.reward.reputation);

    setShowReward(mission.reward);
    setTimeout(() => setShowReward(null), 2000);

    if (onMissionComplete) {
      onMissionComplete(mission);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.green;
      case 'medium': return COLORS.gold;
      case 'hard': return COLORS.red;
      default: return COLORS.green;
    }
  };

  const getMissionProgressValue = (mission) => {
    if (mission.type === 'earn_money') {
      return Math.min(100, Math.round((mission.currentAmount / mission.targetAmount) * 100));
    }
    return Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));
  };

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.compactHeader}>
          <PixelText size="tiny" color={COLORS.gold}>MISIONES DIARIAS</PixelText>
          <PixelText size="tiny" color={COLORS.green}>{progress.completed}/{progress.total}</PixelText>
        </View>
        <View style={styles.compactProgressBar}>
          <View style={[styles.compactProgressFill, { width: `${progress.percentage}%` }]} />
        </View>
        {missions.slice(0, 2).map((mission, index) => (
          <View key={mission.id || index} style={styles.compactMissionItem}>
            <PixelText size="tiny" color={mission.completed ? COLORS.green : COLORS.white}>
              {mission.completed ? '✓' : '○'} {mission.name}
            </PixelText>
          </View>
        ))}
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PixelText size="small" color={COLORS.gold} glow>MISIONES DIARIAS</PixelText>
        <View style={styles.progressBadge}>
          <PixelText size="tiny" color={COLORS.white}>{progress.completed}/{progress.total}</PixelText>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
        </View>
        <PixelText size="tiny" color={COLORS.gray}>{progress.percentage}%</PixelText>
      </View>

      {missions.map((mission, index) => {
        const progressValue = getMissionProgressValue(mission);
        const isComplete = mission.completed && !mission.claimed;

        return (
          <PixelCard
            key={mission.id || index}
            color={mission.claimed ? COLORS.dark : COLORS.bgMedium}
            borderColor={mission.claimed ? COLORS.gray : getDifficultyColor(mission.difficulty)}
            style={styles.missionCard}
          >
            <View style={styles.missionHeader}>
              <PixelText size="tiny" color={mission.claimed ? COLORS.gray : COLORS.white}>
                {mission.name}
              </PixelText>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(mission.difficulty) }]}>
                <PixelText size="tiny" color={COLORS.dark}>{mission.difficulty}</PixelText>
              </View>
            </View>

            <View style={styles.missionProgressContainer}>
              <View style={styles.missionProgressBar}>
                <View style={[styles.missionProgressFill, { width: `${progressValue}%`, backgroundColor: getDifficultyColor(mission.difficulty) }]} />
              </View>
              <PixelText size="tiny" color={COLORS.gray}>
                {mission.type === 'earn_money' 
                  ? `$${mission.currentAmount || 0}/${mission.targetAmount}`
                  : `${mission.currentCount || 0}/${mission.targetCount}`}
              </PixelText>
            </View>

            {isComplete && (
              <View style={styles.rewardContainer}>
                <PixelText size="tiny" color={COLORS.gold}>RECOMPENSA:</PixelText>
                <View style={styles.rewardItems}>
                  <PixelText size="tiny" color={COLORS.gold}>+${mission.reward.money}</PixelText>
                  <PixelText size="tiny" color={COLORS.green}>+{mission.reward.xp}XP</PixelText>
                  <PixelText size="tiny" color={COLORS.accent}>+{mission.reward.reputation}★</PixelText>
                </View>
              </View>
            )}

            {mission.claimed && (
              <PixelText size="tiny" color={COLORS.green} center>✓ COMPLETADA</PixelText>
            )}
          </PixelCard>
        );
      })}

      {showReward && (
        <View style={styles.rewardPopup}>
          <PixelText size="small" color={COLORS.gold} glow>¡RECOMPENSA!</PixelText>
          <PixelText size="tiny" color={COLORS.gold}>+${showReward.money}</PixelText>
          <PixelText size="tiny" color={COLORS.green}>+{showReward.xp} XP</PixelText>
          <PixelText size="tiny" color={COLORS.accent}>+{showReward.reputation} ★</PixelText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBadge: {
    backgroundColor: COLORS.deskDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 4,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  compactContainer: {
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactProgressBar: {
    height: 6,
    backgroundColor: COLORS.desk,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  compactProgressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  compactMissionItem: {
    paddingVertical: 2,
  },
  missionCard: {
    marginBottom: 6,
    padding: 8,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  missionProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.desk,
    borderRadius: 3,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewardContainer: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  rewardItems: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  rewardPopup: {
    position: 'absolute',
    top: '50%',
    left: '25%',
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    zIndex: 100,
  },
});
