import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { COLORS, darken } from '../utils/theme';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import gameState from '../utils/gameState';
import { t } from '../utils/i18n';

function TypewriterText({ text, color = COLORS.white, size = 'small', delay = 0, onComplete }) {
  const [displayText, setDisplayText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1;
        if (indexRef.current <= text.length) {
          setDisplayText(text.substring(0, indexRef.current));
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <PixelText size={size} color={color}>{displayText}</PixelText>;
}

export default function EndOfDayReport({ visible, dayReport, onContinue }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stampAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible) {
      setStep(0);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        const timer1 = setTimeout(() => setStep(1), 800);
        const timer2 = setTimeout(() => setStep(2), 2000);
        const timer3 = setTimeout(() => setStep(3), 3200);
        const timer4 = setTimeout(() => setStep(4), 4200);
        return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
      });
    }
  }, [visible]);

  useEffect(() => {
    if (step === 4) {
      Animated.sequence([
        Animated.timing(stampAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.timing(stampAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [step]);

  if (!visible || !dayReport) return null;

  const {
    earnings,
    expenses,
    netIncome,
    newBalance,
    headline,
    isInDebt,
    topFactors,
    objectives,
    rescue,
    debtTier,
    debtInterest,
    rewardFromPerformance,
    completedObjectivesCount,
    dailyEvent,
    monthlyCharge,
    postMonthlyRescue,
  } = dayReport;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {/* Paper/receipt style container */}
          <View style={styles.paper}>
            {/* Torn top edge */}
            <View style={styles.tornEdge}>
              {Array.from({ length: 18 }).map((_, i) => (
                <View key={`torn-${i}`} style={[styles.tornTooth, {
                  height: i % 2 === 0 ? 6 : 4,
                  backgroundColor: i % 3 === 0 ? COLORS.paperDark : COLORS.paper,
                }]} />
              ))}
            </View>

            {/* Clinic letterhead */}
            <View style={styles.letterhead}>
              <View style={styles.letterheadLogo}>
                <PixelText size="tiny" color={COLORS.ink} center shadow={false}>✚</PixelText>
              </View>
              <PixelText size="tiny" color={COLORS.ink} center shadow={false}>
                CHIRO HERO CLINIC
              </PixelText>
              <View style={styles.letterheadLine} />
            </View>

            {/* Header with decorative border */}
            <View style={styles.header}>
              <View style={styles.headerDecor}>
                <View style={styles.headerLine} />
                <View style={styles.headerDot} />
                <View style={styles.headerLine} />
              </View>
              <PixelText size="medium" color={COLORS.ink} center shadow={false}>
                📋 {t('endOfDayReport') || 'END OF DAY REPORT'}
              </PixelText>
              <View style={styles.dayBadge}>
                <PixelText size="tiny" color={COLORS.white} center shadow={false}>
                  {t('day') || 'Day'} {gameState.get('currentDay')}
                </PixelText>
              </View>
              <View style={styles.headerDecor}>
                <View style={styles.headerLine} />
                <View style={styles.headerDot} />
                <View style={styles.headerLine} />
              </View>
            </View>

            {/* Earnings section */}
            {step >= 1 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.green }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>+</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.green} shadow={false}>
                    {t('income') || 'INCOME'}
                  </PixelText>
                </View>
                <View style={[styles.lineItem, styles.lineItemHighlight]}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    💰 {t('patientPayments') || 'Patient payments'}
                  </PixelText>
                  <PixelText size="small" color={COLORS.green} shadow={false}>
                    +${earnings}
                  </PixelText>
                </View>
              </View>
            )}

            {/* Expenses section */}
            {step >= 2 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.red }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>-</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.red} shadow={false}>
                    {t('expenses') || 'EXPENSES'}
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    🏠 {t('rent') || 'Rent'}
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.red} shadow={false}>
                    -${expenses.rent}
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    🧴 {t('supplies') || 'Supplies'}
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.red} shadow={false}>
                    -${expenses.supplies}
                  </PixelText>
                </View>
                {expenses.staffCost > 0 && (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      👥 {t('staffSalaries') || 'Staff salaries'}
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.red} shadow={false}>
                      -${expenses.staffCost}
                    </PixelText>
                  </View>
                )}
                {expenses.equipmentMaintenance > 0 && (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      🔧 {t('maintenance') || 'Equipment'}
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.red} shadow={false}>
                      -${expenses.equipmentMaintenance}
                    </PixelText>
                  </View>
                )}
                <View style={styles.sectionDivider} />
                <View style={[styles.lineItem, styles.lineItemHighlight]}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    {t('totalExpenses') || 'Total expenses'}
                  </PixelText>
                  <PixelText size="small" color={COLORS.red} shadow={false}>
                    -${expenses.total}
                  </PixelText>
                </View>
              </View>
            )}

            {/* Net income */}
            {step >= 3 && (
              <View style={[styles.section, styles.totalSection]}>
                <View style={styles.totalLine}>
                  <PixelText size="small" color={COLORS.ink} shadow={false}>
                    {t('netIncome') || 'NET INCOME'}
                  </PixelText>
                  <PixelText size="large" color={netIncome >= 0 ? COLORS.green : COLORS.red} shadow={false}>
                    {netIncome >= 0 ? '+' : ''}${netIncome}
                  </PixelText>
                </View>
                <View style={styles.balanceLine}>
                  <PixelText size="tiny" color={COLORS.gray} shadow={false}>
                    {t('balance') || 'Balance'}:
                  </PixelText>
                  <View style={[styles.balanceBadge, {
                    backgroundColor: newBalance >= 0 ? COLORS.green + '20' : COLORS.red + '20',
                    borderColor: newBalance >= 0 ? COLORS.green : COLORS.red,
                  }]}>
                    <PixelText size="small" color={newBalance >= 0 ? COLORS.ink : COLORS.red} shadow={false}>
                      ${newBalance}
                    </PixelText>
                  </View>
                </View>
              </View>
            )}

            {step >= 3 && Array.isArray(topFactors) && topFactors.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.secondary }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>i</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.secondary} shadow={false}>
                    Top 3 factores del día
                  </PixelText>
                </View>
                {topFactors.map((factor, index) => (
                  <View key={`${factor.label}-${index}`} style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      {factor.label}
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={factor.amount >= 0 ? COLORS.green : COLORS.red}
                      shadow={false}
                    >
                      {factor.amount >= 0 ? '+' : ''}${Math.round(factor.amount)}
                    </PixelText>
                  </View>
                ))}
              </View>
            )}

            {step >= 3 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: dailyEvent?.tone === 'negative' ? COLORS.red : COLORS.green }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>~</PixelText>
                  </View>
                  <PixelText size="small" color={dailyEvent?.tone === 'negative' ? COLORS.red : COLORS.green} shadow={false}>
                    Evento economico del dia
                  </PixelText>
                </View>
                {dailyEvent ? (
                  <>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        {dailyEvent.title}
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.gray} shadow={false}>
                        {dailyEvent.tone === 'negative' ? 'Negativo' : 'Positivo'}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.gray} shadow={false}>
                        {dailyEvent.description}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Demanda
                      </PixelText>
                      <PixelText
                        size="tiny"
                        color={(dailyEvent.demandDelta || 0) >= 0 ? COLORS.green : COLORS.red}
                        shadow={false}
                      >
                        {(dailyEvent.demandDelta || 0) >= 0 ? '+' : ''}{dailyEvent.demandDelta || 0}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Coste diario
                      </PixelText>
                      <PixelText
                        size="tiny"
                        color={(dailyEvent.dailyCostDelta || 0) <= 0 ? COLORS.green : COLORS.red}
                        shadow={false}
                      >
                        {(dailyEvent.dailyCostDelta || 0) >= 0 ? '+' : ''}${Math.round(dailyEvent.dailyCostDelta || 0)}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Reputacion
                      </PixelText>
                      <PixelText
                        size="tiny"
                        color={(dailyEvent.reputationDelta || 0) >= 0 ? COLORS.green : COLORS.red}
                        shadow={false}
                      >
                        {(dailyEvent.reputationDelta || 0) >= 0 ? '+' : ''}{dailyEvent.reputationDelta || 0}
                      </PixelText>
                    </View>
                  </>
                ) : (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.gray} shadow={false}>
                      Sin evento economico hoy
                    </PixelText>
                  </View>
                )}
              </View>
            )}

            {step >= 3 && monthlyCharge && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.orange }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>M</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.orange} shadow={false}>
                    Cierre mensual aplicado
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    Alquiler
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.red} shadow={false}>
                    -${Math.round(monthlyCharge.rent || 0)}
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    Impuestos
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.red} shadow={false}>
                    -${Math.round(monthlyCharge.taxes || 0)}
                  </PixelText>
                </View>
                <View style={[styles.lineItem, styles.lineItemHighlight]}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    Total mensual
                  </PixelText>
                  <PixelText size="small" color={COLORS.red} shadow={false}>
                    -${Math.round(monthlyCharge.total || 0)}
                  </PixelText>
                </View>
                {postMonthlyRescue?.applied && (
                  <>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Rescate post-mes
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.green} shadow={false}>
                        +${Math.round(postMonthlyRescue.bailoutNeeded || 0)}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Nueva cuota
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.orange} shadow={false}>
                        ${Math.round(postMonthlyRescue.newInstallment || 0)} x {postMonthlyRescue.days || 0} dias
                      </PixelText>
                    </View>
                  </>
                )}
              </View>
            )}

            {step >= 3 && Array.isArray(objectives) && objectives.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.gold }]}>
                    <PixelText size="tiny" color={COLORS.ink} center shadow={false}>!</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.ink} shadow={false}>
                    Objetivos diarios
                  </PixelText>
                </View>
                {objectives.map((objective) => (
                  <View key={objective.id} style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      {objective.label}
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={objective.completed ? COLORS.green : COLORS.orange}
                      shadow={false}
                    >
                      {objective.current}/{objective.target}
                    </PixelText>
                  </View>
                ))}
              </View>
            )}

            {step >= 3 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.orange }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>$</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.orange} shadow={false}>
                    Préstamo / Rescate
                  </PixelText>
                </View>
                {(expenses.loanPayment || 0) > 0 && (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      Cuota pagada hoy
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.red} shadow={false}>
                      -${expenses.loanPayment}
                    </PixelText>
                  </View>
                )}
                {(debtTier || 'none') !== 'none' && (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      Nivel de deuda
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.orange} shadow={false}>
                      {(debtTier || 'none').toUpperCase()}
                    </PixelText>
                  </View>
                )}
                {(debtInterest || 0) > 0 && (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                      Interés de deuda
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.red} shadow={false}>
                      -${debtInterest}
                    </PixelText>
                  </View>
                )}
                {rescue?.applied ? (
                  <>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Microcrédito automático
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.green} shadow={false}>
                        +${Math.round(rescue.bailoutNeeded || 0)}
                      </PixelText>
                    </View>
                    <View style={styles.lineItem}>
                      <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                        Nueva cuota diaria
                      </PixelText>
                      <PixelText size="tiny" color={COLORS.orange} shadow={false}>
                        ${Math.round(rescue.newInstallment || 0)} x {rescue.days || 0} días
                      </PixelText>
                    </View>
                  </>
                ) : (
                  <View style={styles.lineItem}>
                    <PixelText size="tiny" color={COLORS.gray} shadow={false}>
                      Sin rescate hoy
                    </PixelText>
                  </View>
                )}
              </View>
            )}

            {step >= 3 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: COLORS.green }]}>
                    <PixelText size="tiny" color={COLORS.white} center shadow={false}>+</PixelText>
                  </View>
                  <PixelText size="small" color={COLORS.green} shadow={false}>
                    Bonus diario generado
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    Objetivos cumplidos
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    {completedObjectivesCount || 0}/3
                  </PixelText>
                </View>
                <View style={styles.lineItem}>
                  <PixelText size="tiny" color={COLORS.ink} shadow={false}>
                    Bonus pendiente añadido
                  </PixelText>
                  <PixelText size="tiny" color={COLORS.green} shadow={false}>
                    +${Math.max(0, Math.round(rewardFromPerformance || 0))}
                  </PixelText>
                </View>
              </View>
            )}

            {/* Stamp */}
            {step >= 4 && (
              <Animated.View style={[
                styles.stamp,
                {
                  transform: [{ scale: stampAnim }, { rotate: '-5deg' }],
                  borderColor: isInDebt ? COLORS.red : COLORS.green,
                  backgroundColor: isInDebt ? COLORS.red + '10' : COLORS.green + '10',
                }
              ]}>
                <PixelText size="medium" color={isInDebt ? COLORS.red : COLORS.green} center shadow={false}>
                  {isInDebt
                    ? (t('inDebt') || '⚠ IN DEBT')
                    : (t('approved') || '✓ APPROVED')
                  }
                </PixelText>
              </Animated.View>
            )}

            {/* Newspaper headline */}
            {step >= 4 && headline && (
              <View style={styles.newspaper}>
                {/* Tape strips at corners */}
                <View style={[styles.tape, styles.tapeTopLeft]} />
                <View style={[styles.tape, styles.tapeTopRight]} />
                <View style={[styles.tape, styles.tapeBottomLeft]} />
                <View style={[styles.tape, styles.tapeBottomRight]} />
                <View style={styles.newspaperHeader}>
                  <View style={styles.newspaperBorder} />
                  <PixelText size="tiny" color={COLORS.paper} shadow={false} center>
                    📰 CHIRO DAILY NEWS
                  </PixelText>
                  <View style={styles.newspaperBorder} />
                </View>
                <View style={styles.newspaperBody}>
                  <PixelText size="small" color={COLORS.ink} shadow={false} center>
                    "{t(headline.key) || 'Another day at the clinic...'}"
                  </PixelText>
                </View>
              </View>
            )}

            {/* Debt warning */}
            {step >= 4 && isInDebt && (
              <View style={styles.debtWarning}>
                <View style={styles.debtWarningInner}>
                  <PixelText size="tiny" color={COLORS.red} center shadow={false}>
                    ⚠ {t('debtWarning') || 'Pay your debts or face consequences!'}
                  </PixelText>
                </View>
              </View>
            )}

            {/* Torn bottom edge */}
            <View style={[styles.tornEdge, styles.tornEdgeBottom]}>
              {Array.from({ length: 18 }).map((_, i) => (
                <View key={`torn-b-${i}`} style={[styles.tornTooth, {
                  height: i % 2 === 0 ? 5 : 3,
                  backgroundColor: i % 3 === 0 ? COLORS.paperDark : COLORS.paper,
                }]} />
              ))}
            </View>
          </View>

          {/* Continue button */}
          {step >= 4 && (
            <View style={styles.buttonContainer}>
              <PixelButton
                title={t('continue') || 'CONTINUE'}
                icon="▶"
                variant="primary"
                color={COLORS.primary}
                onPress={onContinue}
                size="large"
              />
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  paper: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    gap: 12,
    position: 'relative',
    // Soft paper shadow
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  tornEdge: {
    position: 'absolute',
    top: -6,
    left: -3,
    right: -3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tornEdgeBottom: {
    top: undefined,
    bottom: -6,
    transform: [{ rotate: '180deg' }],
  },
  tornTooth: {
    width: 6,
  },
  letterhead: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  letterheadLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '30',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterheadLine: {
    width: '60%',
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 2,
  },
  header: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  headerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  headerLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.gold,
  },
  headerDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.ink,
    transform: [{ rotate: '45deg' }],
  },
  dayBadge: {
    backgroundColor: COLORS.deskDark,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 2,
    borderRadius: 4,
  },
  section: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 14,
    paddingVertical: 2,
  },
  lineItemHighlight: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.grayDark + '60',
    marginVertical: 4,
    marginLeft: 14,
  },
  totalSection: {
    borderTopWidth: 3,
    borderTopColor: COLORS.ink,
    paddingTop: 10,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLine: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  balanceBadge: {
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stamp: {
    alignSelf: 'center',
    borderWidth: 4,
    borderStyle: 'dashed',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  newspaper: {
    backgroundColor: COLORS.bone,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 4,
    position: 'relative',
  },
  tape: {
    position: 'absolute',
    width: 28,
    height: 10,
    backgroundColor: COLORS.primaryLight + 'a0',
    borderWidth: 0.5,
    borderColor: COLORS.primary + '60',
    zIndex: 2,
    borderRadius: 2,
  },
  tapeTopLeft: {
    top: -2,
    left: 8,
    transform: [{ rotate: '-15deg' }],
  },
  tapeTopRight: {
    top: -2,
    right: 8,
    transform: [{ rotate: '15deg' }],
  },
  tapeBottomLeft: {
    bottom: -2,
    left: 8,
    transform: [{ rotate: '15deg' }],
  },
  tapeBottomRight: {
    bottom: -2,
    right: 8,
    transform: [{ rotate: '-15deg' }],
  },
  newspaperHeader: {
    backgroundColor: COLORS.deskDark,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 2,
  },
  newspaperBorder: {
    height: 1,
    backgroundColor: COLORS.paper + '40',
  },
  newspaperBody: {
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  debtWarning: {
    backgroundColor: COLORS.red + '15',
    borderWidth: 2,
    borderColor: COLORS.red,
    padding: 2,
  },
  debtWarningInner: {
    borderWidth: 1,
    borderColor: COLORS.red + '40',
    borderStyle: 'dashed',
    padding: 8,
  },
  buttonContainer: {
    marginTop: 16,
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 20,
  },
});
