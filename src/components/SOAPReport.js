import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import { t } from '../utils/i18n';

export default function SOAPReport({ patient }) {
  const { condition } = patient;

  return (
    <View style={styles.container}>
      {/* Paper texture header with clip */}
      <View style={styles.clipContainer}>
        <View style={styles.clip} />
        <View style={styles.clipShadow} />
      </View>

      <View style={styles.paper}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <PixelText size="medium" color={COLORS.ink} shadow={false}>
              📋 {t('soapReport')}
            </PixelText>
          </View>
          <View style={styles.headerRight}>
            <PixelText size="tiny" color={COLORS.inkLight || '#4a4c5e'} shadow={false}>
              ID: {patient.id?.slice(-6) || '000001'}
            </PixelText>
          </View>
        </View>

        <View style={styles.divider} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Patient Info */}
          <View style={styles.patientInfo}>
            <View style={styles.infoRow}>
              <PixelText size="small" color={COLORS.ink} shadow={false}>
                {t('patientName')}: {patient.fullName}
              </PixelText>
            </View>
            <View style={styles.infoRow}>
              <PixelText size="small" color={COLORS.ink} shadow={false}>
                {patient.age} {t('age')} | {t('occupation')}: {patient.occupation}
              </PixelText>
            </View>
            {patient.isPremium && (
              <View style={styles.vipStamp}>
                <PixelText size="tiny" color={COLORS.gold} shadow={false}>
                  ⭐ {t('vipPatient')}
                </PixelText>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* S - Subjective */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: COLORS.primary }]}>
              <View style={[styles.sectionBadge, { backgroundColor: COLORS.primary }]}>
                <PixelText size="tiny" color={COLORS.white} shadow={false}>S</PixelText>
              </View>
              <PixelText size="normal" color={COLORS.primary} shadow={false}>
                {t('subjective')}
              </PixelText>
            </View>
            <PixelText size="small" color={COLORS.ink} shadow={false} style={styles.sectionText}>
              {condition.subjective}
            </PixelText>
          </View>

          {/* O - Objective */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: COLORS.accent }]}>
              <View style={[styles.sectionBadge, { backgroundColor: COLORS.accent }]}>
                <PixelText size="tiny" color={COLORS.white} shadow={false}>O</PixelText>
              </View>
              <PixelText size="normal" color={COLORS.accent} shadow={false}>
                {t('objective')}
              </PixelText>
            </View>
            <PixelText size="small" color={COLORS.ink} shadow={false} style={styles.sectionText}>
              {condition.objective}
            </PixelText>
          </View>

          {/* A - Assessment */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: COLORS.orange }]}>
              <View style={[styles.sectionBadge, { backgroundColor: COLORS.orange }]}>
                <PixelText size="tiny" color={COLORS.white} shadow={false}>A</PixelText>
              </View>
              <PixelText size="normal" color={COLORS.orange} shadow={false}>
                {t('assessment')}
              </PixelText>
            </View>
            <PixelText
              size="small"
              color={patient.isReferralCase ? COLORS.red : COLORS.ink}
              shadow={false}
              style={styles.sectionText}
            >
              {condition.assessment}
            </PixelText>
          </View>

          {/* P - Plan */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: COLORS.green }]}>
              <View style={[styles.sectionBadge, { backgroundColor: COLORS.green }]}>
                <PixelText size="tiny" color={COLORS.white} shadow={false}>P</PixelText>
              </View>
              <PixelText size="normal" color={COLORS.green} shadow={false}>
                {t('plan')}
              </PixelText>
            </View>
            <PixelText size="small" color={COLORS.ink} shadow={false} style={styles.sectionText}>
              {patient.isReferralCase ? t('planRefer') : t('planTreat')}
            </PixelText>
          </View>

          {/* Red flags warning */}
          {patient.isReferralCase && condition.redFlags && (
            <View style={styles.warningBox}>
              <PixelText size="small" color={COLORS.red} shadow={false} glow>
                ⚠️ {t('redFlagsDetected')}:
              </PixelText>
              {condition.redFlags.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <View style={styles.flagDot} />
                  <PixelText size="tiny" color={COLORS.red} shadow={false}>
                    {flag}
                  </PixelText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  clipContainer: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -12,
    zIndex: 10,
  },
  clip: {
    width: 24,
    height: 16,
    backgroundColor: COLORS.grayDark || '#5c6577',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  clipShadow: {
    width: 20,
    height: 4,
    backgroundColor: '#444',
    alignSelf: 'center',
  },
  paper: {
    backgroundColor: COLORS.paper,
    borderWidth: 3,
    borderColor: COLORS.dark,
    padding: 14,
    maxHeight: 420,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 5,
    marginTop: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {},
  headerRight: {},
  scroll: {
    flex: 1,
  },
  patientInfo: {
    marginBottom: 8,
    backgroundColor: COLORS.paperDark,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoRow: {
    paddingVertical: 1,
  },
  vipStamp: {
    marginTop: 4,
    backgroundColor: '#fff8e0',
    borderWidth: 1,
    borderColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.ink,
    marginVertical: 6,
    opacity: 0.2,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    borderLeftWidth: 4,
    paddingLeft: 6,
    paddingVertical: 2,
  },
  sectionBadge: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionText: {
    lineHeight: 19,
    paddingLeft: 12,
    color: COLORS.ink,
  },
  warningBox: {
    backgroundColor: '#fff0f0',
    borderWidth: 3,
    borderColor: COLORS.red,
    padding: 10,
    marginTop: 4,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    paddingLeft: 4,
  },
  flagDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.red,
  },
});
