import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import Px from './Px';
import PatientPortrait from './PatientPortrait';
import gameState from '../utils/gameState';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

// ── PetDog (self-contained animation) ────────────────────────
function PetDog({ visible }) {
  const walkAnim = useRef(new Animated.Value(-30)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const walk = Animated.loop(
        Animated.sequence([
          Animated.timing(walkAnim, {
            toValue: width - 50,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(walkAnim, {
            toValue: -30,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      walk.start();

      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -3, duration: 200, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ])
      );
      bounce.start();

      return () => {
        walk.stop();
        bounce.stop();
      };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.petDog,
        {
          transform: [
            { translateX: walkAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <Px x={8} y={0} w={8} h={6} color="#8b4513" />
      <Px x={4} y={2} w={4} h={4} color="#a0522d" />
      <Px x={0} y={0} w={4} h={4} color="#a0522d" />
      <Px x={8} y={6} w={10} h={8} color="#8b4513" />
      <Px x={6} y={14} w={4} h={4} color="#8b4513" />
      <Px x={14} y={14} w={4} h={4} color="#8b4513" />
      <Px x={2} y={10} w={2} h={2} color="#000" />
      <Px x={10} y={10} w={2} h={2} color="#000" />
    </Animated.View>
  );
}

// ── WallDecorations ──────────────────────────────────────────
function WallDecorations({ upgrades }) {
  const decorations = [];

  if (upgrades.decoration >= 2) {
    decorations.push(
      <View key="pic1" style={styles.wallPic1}>
        <Px x={2} y={2} w={20} h={14} color={COLORS.secondary} />
        <Px x={6} y={6} w={12} h={6} color={COLORS.accent} />
      </View>
    );
  }
  if (upgrades.decoration >= 3) {
    decorations.push(
      <View key="pic2" style={styles.wallPic2}>
        <Px x={2} y={2} w={20} h={16} color={COLORS.primary} />
        <Px x={6} y={6} w={8} h={8} color={COLORS.gold} />
      </View>
    );
  }
  if (upgrades.decoration >= 4) {
    decorations.push(
      <View key="clock" style={styles.wallClockDeco}>
        <Px x={4} y={2} w={8} h={8} color={COLORS.paper} />
        <Px x={6} y={4} w={1} h={4} color={COLORS.dark} />
        <Px x={6} y={6} w={3} h={1} color={COLORS.dark} />
      </View>
    );
  }

  return <>{decorations}</>;
}

// ── GameClock ────────────────────────────────────────────────
function GameClock({ timeOfDay }) {
  const gameHour = gameState.get('currentDay') % 24;
  const [currentTime, setCurrentTime] = useState(gameHour);
  const tickAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(tickAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(tickAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      setCurrentTime(prev => (prev + 1) % 24);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const hour = currentTime;
  const minute = Math.floor((currentTime % 1) * 60);
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const amPm = hour < 12 ? 'A' : 'P';

  return (
    <Animated.View style={[styles.gameClock, { transform: [{ scale: tickAnim }] }]}>
      <View style={styles.clockFrame}>
        <PixelText size="tiny" color={COLORS.ink} fontFamily="mono">
          {displayHour}:{minute.toString().padStart(2, '0')}{amPm}
        </PixelText>
      </View>
    </Animated.View>
  );
}

// ── Main PatientZone ─────────────────────────────────────────
export default function PatientZone({
  dayStarted,
  dayEnded,
  currentPatient,
  patientExpression,
  walkAnim,
  pulseAnim,
  starAnim,
  sunAnim,
  moonAnim,
  caMessage,
  displayEarnings,
  clinicUpgrades,
  timeOfDay,
}) {
  return (
    <View style={styles.zone}>
      {/* Clinic wall background */}
      <View style={styles.wallBg} />

      {/* Framed diploma */}
      <View style={styles.diploma}>
        <View style={styles.diplomaInner}>
          <Px x={2} y={2} w={24} h={2} color={COLORS.ink} />
          <Px x={6} y={6} w={16} h={2} color={COLORS.gray} />
          <Px x={4} y={10} w={20} h={2} color={COLORS.gray} />
          <Px x={8} y={14} w={12} h={2} color={COLORS.gold} />
        </View>
      </View>

      {/* Spine anatomy poster */}
      <View style={styles.poster}>
        <View style={styles.posterInner}>
          <Px x={8} y={2} w={4} h={4} color={COLORS.bone} />
          <Px x={7} y={6} w={6} h={4} color={COLORS.bone} />
          <Px x={8} y={10} w={4} h={4} color={COLORS.bone} />
          <Px x={7} y={14} w={6} h={4} color={COLORS.bone} />
          <Px x={8} y={18} w={4} h={4} color={COLORS.bone} />
          <Px x={7} y={22} w={6} h={4} color={COLORS.bone} />
          <Px x={9} y={26} w={3} h={3} color={COLORS.bone} />
        </View>
        <Px x={9} y={-6} w={2} h={6} color={COLORS.gray} />
      </View>

      {/* Wall clock (functional) */}
      <GameClock timeOfDay={timeOfDay} />

      {/* Additional wall decorations based on upgrades */}
      <WallDecorations upgrades={clinicUpgrades} />

      {/* Plant */}
      <View style={styles.plant}>
        <Px x={2} y={0} w={6} h={4} color={COLORS.green} />
        <Px x={0} y={4} w={10} h={4} color={COLORS.green} />
        <Px x={4} y={-4} w={4} h={4} color={COLORS.green} />
        <Px x={-2} y={2} w={4} h={4} color="#049e75" />
        <Px x={10} y={2} w={4} h={4} color="#049e75" />
        <Px x={4} y={8} w={3} h={6} color="#049e75" />
        <Px x={1} y={14} w={10} h={4} color={COLORS.primary} />
        <Px x={2} y={18} w={8} h={4} color={COLORS.primaryDark} />
      </View>

      {/* PetDog */}
      <PetDog visible={clinicUpgrades.waitingRoom >= 2 && !dayStarted} />

      {/* Active patient with PatientPortrait */}
      {dayStarted && !dayEnded && currentPatient && (
        <Animated.View style={[styles.patientArea, { transform: [{ translateX: walkAnim }] }]}>
          {currentPatient.isPremium && (
            <View style={styles.vipBorder}>
              <Animated.View style={[styles.vipGlow, {
                transform: [{ scale: pulseAnim }],
              }]}>
                <View style={styles.vipLabelWrap}>
                  <PixelText size="tiny" color={COLORS.gold} fontFamily="ui">VIP</PixelText>
                </View>
              </Animated.View>
            </View>
          )}

          <PatientPortrait
            name={currentPatient.fullName}
            avatar={currentPatient.avatar}
            expression={patientExpression}
            size={120}
            animated
          />

          <PixelText size="tiny" color={COLORS.ink} center fontFamily="ui">
            {currentPatient.fullName}
          </PixelText>
          {currentPatient.socialLabel && (
            <View style={styles.badgeSocial}>
              <PixelText size="tiny" color={COLORS.paper} fontFamily="ui">
                {currentPatient.socialLabel}
              </PixelText>
            </View>
          )}

          {/* Badges */}
          {currentPatient.isReturning && (
            <View style={styles.badgeReturning}>
              <Animated.View style={{
                transform: [{
                  rotate: starAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }}>
                <View style={styles.starBadge}>
                  <Px x={6} y={0} w={4} h={4} color={COLORS.gold} />
                  <Px x={0} y={4} w={16} h={4} color={COLORS.gold} />
                  <Px x={2} y={8} w={12} h={4} color={COLORS.gold} />
                  <Px x={4} y={12} w={8} h={4} color={COLORS.gold} />
                  <Px x={6} y={16} w={4} h={2} color={COLORS.gold} />
                </View>
              </Animated.View>
              <PixelText size="tiny" color={COLORS.green} fontFamily="ui">RET</PixelText>
            </View>
          )}
          {currentPatient.isPremium && (
            <View style={styles.badgeVip}>
              <PixelText size="tiny" color={COLORS.gold} fontFamily="ui">VIP</PixelText>
            </View>
          )}
        </Animated.View>
      )}

      {/* Morning message (before day starts) */}
      {!dayStarted && (
        <View style={styles.roomMessage}>
          <Animated.View style={{ transform: [{ translateY: sunAnim }] }}>
            <View style={styles.bigSun}>
              <Px x={10} y={0} w={20} h={6} color="#f4d35e" />
              <Px x={4} y={6} w={32} h={6} color="#f4d35e" />
              <Px x={0} y={12} w={40} h={16} color="#f4d35e" />
              <Px x={4} y={28} w={32} h={6} color="#f4d35e" />
              <Px x={10} y={34} w={20} h={6} color="#f4d35e" />
              <Px x={-8} y={16} w={8} h={6} color="#ffe48a" />
              <Px x={40} y={16} w={8} h={6} color="#ffe48a" />
              <Px x={14} y={-8} w={12} h={8} color="#ffe48a" />
              <Px x={14} y={40} w={12} h={6} color="#ffe48a" />
              <Px x={12} y={16} w={4} h={4} color={COLORS.dark} />
              <Px x={24} y={16} w={4} h={4} color={COLORS.dark} />
              <Px x={14} y={24} w={12} h={3} color={COLORS.dark} />
            </View>
          </Animated.View>
          <PixelText size="medium" color={COLORS.primary} center fontFamily="ui">
            {t('goodMorning')}
          </PixelText>
          <PixelText size="small" color={COLORS.paper} center fontFamily="ui">
            {t('patientsToday')}: {gameState.getMaxPatientsPerDay()}
          </PixelText>
        </View>
      )}

      {/* End of day message */}
      {dayEnded && (
        <View style={styles.roomMessage}>
          <Animated.View style={{ transform: [{ translateY: moonAnim }] }}>
            <View style={styles.bigMoon}>
              <Px x={10} y={0} w={16} h={6} color="#edf2f4" />
              <Px x={4} y={6} w={28} h={6} color="#edf2f4" />
              <Px x={0} y={12} w={36} h={12} color="#edf2f4" />
              <Px x={4} y={24} w={28} h={6} color="#edf2f4" />
              <Px x={10} y={30} w={16} h={6} color="#edf2f4" />
              <Px x={8} y={14} w={6} h={6} color="#b5bdc9" />
              <Px x={20} y={20} w={4} h={4} color="#b5bdc9" />
              <Px x={14} y={26} w={4} h={3} color="#b5bdc9" />
              <Px x={-14} y={4} w={3} h={3} color="#f4d35e" />
              <Px x={40} y={8} w={3} h={3} color="#f4d35e" />
              <Px x={-8} y={28} w={2} h={2} color="#ffe48a" />
              <Px x={44} y={22} w={2} h={2} color="#ffe48a" />
            </View>
          </Animated.View>
          <PixelText size="medium" color={COLORS.primary} center fontFamily="ui">
            {t('endOfDay')}
          </PixelText>
          <PixelText size="small" color={COLORS.green} center fontFamily="ui">
            {t('dayEarnings')}: ${displayEarnings}
          </PixelText>
        </View>
      )}

      {/* CA speech bubble */}
      {caMessage && (
        <View style={styles.caOverlay}>
          <View style={styles.speechBubble}>
            <View style={styles.speechTail} />
            <PixelText size="tiny" color={COLORS.ink} shadow={false} fontFamily="ui">
              {t('caName')}: {caMessage}
            </PixelText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.wall,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.desk + '60',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  wallBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.wall,
  },

  // Wall decorations
  diploma: {
    position: 'absolute',
    right: 16,
    top: 10,
    width: 36,
    height: 26,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.paper,
    borderRadius: 3,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  diplomaInner: {
    flex: 1,
    position: 'relative',
  },
  poster: {
    position: 'absolute',
    left: 16,
    top: 40,
    width: 26,
    height: 36,
    borderWidth: 2.5,
    borderColor: COLORS.grayDark,
    backgroundColor: COLORS.paper,
    borderRadius: 3,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  posterInner: {
    flex: 1,
    position: 'relative',
  },
  plant: {
    position: 'absolute',
    right: 50,
    bottom: 8,
    width: 14,
    height: 24,
  },
  gameClock: {
    position: 'absolute',
    top: 10,
    left: 16,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: COLORS.grayDark,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  clockFrame: {
    padding: 2,
  },

  // Wall decoration upgrades
  wallPic1: {
    position: 'absolute',
    left: 60,
    top: 30,
    width: 24,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 2,
  },
  wallPic2: {
    position: 'absolute',
    left: 90,
    top: 28,
    width: 24,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 2,
  },
  wallClockDeco: {
    position: 'absolute',
    right: 60,
    top: 25,
    width: 16,
    height: 16,
    backgroundColor: COLORS.paper,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 8,
  },

  // Patient area
  patientArea: {
    position: 'absolute',
    left: '30%',
    top: '15%',
    alignItems: 'center',
    zIndex: 10,
  },
  vipBorder: {
    position: 'absolute',
    top: -8,
    left: -6,
    width: 132,
    height: 152,
    zIndex: -1,
  },
  vipGlow: {
    width: 132,
    height: 148,
    position: 'relative',
    alignItems: 'center',
  },
  vipLabelWrap: {
    position: 'absolute',
    top: -4,
    backgroundColor: COLORS.gold + '44',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeReturning: {
    position: 'absolute',
    top: -6,
    right: -16,
    alignItems: 'center',
  },
  badgeVip: {
    position: 'absolute',
    top: -6,
    left: -12,
    backgroundColor: COLORS.gold + '33',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  badgeSocial: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.deskDark,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  starBadge: {
    width: 16,
    height: 20,
    position: 'relative',
  },

  // Messages
  roomMessage: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  bigSun: {
    width: 48,
    height: 48,
    position: 'relative',
    marginBottom: 6,
  },
  bigMoon: {
    width: 50,
    height: 40,
    position: 'relative',
    marginBottom: 6,
  },

  // CA speech
  caOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 8,
    maxWidth: '55%',
    zIndex: 100,
  },
  speechBubble: {
    backgroundColor: COLORS.paper,
    padding: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  speechTail: {
    position: 'absolute',
    bottom: -8,
    left: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.border,
  },

  // PetDog
  petDog: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    width: 20,
    height: 20,
    zIndex: 15,
  },
});
