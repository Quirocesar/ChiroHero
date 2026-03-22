import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import BackHeader from '../components/BackHeader';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { TRAVEL_EVENTS } from '../data/upgrades';
import { t } from '../utils/i18n';

export default function EventsScreen({ navigation }) {
  const [state, setState] = useState(gameState.state);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventResult, setEventResult] = useState(null);
  const [planeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    soundManager.init();
    soundManager.playEventMusic();
    return () => { gameState.subscribe(setState)(); };
  }, []);

  useEffect(() => {
    return gameState.subscribe(setState);
  }, []);

  const handleTravel = (event) => {
    if (!gameState.canAfford(event.cost)) {
      soundManager.playError();
      return;
    }
    if (state.reputation < event.minReputation) {
      soundManager.playError();
      return;
    }

    gameState.spendMoney(event.cost);
    setActiveEvent(event);

    // Plane animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(planeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      planeAnim.stopAnimation();
      gameState.earnMoney(event.reward.money);
      gameState.set({
        reputation: state.reputation + event.reward.reputation,
        eventsCompleted: [...(state.eventsCompleted || []), event.id],
      });
      gameState.addExperience(event.reward.xp);
      setEventResult(event);
      soundManager.playLevelUp();
      gameState.save();
    }, 2000);
  };

  const closeResult = () => {
    setActiveEvent(null);
    setEventResult(null);
  };

  const planeBounce = planeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <BackHeader title="EVENTOS" />
      <ScrollView contentContainerStyle={styles.content}>
        <PixelText size="large" color={COLORS.gold} center glow>
          ✈️ {t('eventsTitle')}
        </PixelText>
        <PixelText size="small" color={COLORS.gray} center style={styles.subtitle}>
          {t('eventsSubtitle')}
        </PixelText>

        {/* Player stats */}
        <PixelCard color={COLORS.dark} borderColor={COLORS.accent}>
          <View style={styles.statsRow}>
            <PixelText size="small" color={COLORS.gold}>💰 ${state.money}</PixelText>
            <PixelText size="small" color={COLORS.accent}>⭐ {state.reputation}</PixelText>
            <PixelText size="small" color={COLORS.green}>Lv.{state.skillLevel}</PixelText>
          </View>
        </PixelCard>

        {/* Event in progress */}
        {activeEvent && !eventResult && (
          <PixelCard color={COLORS.bgMedium} borderColor={COLORS.gold}>
            <Animated.View style={{ transform: [{ translateY: planeBounce }] }}>
              <PixelText size="xlarge" color={COLORS.gold} center>✈️</PixelText>
            </Animated.View>
            <PixelText size="medium" color={COLORS.gold} center>
              {t('traveling')}
            </PixelText>
            <PixelText size="small" color={COLORS.white} center style={styles.travelText}>
              {activeEvent.name}
            </PixelText>
            <PixelText size="tiny" color={COLORS.gray} center>
              {activeEvent.description}
            </PixelText>
          </PixelCard>
        )}

        {/* Event result */}
        {eventResult && (
          <PixelCard color="#0a2a0a" borderColor={COLORS.green}>
            <PixelText size="medium" color={COLORS.green} center glow>
              🏆 {t('eventComplete')}
            </PixelText>
            <PixelText size="normal" color={COLORS.gold} center style={styles.travelText}>
              {eventResult.name}
            </PixelText>
            <View style={styles.rewardBox}>
              <View style={styles.rewardRow}>
                <PixelText size="small" color={COLORS.white}>{t('gain')}:</PixelText>
                <PixelText size="small" color={COLORS.gold}>${eventResult.reward.money}</PixelText>
              </View>
              <View style={styles.rewardRow}>
                <PixelText size="small" color={COLORS.white}>{t('reputation')}:</PixelText>
                <PixelText size="small" color={COLORS.accent}>+{eventResult.reward.reputation}</PixelText>
              </View>
              <View style={styles.rewardRow}>
                <PixelText size="small" color={COLORS.white}>{t('experience')}:</PixelText>
                <PixelText size="small" color={COLORS.green}>+{eventResult.reward.xp} XP</PixelText>
              </View>
            </View>
            <PixelButton
              title={t('great')}
              icon="✓"
              color={COLORS.green}
              onPress={closeResult}
            />
          </PixelCard>
        )}

        {/* Event list */}
        {!activeEvent && TRAVEL_EVENTS.map(event => {
          const completed = (state.eventsCompleted || []).includes(event.id);
          const hasRep = state.reputation >= event.minReputation;
          const canAfford = state.money >= event.cost;

          return (
            <PixelCard
              key={event.id}
              color={completed ? '#0a2a0a' : COLORS.dark}
              borderColor={completed ? COLORS.green : hasRep ? COLORS.gold : COLORS.grayDark}
            >
              <View style={styles.eventHeader}>
                <PixelText size="normal" color={completed ? COLORS.green : hasRep ? COLORS.gold : COLORS.gray}>
                  {event.name}
                </PixelText>
                {completed && <PixelText size="small" color={COLORS.green}>✓</PixelText>}
              </View>
              <PixelText size="tiny" color={COLORS.gray} style={styles.desc}>
                {event.description}
              </PixelText>
              <View style={styles.eventInfo}>
                <PixelText size="tiny" color={canAfford ? COLORS.gold : COLORS.red}>
                  {t('cost')}: ${event.cost}
                </PixelText>
                <PixelText size="tiny" color={hasRep ? COLORS.green : COLORS.red}>
                  {t('minRep')}: ⭐{event.minReputation}
                </PixelText>
              </View>
              <View style={styles.eventReward}>
                <PixelText size="tiny" color={COLORS.accent}>
                  {t('reward')}: ${event.reward.money} | +{event.reward.reputation} ⭐ | +{event.reward.xp} XP
                </PixelText>
              </View>
              {!completed && (
                <PixelButton
                  title={!hasRep ? t('needMoreRep') : !canAfford ? t('noFunds') : t('travel')}
                  icon={hasRep && canAfford ? '✈️' : '🔒'}
                  color={hasRep && canAfford ? COLORS.gold : COLORS.grayDark}
                  onPress={() => handleTravel(event)}
                  disabled={!hasRep || !canAfford}
                  small
                />
              )}
            </PixelCard>
          );
        })}

        <PixelButton
          title={t('back')}
          icon="←"
          color={COLORS.dark}
          onPress={() => { soundManager.stopMusic(); navigation.goBack(); }}
          style={styles.backButton}
        />
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
    gap: 8,
    paddingBottom: 30,
  },
  subtitle: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  travelText: {
    marginVertical: 8,
  },
  rewardBox: {
    backgroundColor: COLORS.dark,
    padding: 10,
    marginVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desc: {
    marginVertical: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  eventReward: {
    marginBottom: 6,
  },
  backButton: {
    marginTop: 12,
  },
});
