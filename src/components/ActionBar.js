import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from './PixelButton';
import PixelText from './PixelText';
import PixelCard from './PixelCard';
import Px from './Px';
import DailyMissionsWidget from './DailyMissionsWidget';
import gameState from '../utils/gameState';
import TutorialTarget from './TutorialTarget';
import soundManager from '../utils/soundManager';
import { t } from '../utils/i18n';

const TOMORROW_TEASERS = [
  'Un paciente VIP ha pedido cita para mañana...',
  'Mañana puede ser tu mejor día. ¿Estás preparado?',
  'Hay rumores de una inspección sanitaria...',
  'Tu rival ha abierto una clínica al lado. Mañana verás...',
  'Un paciente misterioso quiere verte mañana...',
  'Tu CA dice que mañana será "interesante"...',
  'Mañana viene un paciente que no para de hablar de CrossFit...',
  'Alguien dejó una reseña de 1 estrella. Mañana tocará mejorar...',
  '¿Preparado para el día más loco de tu carrera?',
  'Mañana llegan más pacientes. Esperemos que paguen...',
  'Tu fama crece. Mañana habrá cola en la puerta.',
  'Un influencer quiere grabar tu próximo ajuste...',
];

// ── Queue progress bar ───────────────────────────────────────
function QueueBar({ patients, currentPatientIndex, pulseAnim }) {
  return (
    <View style={styles.queueBar}>
      <PixelText size="tiny" color={COLORS.paper} fontFamily="ui">
        {t('patient')} {currentPatientIndex + 1} {t('of')} {patients.length}
      </PixelText>
      <View style={styles.queueDots}>
        {patients.map((_, i) => {
          const isDone = i < currentPatientIndex;
          const isCurrent = i === currentPatientIndex;
          return (
            <Animated.View
              key={i}
              style={[
                styles.queueDot,
                {
                  backgroundColor: isDone ? COLORS.green : isCurrent ? COLORS.primary : COLORS.grayDark,
                  borderColor: isCurrent ? COLORS.paper : isDone ? COLORS.green : COLORS.gray,
                },
                isCurrent && { transform: [{ scale: pulseAnim }] },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Day summary card (end of day) ────────────────────────────
function DaySummaryCard({ state, patients, displayEarnings }) {
  return (
    <PixelCard color={COLORS.deskDark} borderColor={COLORS.gold} style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>
          <Px x={0} y={0} w={6} h={16} color={COLORS.gold} />
          <Px x={8} y={0} w={6} h={12} color={COLORS.accent} />
          <Px x={16} y={0} w={6} h={8} color={COLORS.green} />
        </View>
        <PixelText size="medium" color={COLORS.primary} center fontFamily="ui">
          {t('daySummary')} {state.currentDay}
        </PixelText>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryRow}>
        <PixelText size="small" color={COLORS.paper} fontFamily="ui">{t('patientsAttended')}:</PixelText>
        <PixelText size="small" color={COLORS.green} fontFamily="mono">{patients.length}</PixelText>
      </View>
      <View style={styles.summaryRow}>
        <PixelText size="small" color={COLORS.paper} fontFamily="ui">{t('earnings')}:</PixelText>
        <PixelText size="small" color={COLORS.primary} fontFamily="mono">${displayEarnings}</PixelText>
      </View>
      <View style={styles.summaryRow}>
        <PixelText size="small" color={COLORS.paper} fontFamily="ui">{t('totalMoney')}:</PixelText>
        <PixelText size="small" color={COLORS.gold} fontFamily="mono">${state.money}</PixelText>
      </View>
      <View style={styles.summaryRow}>
        <PixelText size="small" color={COLORS.paper} fontFamily="ui">{t('reputation')}:</PixelText>
        <View style={styles.repDisplay}>
          <View style={styles.miniStar}>
            <Px x={3} y={0} w={2} h={2} color={COLORS.green} />
            <Px x={0} y={2} w={8} h={2} color={COLORS.green} />
            <Px x={1} y={4} w={6} h={2} color={COLORS.green} />
            <Px x={2} y={6} w={4} h={2} color={COLORS.green} />
          </View>
          <PixelText size="small" color={COLORS.accent} fontFamily="mono"> {state.reputation}</PixelText>
        </View>
      </View>
      <View style={styles.summaryRow}>
        <PixelText size="small" color={COLORS.paper} fontFamily="ui">{t('level')}:</PixelText>
        <PixelText size="small" color={COLORS.green} fontFamily="mono">
          Lv.{state.skillLevel} ({state.experience}xp)
        </PixelText>
      </View>

      <View style={styles.summaryDivider} />
    </PixelCard>
  );
}

// ── Main ActionBar ───────────────────────────────────────────
export default function ActionBar({
  dayStarted,
  dayEnded,
  currentPatient,
  patients,
  currentPatientIndex,
  displayEarnings,
  state,
  pulseAnim,
  pendingBookings,
  showDailyMissions,
  isWalmerTutorial,
  walmerProgressText,
  flyersDoneToday,
  onPlayFlyers,
  onBuyAdvertising,
  canBuyAdvertising,
  consultPrice,
  onDecreasePrice,
  onIncreasePrice,
  economyProfile,
  onCycleEconomyProfile,
  onApplyRecommendedPrice,
  canApplyRecommendedPrice,
  onPayLoanNow,
  canPayLoanNow,
  activeDailyEconomicEvent,
  dailyEconomicEventHistory,
  demandPreview,
  dailyCostPreview,
  estimatedIncome,
  estimatedNet,
  forecast30,
  priceGuidance,
  economyHealth,
  pendingDailyReward,
  treatmentMode,
  onClaimDailyReward,
  // Callbacks
  onStartDay,
  onNextDay,
  onOpenConsultation,
  onOpenShop,
  onOpenEvents,
  onOpenRegistry,
  onOpenBookings,
  onOpenMissions,
  onOpenPathologyBook,
  onOpenAerialView,
  onOpenAchievements,
  onOpenIntroStory,
  onSave,
  onGoToMenu,
}) {
  const staff = gameState.get('staff') || {};
  const debtTier = state?.debtTier || 'none';
  const debtTierColor =
    debtTier === 'critical'
      ? COLORS.red
      : debtTier === 'standard'
        ? COLORS.orange
        : debtTier === 'micro'
          ? COLORS.gold
          : COLORS.green;

  return (
    <View style={styles.actionBar}>
      {isWalmerTutorial && (
        <PixelCard color={COLORS.desk} borderColor={COLORS.accent} style={styles.tutorialCard}>
          <PixelText size="small" color={COLORS.accent} center fontFamily="ui">
            UNIVERSIDAD DE WALMER
          </PixelText>
          <PixelText size="tiny" color={COLORS.paper} center fontFamily="ui">
            Tutorial obligatorio - sala cerrada, solo ajustes
          </PixelText>
          <PixelText size="tiny" color={COLORS.gold} center fontFamily="mono">
            {walmerProgressText || '0/3 dias - 0/3 pacientes'}
          </PixelText>
        </PixelCard>
      )}

      {/* Queue bar (during active day) */}
      {dayStarted && !dayEnded && (
        <QueueBar
          patients={patients}
          currentPatientIndex={currentPatientIndex}
          pulseAnim={pulseAnim}
        />
      )}

      {activeDailyEconomicEvent && (
        <PixelCard
          color={COLORS.desk}
          borderColor={activeDailyEconomicEvent.tone === 'negative' ? COLORS.red : COLORS.green}
          style={styles.eventCard}
        >
          <View style={styles.summaryRow}>
            <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
              Evento del día
            </PixelText>
            <PixelText
              size="tiny"
              color={activeDailyEconomicEvent.tone === 'negative' ? COLORS.red : COLORS.green}
              fontFamily="mono"
            >
              {activeDailyEconomicEvent.tone === 'negative' ? 'NEGATIVO' : 'POSITIVO'}
            </PixelText>
          </View>
          <PixelText size="small" color={COLORS.paper} fontFamily="ui">
            {activeDailyEconomicEvent.title}
          </PixelText>
          <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
            {activeDailyEconomicEvent.description}
          </PixelText>
          <View style={styles.summaryRow}>
            <PixelText size="tiny" color={COLORS.grayLight} fontFamily="mono">
              D{activeDailyEconomicEvent.demandDelta >= 0 ? '+' : ''}{activeDailyEconomicEvent.demandDelta} | C{activeDailyEconomicEvent.dailyCostDelta >= 0 ? '+' : ''}{activeDailyEconomicEvent.dailyCostDelta} | R{activeDailyEconomicEvent.reputationDelta >= 0 ? '+' : ''}{activeDailyEconomicEvent.reputationDelta}
            </PixelText>
          </View>
        </PixelCard>
      )}

      {!dayStarted && !dayEnded && Array.isArray(dailyEconomicEventHistory) && dailyEconomicEventHistory.length > 0 && (
        <PixelCard
          color={COLORS.desk}
          borderColor={COLORS.secondary}
          style={styles.eventCard}
        >
          <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
            Historial econ (ultimos 3)
          </PixelText>
          {dailyEconomicEventHistory
            .slice(-3)
            .reverse()
            .map((eventItem, idx) => (
              <View key={`${eventItem.id}-${eventItem.day}-${idx}`} style={styles.summaryRow}>
                <PixelText size="tiny" color={COLORS.paper} fontFamily="ui">
                  D{eventItem.day}: {eventItem.title}
                </PixelText>
                <PixelText
                  size="tiny"
                  color={eventItem.tone === 'negative' ? COLORS.red : COLORS.green}
                  fontFamily="mono"
                >
                  {eventItem.tone === 'negative' ? '-' : '+'}
                </PixelText>
              </View>
            ))}
        </PixelCard>
      )}

      {/* Daily missions (pre-day, compact) */}
      {!dayStarted && !dayEnded && !isWalmerTutorial && (
        <DailyMissionsWidget compact />
      )}

      {showDailyMissions && !dayStarted && !isWalmerTutorial && (
        <View style={styles.dailyMissionsContainer}>
          <DailyMissionsWidget />
          <PixelButton
            title="Cerrar"
            variant="secondary"
            onPress={onOpenMissions}
            small
          />
        </View>
      )}

      {/* Action buttons area */}
      <View style={styles.actionsArea}>
        {/* PRE-DAY actions */}
        {!dayStarted && !dayEnded && (
          <>
            <TutorialTarget id="openClinicBtn">
              <PixelButton
                title={t('openClinic')}
                icon="+"
                variant="primary"
                onPress={onStartDay}
                style={styles.mainBtn}
              />
            </TutorialTarget>
            {!isWalmerTutorial && (
              <>
                <View style={styles.consultPriceRow}>
                  <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                    Precio consulta
                  </PixelText>
                  <View style={styles.consultPricePill}>
                    <PixelText size="small" color={COLORS.gold} fontFamily="mono">
                      ${consultPrice || 100}
                    </PixelText>
                  </View>
                </View>
                <View style={styles.consultPriceRow}>
                  <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                    Perfil economía
                  </PixelText>
                  <PixelButton
                    title={(economyProfile || 'normal').toUpperCase()}
                    icon="~"
                    variant="secondary"
                    onPress={onCycleEconomyProfile}
                    small
                    style={styles.profileButton}
                  />
                </View>
                <View style={styles.consultPriceRow}>
                  <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                    Tier deuda
                  </PixelText>
                  <View style={[styles.consultPricePill, { borderColor: `${debtTierColor}88` }]}>
                    <PixelText size="small" color={debtTierColor} fontFamily="mono">
                      {debtTier.toUpperCase()}
                    </PixelText>
                  </View>
                </View>
                <View style={styles.economyPreviewCard}>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Demanda prevista
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.primary} fontFamily="mono">
                      {demandPreview?.demand ?? '-'} pacientes
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Fórmula
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.paper} fontFamily="mono">
                      {`B${demandPreview?.baseByDay ?? 0}+R${demandPreview?.repInfluence ?? 0}+M${demandPreview?.marketing ?? 0}-P${demandPreview?.overpricingPenalty ?? 0}-D${demandPreview?.debtDemandPenalty ?? 0}+F${demandPreview?.profileDemandModifier ?? 0}+E${demandPreview?.temporaryDemandModifier ?? 0}`}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Ingreso estimado
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.green} fontFamily="mono">
                      +${estimatedIncome ?? 0}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Coste estimado
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.red} fontFamily="mono">
                      -${dailyCostPreview?.total ?? 0}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Neto estimado
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={(estimatedNet ?? 0) >= 0 ? COLORS.green : COLORS.red}
                      fontFamily="mono"
                    >
                      {(estimatedNet ?? 0) >= 0 ? '+' : ''}${estimatedNet ?? 0}
                    </PixelText>
                  </View>
                </View>
                <View style={[styles.economyPreviewCard, styles.forecastCard]}>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Simulación 30 días
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={(forecast30?.projectedBalance ?? 0) >= 0 ? COLORS.green : COLORS.red}
                      fontFamily="mono"
                    >
                      {(forecast30?.projectedBalance ?? 0) >= 0 ? '+' : ''}${forecast30?.projectedBalance ?? 0}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Neto medio diario
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={(forecast30?.averageDailyNet ?? 0) >= 0 ? COLORS.green : COLORS.red}
                      fontFamily="mono"
                    >
                      {(forecast30?.averageDailyNet ?? 0) >= 0 ? '+' : ''}${forecast30?.averageDailyNet ?? 0}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Riesgo rescate
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={
                        forecast30?.rescueRisk === 'alto'
                          ? COLORS.red
                          : forecast30?.rescueRisk === 'medio'
                            ? COLORS.orange
                            : COLORS.green
                      }
                      fontFamily="mono"
                    >
                      {(forecast30?.rescueRisk || 'bajo').toUpperCase()} ({forecast30?.rescueCount || 0})
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Precio recomendado
                    </PixelText>
                    <PixelText size="tiny" color={COLORS.gold} fontFamily="mono">
                      ${priceGuidance?.recommendedPrice ?? (consultPrice || 100)}
                    </PixelText>
                  </View>
                  <View style={styles.summaryRow}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      Estado economía
                    </PixelText>
                    <PixelText
                      size="tiny"
                      color={
                        economyHealth?.level === 'critical'
                          ? COLORS.red
                          : economyHealth?.level === 'watch'
                            ? COLORS.orange
                            : COLORS.green
                      }
                      fontFamily="mono"
                    >
                      {(economyHealth?.level || 'safe').toUpperCase()}
                    </PixelText>
                  </View>
                </View>
                {economyHealth?.hint && (
                  <View style={styles.economyHintBox}>
                    <PixelText size="tiny" color={COLORS.grayLight} fontFamily="ui">
                      {economyHealth.hint}
                    </PixelText>
                  </View>
                )}
                <PixelButton
                  title="Aplicar recomendado"
                  icon="*"
                  color={COLORS.gold}
                  onPress={onApplyRecommendedPrice}
                  small
                  style={styles.recommendedPriceButton}
                  disabled={!canApplyRecommendedPrice}
                />
                {(state.loanPrincipal || 0) > 0 && (
                  <PixelButton
                    title={`Pagar cuota $${Math.round(state.loanInstallment || 0)}`}
                    icon="$"
                    color={COLORS.orange}
                    onPress={onPayLoanNow}
                    small
                    style={styles.loanPayButton}
                    disabled={!canPayLoanNow}
                  />
                )}
                <View style={styles.actionRow}>
                  <PixelButton
                    title="- Precio"
                    icon="-"
                    variant="secondary"
                    onPress={onDecreasePrice}
                    small
                    style={styles.halfButton}
                  />
                  <PixelButton
                    title="+ Precio"
                    icon="+"
                    variant="secondary"
                    onPress={onIncreasePrice}
                    small
                    style={styles.halfButton}
                  />
                </View>
                <View style={styles.actionRow}>
                  <PixelButton
                    title="Flyers"
                    icon="F"
                    variant="secondary"
                    onPress={onPlayFlyers}
                    small
                    style={styles.halfButton}
                    disabled={!!flyersDoneToday}
                  />
                  <PixelButton
                    title="Publicidad"
                    icon="$"
                    variant="secondary"
                    onPress={onBuyAdvertising}
                    small
                    style={styles.halfButton}
                    disabled={!canBuyAdvertising}
                  />
                </View>
                <View style={styles.actionRow}>
                  <PixelButton
                    title={`Bonus $${pendingDailyReward || 0}`}
                    icon="*"
                    color={COLORS.green}
                    onPress={onClaimDailyReward}
                    small
                    style={styles.halfButton}
                    disabled={!pendingDailyReward}
                  />
                  <PixelButton
                    title={t('shop')}
                    icon="$"
                    variant="secondary"
                    onPress={onOpenShop}
                    small
                    style={styles.halfButton}
                  />
                </View>
                <View style={styles.actionRow}>
                  <PixelButton
                    title="Misiones"
                    icon="!"
                    variant="secondary"
                    onPress={onOpenMissions}
                    small
                    style={styles.halfButton}
                  />
                  <PixelButton
                    title={t('events')}
                    icon="!"
                    color={COLORS.orange}
                    onPress={onOpenEvents}
                    small
                    style={styles.halfButton}
                  />
                </View>
                <View style={styles.actionRow}>
                  <PixelButton
                    title={t('registry')}
                    icon="#"
                    color={COLORS.accent}
                    onPress={onOpenRegistry}
                    small
                    style={styles.halfButton}
                  />
                </View>
                <View style={styles.actionRow}>
                  <PixelButton
                    title={t('manual')}
                    icon="?"
                    color={COLORS.bgMedium}
                    onPress={onOpenPathologyBook}
                    small
                    style={styles.halfButton}
                  />
                  {pendingBookings.length > 0 && !staff.appointmentAssistant && (
                    <PixelButton
                      title={t('bookings')}
                      icon="#"
                      color={COLORS.accent}
                      onPress={onOpenBookings}
                      small
                      style={styles.halfButton}
                    />
                  )}
                  {staff.unlockAerialView && (
                    <PixelButton
                      title={t('aerialView')}
                      icon="^"
                      color={COLORS.primary}
                      onPress={onOpenAerialView}
                      small
                      style={styles.halfButton}
                    />
                  )}
                  <PixelButton
                    title={t('achievements')}
                    icon="T"
                    color={COLORS.gold}
                    onPress={onOpenAchievements}
                    small
                    style={styles.halfButton}
                  />
                </View>
              </>
            )}
          </>
        )}

        {/* DURING-DAY actions */}
        {dayStarted && !dayEnded && pendingBookings.length > 0 && !staff.appointmentAssistant && (
          <PixelButton
            title={`${t('bookings')} (${pendingBookings.length})`}
            icon="#"
            variant="secondary"
            onPress={onOpenBookings}
          />
        )}

        {dayStarted && !dayEnded && currentPatient && (
          <PixelButton
            title={
              treatmentMode === 'auto'
                ? 'Atender automático'
                : treatmentMode === 'hybrid'
                  ? 'Atender (híbrido)'
                  : t('soapReport')
            }
            icon="+"
            variant="primary"
            onPress={onOpenConsultation}
            style={styles.mainBtn}
          />
        )}

        {/* END-OF-DAY actions */}
        {dayEnded && (
          <>
            <DaySummaryCard
              state={state}
              patients={patients}
              displayEarnings={displayEarnings}
            />

            {/* Tomorrow teaser — "one more day" hook */}
            <View style={styles.teaserCard}>
              <PixelText size="tiny" color={COLORS.primary} style={styles.teaserEmoji}>
                🔮
              </PixelText>
              <PixelText size="tiny" color={COLORS.grayLight} center style={styles.teaserItalic}>
                {TOMORROW_TEASERS[Math.floor(Math.random() * TOMORROW_TEASERS.length)]}
              </PixelText>
            </View>

            <PixelButton
              title={t('nextDay')}
              icon=">"
              variant="primary"
              onPress={onNextDay}
              style={styles.mainBtn}
            />
            <View style={styles.actionRow}>
              <PixelButton
                title={t('shop')}
                icon="$"
                variant="secondary"
                onPress={onOpenShop}
                small
                style={styles.halfButton}
              />
              <PixelButton
                title={t('save')}
                icon="*"
                color={COLORS.bgMedium}
                onPress={onSave}
                small
                style={styles.halfButton}
              />
            </View>
          </>
        )}
      </View>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <PixelButton
          title={t('menu')}
          variant="danger"
          onPress={onGoToMenu}
          small
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    backgroundColor: COLORS.deskDark,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  tutorialCard: {
    borderRadius: 8,
  },
  eventCard: {
    borderRadius: 8,
  },
  actionsArea: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
  mainBtn: {
    transform: [{ rotate: '-0.5deg' }],
  },

  // Queue bar
  queueBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.desk,
    borderRadius: 6,
    marginBottom: 4,
  },
  queueDots: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  queueDot: {
    width: 10,
    height: 10,
    borderWidth: 2,
    borderRadius: 5,
  },

  // Summary card
  summaryCard: {
    borderRadius: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  summaryIcon: {
    width: 26,
    height: 18,
    position: 'relative',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.gold + '44',
    marginVertical: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '22',
  },
  repDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStar: {
    width: 10,
    height: 10,
    position: 'relative',
  },

  // Bottom nav
  bottomNav: {
    marginTop: 4,
    alignItems: 'center',
  },

  // Daily missions
  dailyMissionsContainer: {
    marginBottom: 6,
    gap: 8,
  },
  consultPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  consultPricePill: {
    backgroundColor: COLORS.desk,
    borderWidth: 1,
    borderColor: COLORS.gold + '88',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  profileButton: {
    minWidth: 120,
  },
  economyPreviewCard: {
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border + '88',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  forecastCard: {
    borderColor: COLORS.secondary + '66',
  },
  economyHintBox: {
    backgroundColor: COLORS.desk + 'BB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border + '55',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 4,
  },
  recommendedPriceButton: {
    marginTop: 4,
  },
  loanPayButton: {
    marginTop: 4,
  },
  teaserCard: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  teaserEmoji: {
    marginBottom: 4,
  },
  teaserItalic: {
    fontStyle: 'italic',
  },
});
