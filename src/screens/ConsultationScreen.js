import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from '../components/PixelButton';
import PixelText from '../components/PixelText';
import PixelCard from '../components/PixelCard';
import PixelAvatar from '../components/PixelAvatar';
import SOAPReport from '../components/SOAPReport';
import soundManager from '../utils/soundManager';
import gameState from '../utils/gameState';
import { t } from '../utils/i18n';
import { getCADialogue } from '../data/staff';
import { shouldTriggerNeuroTest } from '../data/neuroTests';

// Lazy-load mini-game components (they may not exist yet during development)
let PalpationMiniGame = null;
let XRayMiniGame = null;
let NeuroTestMiniGame = null;
try { PalpationMiniGame = require('../components/PalpationMiniGame').default; } catch(e) {}
try { XRayMiniGame = require('../components/XRayMiniGame').default; } catch(e) {}
try { NeuroTestMiniGame = require('../components/NeuroTestMiniGame').default; } catch(e) {}

// Phases: 'soap' → 'palpation' → 'xray' → 'neuro' → 'decision' → result
export default function ConsultationScreen({ route, navigation }) {
  const { patient } = route.params;
  const [phase, setPhase] = useState('soap');
  const [decision, setDecision] = useState(null);
  const [resultAnim] = useState(new Animated.Value(0));
  const [caMessage, setCaMessage] = useState(null);

  // Mini-game results
  const [palpationResult, setPalpationResult] = useState(null);
  const [xrayResult, setXrayResult] = useState(null);
  const [neuroResult, setNeuroResult] = useState(null);

  // Check if X-ray is unlocked
  const hasXray = useMemo(() => {
    const state = gameState.getState();
    return state?.purchasedTools?.includes('xray') || false;
  }, []);

  // Check if neuro test should trigger
  const needsNeuroTest = useMemo(() => {
    return shouldTriggerNeuroTest(patient.condition);
  }, [patient]);

  useEffect(() => {
    soundManager.playPatientEnter();
  }, []);

  const showResult = () => {
    Animated.spring(resultAnim, {
      toValue: 1,
      tension: 12,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // ── Mini-game handlers ──

  const handlePalpationComplete = useCallback((result) => {
    setPalpationResult(result);
    soundManager.playSuccess();
    setPhase('soap'); // Return to SOAP view with results
  }, []);

  const handleXrayComplete = useCallback((result) => {
    setXrayResult(result);
    soundManager.playSuccess();
    setPhase('soap');
  }, []);

  const handleNeuroComplete = useCallback((result) => {
    setNeuroResult(result);
    soundManager.playSuccess();
    setPhase('soap');
  }, []);

  // ── Decision handlers ──

  const handleTreat = useCallback(() => {
    // Check if neuro test recommends referral and player ignores it
    if (neuroResult?.recommendation === 'refer') {
      // Extra penalty for ignoring neuro test warning
    }

    if (patient.isReferralCase) {
      soundManager.playError();
      setDecision('wrong_treat');
      if (gameState.hasCA()) {
        setTimeout(() => {
          soundManager.playCASpeak();
          setCaMessage(t(getCADialogue('badJob')));
        }, 500);
      }
    } else {
      soundManager.playSuccess();
      // Pass mini-game bonuses to treatment
      navigation.replace('Treatment', {
        patient,
        palpationResult,
        xrayResult,
        neuroResult,
      });
      return;
    }
    showResult();
  }, [patient, navigation, palpationResult, xrayResult, neuroResult]);

  const handleRefer = useCallback(() => {
    if (patient.isReferralCase) {
      soundManager.playSuccess();
      setDecision('correct_refer');
      if (gameState.hasCA()) {
        setTimeout(() => {
          soundManager.playCASpeak();
          setCaMessage(t(getCADialogue('referral')));
        }, 500);
      }
    } else {
      soundManager.playRefer();
      setDecision('wrong_refer');
      if (gameState.hasCA()) {
        setTimeout(() => {
          soundManager.playCASpeak();
          setCaMessage(t(getCADialogue('wrongReferral')));
        }, 500);
      }
    }
    showResult();
  }, [patient]);

  const handleContinue = useCallback(() => {
    let result;
    if (decision === 'correct_refer') result = 'referred';
    else if (decision === 'wrong_treat') result = 'wrong_treat';
    else if (decision === 'wrong_refer') result = 'wrong_refer';
    navigation.navigate('ClinicView', { result, patientId: patient.id });
  }, [decision, patient, navigation]);

  const resultScale = resultAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  // ── Render mini-game phases ──

  if (phase === 'palpation' && PalpationMiniGame) {
    return (
      <PalpationMiniGame
        condition={patient.condition}
        onComplete={handlePalpationComplete}
        onSkip={() => setPhase('soap')}
        skillLevel={gameState.getState()?.skillLevel || 1}
      />
    );
  }

  if (phase === 'xray' && XRayMiniGame) {
    return (
      <XRayMiniGame
        condition={patient.condition}
        onComplete={handleXrayComplete}
        onSkip={() => setPhase('soap')}
        skillLevel={gameState.getState()?.skillLevel || 1}
      />
    );
  }

  if (phase === 'neuro' && NeuroTestMiniGame) {
    return (
      <NeuroTestMiniGame
        condition={patient.condition}
        onComplete={handleNeuroComplete}
        skillLevel={gameState.getState()?.skillLevel || 1}
      />
    );
  }

  // ── Main consultation view ──

  return (
    <View style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Patient header */}
      <PixelCard color={COLORS.deskDark} borderColor={patient.isPremium ? COLORS.gold : COLORS.accent}>
        <View style={styles.patientHeader}>
          <PixelAvatar
            avatar={patient.avatar}
            size={65}
            expression={patient.isReferralCase ? 'pain' : 'worried'}
          />
          <View style={styles.patientInfo}>
            <PixelText size="medium" color={COLORS.white}>
              {patient.fullName}
            </PixelText>
            <PixelText size="small" color={COLORS.gray}>
              {patient.age} {t('age')} | {patient.occupation}
            </PixelText>
            {patient.isPremium && (
              <View style={styles.vipBadge}>
                <PixelText size="tiny" color={COLORS.gold} glow>
                  ⭐ {t('vipPatient')} - {patient.eventName}
                </PixelText>
              </View>
            )}
            {patient.isReturning && (
              <View style={styles.returningBadge}>
                <PixelText size="tiny" color={COLORS.green}>
                  ⭐ {t('returningPatient')}
                </PixelText>
              </View>
            )}
          </View>
        </View>
      </PixelCard>

      {/* Mini-game result badges */}
      {(palpationResult || xrayResult || neuroResult) && !decision && (
        <View style={styles.bonusBadges}>
          {palpationResult && (
            <View style={[styles.bonusBadge, { borderColor: COLORS.accent }]}>
              <PixelText size="tiny" color={COLORS.accent}>
                🤚 {palpationResult.found}/{palpationResult.total} {t('found')} (+{Math.round(palpationResult.bonus * 100)}%)
              </PixelText>
            </View>
          )}
          {xrayResult && (
            <View style={[styles.bonusBadge, { borderColor: COLORS.primary }]}>
              <PixelText size="tiny" color={COLORS.primary}>
                📋 {xrayResult.found}/{xrayResult.total} {t('found')} (+{Math.round(xrayResult.bonus * 100)}%)
              </PixelText>
            </View>
          )}
          {neuroResult && (
            <View style={[styles.bonusBadge, {
              borderColor: neuroResult.recommendation === 'safe' ? COLORS.green :
                neuroResult.recommendation === 'caution' ? COLORS.orange : COLORS.red
            }]}>
              <PixelText size="tiny" color={
                neuroResult.recommendation === 'safe' ? COLORS.green :
                  neuroResult.recommendation === 'caution' ? COLORS.orange : COLORS.red
              }>
                🧠 {neuroResult.testsCorrect}/3 — {
                  neuroResult.recommendation === 'safe' ? t('safeToTreat') :
                    neuroResult.recommendation === 'caution' ? t('cautionTreat') :
                      neuroResult.recommendation === 'refer' ? t('mustRefer') : t('ambiguousResult')
                }
              </PixelText>
            </View>
          )}
        </View>
      )}

      {/* SOAP Report */}
      {!decision && <SOAPReport patient={patient} />}

      {/* Decision result - correct referral */}
      {decision === 'correct_refer' && (
        <Animated.View style={{ transform: [{ scale: resultScale }], opacity: resultAnim }}>
          <PixelCard color="#1a2e1a" borderColor={COLORS.green}>
            <PixelText size="medium" color={COLORS.green} center glow>
              ✅ {t('correctDecision')}
            </PixelText>
            <View style={styles.resultDivider} />
            <PixelText size="small" color={COLORS.white} center style={styles.resultText}>
              {t('correctReferMsg')}
            </PixelText>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('referredTo')}:</PixelText>
              <PixelText size="small" color={COLORS.accent}>{patient.condition.specialist}</PixelText>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('consultationFee')}:</PixelText>
              <PixelText size="small" color={COLORS.gold}>${Math.round(patient.payment * 0.3)}</PixelText>
            </View>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>XP:</PixelText>
              <PixelText size="small" color={COLORS.green}>+{patient.condition.xpReward}</PixelText>
            </View>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('reputation')}:</PixelText>
              <PixelText size="small" color={COLORS.green}>+5 ⭐</PixelText>
            </View>
          </PixelCard>
        </Animated.View>
      )}

      {/* Decision result - wrong treatment */}
      {decision === 'wrong_treat' && (
        <Animated.View style={{ transform: [{ scale: resultScale }], opacity: resultAnim }}>
          <PixelCard color="#3a1a1a" borderColor={COLORS.red}>
            <PixelText size="medium" color={COLORS.red} center glow>
              ❌ {t('seriousError')}
            </PixelText>
            <View style={styles.resultDivider} />
            <PixelText size="small" color={COLORS.white} center style={styles.resultText}>
              {t('wrongTreatMsg')}
            </PixelText>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('diagnosis')}:</PixelText>
              <PixelText size="small" color={COLORS.red}>{patient.condition.name}</PixelText>
            </View>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('reason')}:</PixelText>
              <PixelText size="small" color={COLORS.red}>{patient.condition.referralReason}</PixelText>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('repLost')}:</PixelText>
              <PixelText size="small" color={COLORS.red}>-10 ⭐</PixelText>
            </View>
            <View style={styles.tipBox}>
              <PixelText size="tiny" color={COLORS.accent}>
                💡 {t('rememberManual')}
              </PixelText>
            </View>
          </PixelCard>
        </Animated.View>
      )}

      {/* Decision result - wrong referral */}
      {decision === 'wrong_refer' && (
        <Animated.View style={{ transform: [{ scale: resultScale }], opacity: resultAnim }}>
          <PixelCard color="#3a2a1a" borderColor={COLORS.orange}>
            <PixelText size="medium" color={COLORS.orange} center glow>
              ⚠️ {t('unnecessaryReferral')}
            </PixelText>
            <View style={styles.resultDivider} />
            <PixelText size="small" color={COLORS.white} center style={styles.resultText}>
              {t('wrongReferMsg')}
            </PixelText>
            <View style={styles.resultRow}>
              <PixelText size="small" color={COLORS.gray}>{t('condition')}:</PixelText>
              <PixelText size="small" color={COLORS.orange}>{patient.condition.name}</PixelText>
            </View>
            <PixelText size="small" color={COLORS.orange} center style={styles.resultText}>
              {t('patientLeft')} -3 {t('reputation')}.
            </PixelText>
          </PixelCard>
        </Animated.View>
      )}

      {/* CA Message */}
      {caMessage && (
        <PixelCard color={COLORS.paper} borderColor={COLORS.accent}>
          <PixelText size="small" color={COLORS.ink} shadow={false}>
            👩‍⚕️ {t('caName')}: {caMessage}
          </PixelText>
        </PixelCard>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        {!decision && (
          <>
            {/* Mini-game buttons (before treatment decision) */}
            <View style={styles.miniGameButtons}>
              {PalpationMiniGame && !palpationResult && (
                <PixelButton
                  title={t('palpate')}
                  icon="🤚"
                  color={COLORS.accent}
                  onPress={() => setPhase('palpation')}
                  small
                />
              )}
              {XRayMiniGame && hasXray && !xrayResult && (
                <PixelButton
                  title={t('xray')}
                  icon="📋"
                  color={COLORS.primary}
                  onPress={() => setPhase('xray')}
                  small
                />
              )}
              {NeuroTestMiniGame && needsNeuroTest && !neuroResult && (
                <PixelButton
                  title={t('neuroTest')}
                  icon="🧠"
                  color={COLORS.orange}
                  onPress={() => setPhase('neuro')}
                  small
                />
              )}
            </View>

            <PixelButton
              title={t('treatPatient')}
              icon="🤲"
              color={COLORS.green}
              onPress={handleTreat}
            />
            <PixelButton
              title={t('referSpecialist')}
              icon="🏥"
              color={COLORS.orange}
              onPress={handleRefer}
            />
            <PixelButton
              title={t('consultManual')}
              icon="📖"
              color={COLORS.secondary}
              onPress={() => navigation.navigate('PathologyBook')}
              small
            />
          </>
        )}
        {decision && (
          <PixelButton
            title={t('nextPatient')}
            icon="➡"
            color={COLORS.primary}
            onPress={handleContinue}
          />
        )}
      </View>
    </ScrollView>
    {/* Modal will go here as a sibling in Task 7 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 14,
    paddingTop: 42,
    gap: 12,
    flexGrow: 1,
    paddingBottom: 40,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  patientInfo: {
    flex: 1,
  },
  vipBadge: {
    marginTop: 4,
    backgroundColor: COLORS.bgMedium,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignSelf: 'flex-start',
    borderRadius: 4,
  },
  returningBadge: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  bonusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bonusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: COLORS.deskDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  miniGameButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  resultDivider: {
    height: 2,
    backgroundColor: COLORS.grayDark,
    marginVertical: 8,
    opacity: 0.3,
  },
  resultText: {
    marginVertical: 6,
    lineHeight: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  tipBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.deskDark,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  actions: {
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
  },
});
