import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import PixelCard from '../components/PixelCard';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');
const ROOM_SIZE = Math.min((width - 60) / 2, 150);

export default function AerialViewScreen({ navigation }) {
  const [state, setState] = useState(gameState.state);
  const chirosCount = gameState.getHiredChirosCount();
  const [animations] = useState(() =>
    Array.from({ length: 3 }).map(() => new Animated.Value(0))
  );

  useEffect(() => {
    const unsub = gameState.subscribe(setState);
    soundManager.init();
    soundManager.playClinicMusic();

    // Animate hired chiros
    animations.forEach((anim, i) => {
      if (i < chirosCount) {
        const startAnim = () => {
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
            Animated.delay(800 + Math.random() * 1500),
            Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
            Animated.delay(1000 + Math.random() * 2000),
          ]).start(() => startAnim());
        };
        startAnim();
      }
    });

    return () => {
      unsub();
      soundManager.stopMusic();
      animations.forEach(anim => anim.stopAnimation());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PixelText size="large" color={COLORS.gold} center glow>
          🏥 {t('aerialView')}
        </PixelText>
        <PixelText size="tiny" color={COLORS.gray} center>
          {t('manualMode')} / {t('autoMode')}
        </PixelText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Building overview */}
        <View style={styles.building}>
          {/* Roof */}
          <View style={styles.roof}>
            <PixelText size="small" color={COLORS.white} center>
              {state.clinicName}
            </PixelText>
          </View>

          {/* Rooms grid */}
          <View style={styles.roomsGrid}>
            {/* Player room */}
            <View style={[styles.room, styles.playerRoom]}>
              <View style={[styles.roomLabel, { backgroundColor: COLORS.primary }]}>
                <PixelText size="tiny" color={COLORS.white}>{t('yourRoom')}</PixelText>
              </View>
              <View style={styles.roomInterior}>
                <View style={styles.doctorIcon}>
                  <PixelText size="small" center>👨‍⚕️</PixelText>
                </View>
                <View style={styles.tableIcon} />
                <View style={styles.statusDot}>
                  <View style={[styles.statusLight, { backgroundColor: COLORS.green }]} />
                </View>
              </View>
            </View>

            {/* Hired chiro rooms */}
            {Array.from({ length: 3 }).map((_, idx) => {
              const isUnlocked = idx < chirosCount;
              return (
                <View key={idx} style={[styles.room, !isUnlocked && styles.lockedRoom]}>
                  <View style={[styles.roomLabel, { backgroundColor: isUnlocked ? COLORS.secondary : COLORS.grayDark }]}>
                    <PixelText size="tiny" color={COLORS.white}>
                      {isUnlocked ? `${t('room')} ${idx + 2}` : '🔒'}
                    </PixelText>
                  </View>
                  {isUnlocked ? (
                    <View style={styles.roomInterior}>
                      <Animated.View style={[
                        styles.doctorIcon,
                        {
                          backgroundColor: COLORS.secondaryLight || '#7b52ab',
                          transform: [{
                            translateX: animations[idx].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, ROOM_SIZE * 0.3],
                            })
                          }]
                        }
                      ]}>
                        <PixelText size="small" center>👨‍⚕️</PixelText>
                      </Animated.View>
                      <View style={styles.tableIcon} />
                      <Animated.View style={[styles.statusDot, {
                        opacity: animations[idx].interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0.5, 1],
                        })
                      }]}>
                        <Animated.View style={[styles.statusLight, {
                          backgroundColor: animations[idx].interpolate({
                            inputRange: [0, 1],
                            outputRange: [COLORS.green, COLORS.orange],
                          })
                        }]} />
                      </Animated.View>
                    </View>
                  ) : (
                    <View style={styles.lockedContent}>
                      <PixelText size="large" color={COLORS.grayDark} center>🔒</PixelText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Reception area */}
          <View style={styles.reception}>
            <View style={styles.receptionDesk}>
              <PixelText size="tiny" color={COLORS.white} center>🖥️ Reception</PixelText>
            </View>
            {/* Waiting chairs */}
            <View style={styles.waitingArea}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.chair}>
                  <PixelText size="tiny" center>🪑</PixelText>
                </View>
              ))}
            </View>
          </View>

          {/* Entrance */}
          <View style={styles.entrance}>
            <View style={styles.door} />
            <PixelText size="tiny" color={COLORS.gray} center>🚪</PixelText>
          </View>
        </View>

        {/* Info card */}
        <PixelCard color={COLORS.dark} borderColor={COLORS.primary}>
          <PixelText size="small" color={COLORS.accent} center>
            {t('aerialView')} - {t('clinic')}
          </PixelText>
          <View style={styles.infoRow}>
            <PixelText size="tiny" color={COLORS.gray}>
              {t('staff')}: {chirosCount}/3
            </PixelText>
            <PixelText size="tiny" color={COLORS.gold}>
              {t('level')}: {state.clinicLevel}
            </PixelText>
          </View>
          <PixelText size="tiny" color={COLORS.grayDark} style={styles.infoDesc}>
            {chirosCount > 0
              ? `${chirosCount} chiropractors treating patients automatically, generating passive income.`
              : 'Hire chiropractors in the Shop to expand your clinic.'}
          </PixelText>
        </PixelCard>
      </ScrollView>

      <View style={styles.footer}>
        <PixelButton
          title={`👁️ ${t('manualMode')}`}
          color={COLORS.primary}
          onPress={() => {
            soundManager.stopMusic();
            navigation.replace('ClinicView');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.dark,
    borderBottomWidth: 4,
    borderColor: COLORS.gold,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  building: {
    width: Math.min(width - 32, 340),
    backgroundColor: COLORS.bgLight,
    borderWidth: 4,
    borderColor: COLORS.grayDark,
    overflow: 'hidden',
    marginBottom: 12,
  },
  roof: {
    backgroundColor: COLORS.dark,
    paddingVertical: 6,
    borderBottomWidth: 3,
    borderColor: COLORS.accent,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
    gap: 6,
    justifyContent: 'center',
  },
  room: {
    width: ROOM_SIZE,
    height: ROOM_SIZE * 0.85,
    backgroundColor: '#4a6580',
    borderWidth: 2,
    borderColor: COLORS.dark,
    overflow: 'hidden',
  },
  playerRoom: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  lockedRoom: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
  },
  roomLabel: {
    paddingVertical: 2,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  roomInterior: {
    flex: 1,
    position: 'relative',
    padding: 4,
  },
  doctorIcon: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 22,
    height: 22,
    backgroundColor: COLORS.skin,
    borderWidth: 1,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 18,
    height: 40,
    backgroundColor: '#3d2817',
    borderWidth: 1,
    borderColor: '#000',
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  statusLight: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reception: {
    flexDirection: 'row',
    padding: 6,
    gap: 6,
    borderTopWidth: 2,
    borderColor: COLORS.grayDark,
    backgroundColor: '#2a3a4a',
  },
  receptionDesk: {
    width: 80,
    height: 36,
    backgroundColor: COLORS.dark,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
  },
  waitingArea: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chair: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entrance: {
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: COLORS.dark,
    borderTopWidth: 2,
    borderColor: COLORS.grayDark,
  },
  door: {
    width: 30,
    height: 4,
    backgroundColor: COLORS.gold,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  infoDesc: {
    marginTop: 4,
    lineHeight: 16,
  },
  footer: {
    padding: 12,
    backgroundColor: COLORS.dark,
    borderTopWidth: 3,
    borderColor: COLORS.grayDark,
  },
});
