import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import { t } from '../utils/i18n';
import soundManager from '../utils/soundManager';
import gameState from '../utils/gameState';

function renderStars(count) {
  let result = '';
  for (let i = 0; i < 5; i++) result += i < count ? '★' : '☆';
  return result;
}

export default function AppointmentRegistry({ visible, onClose }) {
  if (!visible) return null;

  const history = gameState.get('appointmentHistory') || [];
  const playerName = gameState.get('playerName') || 'Dr. Quiro';

  // Calculate stats
  const totalPatients = history.length;
  const totalEarnings = history.reduce((sum, r) => sum + (r.payment || 0), 0);
  const avgScore = totalPatients > 0
    ? Math.round(history.reduce((sum, r) => sum + (r.score || 0), 0) / totalPatients)
    : 0;
  const bestCombo = history.reduce((max, r) => Math.max(max, r.combo || 0), 0);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.monitor}>
        {/* Monitor frame top */}
        <View style={styles.monitorTop}>
          <PixelText size="tiny" color={COLORS.gray}>CHIRO-OS v2.0</PixelText>
          <View style={styles.monitorLeds}>
            <View style={[styles.led, { backgroundColor: '#00ff00' }]} />
            <View style={[styles.led, { backgroundColor: '#ff6600' }]} />
          </View>
        </View>

        {/* CRT scanline effect */}
        <View style={styles.screen}>
          <View style={styles.scanlines} />
          <View style={styles.header}>
            <PixelText size="small" color={COLORS.primary} center>
              📋 {t('appointmentHistory') || 'REGISTRO DE CITAS'}
            </PixelText>
            <PixelText size="tiny" color={COLORS.accent} center>
              {playerName} — {t('clinicName') || 'Clínica QuiroHero'}
            </PixelText>
          </View>

          {/* Stats bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>
                {t('patients') || 'Pacientes'}
              </PixelText>
              <PixelText size="small" color={COLORS.primary}>
                {totalPatients}
              </PixelText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>
                {t('earnings') || 'Ganancias'}
              </PixelText>
              <PixelText size="small" color={COLORS.gold}>
                ${totalEarnings}
              </PixelText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>
                {t('score') || 'Puntuación'}
              </PixelText>
              <PixelText size="small" color={COLORS.green}>
                {avgScore}%
              </PixelText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <PixelText size="tiny" color={COLORS.gray}>
                COMBO
              </PixelText>
              <PixelText size="small" color={COLORS.accent}>
                x{bestCombo}
              </PixelText>
            </View>
          </View>

          {/* Records list */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <PixelText size="medium" color={COLORS.grayDark} center>💻</PixelText>
                <PixelText size="small" color={COLORS.gray} center>
                  {t('noAppointments') || 'No hay registros aún'}
                </PixelText>
                <PixelText size="tiny" color={COLORS.grayDark} center>
                  {t('tapToAdjust') || 'Atiende pacientes para ver registros'}
                </PixelText>
              </View>
            ) : (
              history.map((record, index) => {
                const isReferred = record.outcome === 'referred';
                const stars = record.stars || 0;
                return (
                  <View
                    key={index}
                    style={[
                      styles.recordRow,
                      index % 2 === 0 ? styles.recordEven : styles.recordOdd,
                    ]}
                  >
                    <View style={styles.recordLeft}>
                      <View style={styles.recordNameRow}>
                        {record.isPremium && (
                          <View style={styles.vipTag}>
                            <PixelText size="tiny" color={COLORS.dark}>VIP</PixelText>
                          </View>
                        )}
                        <PixelText size="tiny" color={COLORS.white}>
                          {record.patientName}
                        </PixelText>
                      </View>
                      <PixelText size="tiny" color={COLORS.gray}>
                        {record.date || (`${t('day')} ${record.day}`)} — {record.condition}
                      </PixelText>
                      {stars > 0 && (
                        <PixelText size="tiny" color={COLORS.gold}>
                          {renderStars(stars)}
                        </PixelText>
                      )}
                    </View>
                    <View style={styles.recordRight}>
                      <PixelText size="tiny" color={COLORS.gold}>
                        ${record.payment || 0}
                      </PixelText>
                      {record.combo > 1 && (
                        <PixelText size="tiny" color={COLORS.accent}>
                          x{record.combo}
                        </PixelText>
                      )}
                      <View style={[
                        styles.outcomeBadge,
                        { backgroundColor: isReferred ? COLORS.orange : COLORS.green },
                      ]}>
                        <PixelText size="tiny" color={COLORS.white}>
                          {isReferred ? (t('referred') || 'DERIVADO') : (t('treated') || 'TRATADO')}
                        </PixelText>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <PixelButton
            title={t('back') || 'VOLVER'}
            color={COLORS.bgMedium}
            onPress={() => {
              soundManager.playClick();
              onClose();
            }}
            style={styles.closeButton}
          />
        </View>

        {/* Monitor stand */}
        <View style={styles.stand} />
        <View style={styles.base} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  monitor: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.paperDark,
    padding: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.grayLight,
  },
  monitorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  monitorLeds: {
    flexDirection: 'row',
    gap: 4,
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  screen: {
    backgroundColor: COLORS.bgDark,
    borderWidth: 3,
    borderColor: COLORS.grayDark,
    borderRadius: 4,
    padding: 12,
    minHeight: 300,
    maxHeight: 450,
  },
  header: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayDark,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.bgMedium,
    borderWidth: 1,
    borderColor: COLORS.grayDark,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.grayDark,
  },
  scrollView: {
    flex: 1,
    marginBottom: 10,
  },
  emptyState: {
    paddingVertical: 40,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayDark,
  },
  recordEven: {
    backgroundColor: COLORS.bgMedium,
  },
  recordOdd: {
    backgroundColor: COLORS.bgDark,
  },
  recordLeft: {
    flex: 1,
    marginRight: 8,
  },
  recordRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  outcomeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  closeButton: {
    marginTop: 4,
  },
  stand: {
    width: 40,
    height: 16,
    backgroundColor: COLORS.grayLight,
    alignSelf: 'center',
    marginTop: 4,
  },
  base: {
    width: 80,
    height: 8,
    backgroundColor: COLORS.grayLight,
    alignSelf: 'center',
    borderRadius: 4,
  },
});
