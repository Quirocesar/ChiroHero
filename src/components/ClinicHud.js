import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import Px from './Px';
import { t } from '../utils/i18n';

export default function ClinicHud({
  state,
  dayStarted,
  dayEnded,
  dayTimeRemaining,
  predictedPatients,
  seasonInfo,
  reputationInfo,
  streakInfo,
}) {
  return (
    <View style={styles.hud}>
      {/* Left section: Money, day/week, timer */}
      <View style={styles.hudSection}>
        <View style={styles.stickyLabel}>
          <View style={styles.hudIconRow}>
            <View style={styles.coinIcon}>
              <Px x={1} y={1} w={8} h={8} color={COLORS.gold} />
              <Px x={3} y={3} w={4} h={4} color={COLORS.goldDark} />
            </View>
            <PixelText size="small" color={COLORS.primary} fontFamily="ui">
              {' '}${state.money}
            </PixelText>
          </View>
        </View>
        {state.clinicDebt > 0 && (
          <View style={[styles.stickyLabel, styles.debtLabel]}>
            <PixelText size="tiny" color={COLORS.red} fontFamily="mono">
              Deuda ${state.clinicDebt}
            </PixelText>
          </View>
        )}
        {(state.loanPrincipal || 0) > 0 && (
          <View style={[styles.stickyLabel, styles.debtLabel]}>
            <PixelText size="tiny" color={COLORS.orange} fontFamily="mono">
              Prestamo ${Math.round(state.loanPrincipal)} / cuota ${Math.round(state.loanInstallment || 0)} ({(state.debtTier || 'micro').toUpperCase()})
            </PixelText>
          </View>
        )}
        {!dayStarted && !dayEnded && (
          <View style={styles.stickyLabel}>
            <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">
              Pacientes previstos: {predictedPatients ?? '-'}
            </PixelText>
          </View>
        )}
        {(state.pendingDailyReward || 0) > 0 && !dayStarted && !dayEnded && (
          <View style={styles.stickyLabel}>
            <PixelText size="tiny" color={COLORS.green} fontFamily="mono">
              Bonus pendiente ${state.pendingDailyReward}
            </PixelText>
          </View>
        )}

        <View style={styles.stickyLabel}>
          <View style={styles.calendarIcon}>
            <Px x={0} y={0} w={8} h={2} color={COLORS.red} />
            <Px x={0} y={2} w={8} h={6} color={COLORS.paper} />
            <Px x={2} y={4} w={4} h={2} color={COLORS.ink} />
          </View>
          <PixelText size="tiny" color={COLORS.paper} fontFamily="ui">
            {' '}{t('day')} {state.currentDay} | {t('week')} {state.currentWeek}
          </PixelText>
        </View>

        {dayStarted && !dayEnded && dayTimeRemaining > 0 && (
          <View style={[
            styles.timerLabel,
            dayTimeRemaining < 60 && styles.timerUrgent,
          ]}>
            <View style={styles.clockMiniIcon}>
              <Px x={0} y={0} w={6} h={6} color={dayTimeRemaining < 60 ? COLORS.red : COLORS.green} style={{ borderRadius: 3 }} />
              <Px x={2} y={1} w={1} h={3} color={COLORS.paper} />
              <Px x={2} y={2} w={2} h={1} color={COLORS.paper} />
            </View>
            <PixelText size="tiny" color={dayTimeRemaining < 60 ? COLORS.red : COLORS.green} fontFamily="mono">
              {' '}{Math.floor(dayTimeRemaining / 60)}:{(dayTimeRemaining % 60).toString().padStart(2, '0')}
            </PixelText>
          </View>
        )}

        {seasonInfo.currentSeason > 1 && (
          <View style={styles.seasonBadge}>
            <PixelText size="tiny" color={COLORS.secondary} fontFamily="ui">
              T{seasonInfo.currentSeason}
            </PixelText>
          </View>
        )}
      </View>

      {/* Center section: Clinic name, level, rank */}
      <View style={[styles.hudSection, { alignItems: 'center' }]}>
        <PixelText size="small" color={COLORS.primary} fontFamily="ui">
          {state.clinicName}
        </PixelText>
        <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
          {t('level')} {state.clinicLevel}
        </PixelText>
        {reputationInfo.rank && (
          <View style={[styles.rankBadge, { borderColor: reputationInfo.rank.color }]}>
            <PixelText size="tiny" color={reputationInfo.rank.color} fontFamily="ui">
              {reputationInfo.rank.rank}
            </PixelText>
          </View>
        )}
      </View>

      {/* Right section: Reputation, skill, streak */}
      <View style={[styles.hudSection, { alignItems: 'flex-end' }]}>
        <View style={styles.stickyLabel}>
          <View style={styles.hudIconRow}>
            <View style={styles.starIcon}>
              <Px x={3} y={0} w={4} h={4} color={COLORS.green} />
              <Px x={0} y={3} w={10} h={4} color={COLORS.green} />
              <Px x={3} y={6} w={4} h={4} color={COLORS.green} />
            </View>
            <PixelText size="small" color={COLORS.green} fontFamily="ui">
              {' '}{state.reputation}
            </PixelText>
          </View>
        </View>
        <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
          {t('skill')} Lv.{state.skillLevel}
        </PixelText>
        <View style={styles.repInfoRow}>
          <PixelText size="tiny" color={COLORS.primary} fontFamily="ui">
            {reputationInfo.title}
          </PixelText>
          {streakInfo.streak > 0 && (
            <View style={styles.streakBadge}>
              <PixelText size="tiny" color={COLORS.orange} fontFamily="mono">
                x{streakInfo.streak}
              </PixelText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.deskDark,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.desk,
    borderBottomColor: COLORS.dark,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  hudSection: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  hudIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.deskDark + '88',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debtLabel: {
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.red + '22',
  },
  coinIcon: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  calendarIcon: {
    width: 10,
    height: 10,
    position: 'relative',
  },
  clockMiniIcon: {
    width: 8,
    height: 8,
    position: 'relative',
  },
  starIcon: {
    width: 14,
    height: 12,
    position: 'relative',
  },
  timerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 4,
  },
  timerUrgent: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.red + '22',
  },
  seasonBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: COLORS.secondary + '44',
    borderRadius: 4,
  },
  rankBadge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderRadius: 4,
  },
  repInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: COLORS.orange + '44',
    borderRadius: 4,
  },
});

