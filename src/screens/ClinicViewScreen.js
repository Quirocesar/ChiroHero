import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, ScrollView, Pressable } from 'react-native';
import { COLORS } from '../utils/theme';
import BookingsModal from '../components/BookingsModal';
import AchievementNotification from '../components/AchievementNotification';
import ParticleSystem from '../components/ParticleSystem';
import DailyMissionsWidget from '../components/DailyMissionsWidget';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';
import { generatePatient, generatePremiumPatient } from '../data/patients';
import { getCADialogue, generateBookings } from '../data/staff';
import { t } from '../utils/i18n';
import HealthInspectionModal from '../components/HealthInspectionModal';
import AppointmentRegistry from '../components/AppointmentRegistry';
import EndOfDayReport from '../components/EndOfDayReport';
import { checkAchievements, unlockAchievement } from '../data/achievements';
import {
  getReputationTitle,
  getCurrentRank,
  getSeasonNumber,
  getStreakBonus,
  SEASON_LENGTH_DAYS,
} from '../utils/gameState';
import telemetry from '../utils/telemetry';
import TELEMETRY_EVENTS from '../utils/telemetryEvents';
import useClinicEconomyPreview from '../hooks/useClinicEconomyPreview';
import {
  buildDailyObjectives,
  calculatePerformanceReward,
  buildDailyMemorableMoments,
} from '../engines/dailyRunEngine';
import { resolveMonthlyCloseIfNeeded } from '../engines/dayCloseEngine';

// Sub-components
import ClinicHud from '../components/ClinicHud';
import PatientZone from '../components/PatientZone';
import DeskWorkspace from '../components/DeskWorkspace';
import ActionBar from '../components/ActionBar';
// Walmer tutorial + growth systems (Sprint extension)

const { width } = Dimensions.get('window');

// FloatingMoneyParticles (kept in orchestrator - manages ParticleSystem)
function FloatingMoneyParticles({ active, amount }) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (active && amount > 0) {
      setShowParticles(true);
    }
  }, [active, amount]);

  return (
    <ParticleSystem
      type="money"
      active={showParticles}
      centerX={width / 2}
      onComplete={() => setShowParticles(false)}
    />
  );
}

// Time of day helper
function getTimeOfDay(gameHour) {
  if (gameHour >= 6 && gameHour < 9) return 'dawn';
  if (gameHour >= 9 && gameHour < 18) return 'day';
  if (gameHour >= 18 && gameHour < 21) return 'sunset';
  return 'night';
}

// -------------------------------------------------------------------
// ClinicViewScreen - Orchestrator
// All state + logic lives here; sub-components are presentational.
// -------------------------------------------------------------------
export default function ClinicViewScreen({ navigation, route }) {
  // State
  const [state, setState] = useState(gameState.state);
  const [patients, setPatients] = useState([]);
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  const [dayStarted, setDayStarted] = useState(false);
  const [dayEnded, setDayEnded] = useState(false);
  const [dayEarnings, setDayEarnings] = useState(0);
  const [walkAnim] = useState(new Animated.Value(-100));
  const [caMessage, setCaMessage] = useState(null);
  const [animatedEarnings] = useState(new Animated.Value(0));
  const [moneyParticlesActive, setMoneyParticlesActive] = useState(false);
  const [previousEarnings, setPreviousEarnings] = useState(0);

  const [sunAnim] = useState(new Animated.Value(0));
  const [moonAnim] = useState(new Animated.Value(0));
  const [clockAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [starAnim] = useState(new Animated.Value(0));

  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showInspection, setShowInspection] = useState(false);
  const [displayEarnings, setDisplayEarnings] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [showDailyMissions, setShowDailyMissions] = useState(false);
  const [showRegistry, setShowRegistry] = useState(false);
  const [showEndOfDayReport, setShowEndOfDayReport] = useState(false);
  const [dayReport, setDayReport] = useState(null);
  const [dayTimeRemaining, setDayTimeRemaining] = useState(0);
  const dayTimerRef = useRef(null);
  const flyerTimerRef = useRef(null);
  const startDayLockRef = useRef(false);
  const endDayLockRef = useRef(false);
  const [reputationInfo, setReputationInfo] = useState({
    title: 'Aprendiz',
    rank: { rank: 'Bronze' },
    level: 1,
    progress: 0,
  });
  const [streakInfo, setStreakInfo] = useState({ streak: 0, moneyBonus: 0 });
  const [seasonInfo, setSeasonInfo] = useState({ currentSeason: 1, seasonDay: 1 });
  const [tutorialAdjustedToday, setTutorialAdjustedToday] = useState(0);
  const [showRoomChoice, setShowRoomChoice] = useState(false);
  const [showFlyerMinigame, setShowFlyerMinigame] = useState(false);
  const [flyerTaps, setFlyerTaps] = useState(0);
  const [flyerTimeLeft, setFlyerTimeLeft] = useState(0);
  const [showMonthlyChargeModal, setShowMonthlyChargeModal] = useState(false);
  const [monthlyChargeInfo, setMonthlyChargeInfo] = useState(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [negotiationPatient, setNegotiationPatient] = useState(null);
  const [dayMetrics, setDayMetrics] = useState({
    treated: 0,
    good: 0,
    regular: 0,
    bad: 0,
    qualityTotal: 0,
  });

  const upgrades = gameState.get('upgrades') || {};
  const clinicUpgrades = gameState.get('clinicUpgrades') || {
    decoration: 1,
    waitingRoom: 1,
    lighting: 1,
  };

  const [timeOfDay, setTimeOfDay] = useState('day');
  const [patientExpression, setPatientExpression] = useState('worried');
  const isWalmerTutorial = !state.hasGraduatedWalmer;

  const treatmentMode = state.treatmentMode || 'auto';
  const {
    economyProfile,
    demandPreview,
    predictedPatients,
    dailyCostPreview,
    estimatedIncome,
    estimatedNet,
    economyHealth,
    forecast30,
    priceGuidance,
  } = useClinicEconomyPreview(state, isWalmerTutorial);

  // Effects

  useEffect(() => {
    if (pendingAchievements.length > 0 && !showAchievement) {
      const nextAch = pendingAchievements[0];
      setShowAchievement(true);
      setCurrentAchievement(nextAch);
    }
  }, [pendingAchievements, showAchievement]);

  useEffect(() => {
    const hour = (gameState.get('currentDay') * 8) % 24;
    setTimeOfDay(getTimeOfDay(hour));

    const repInfo = gameState.getReputationInfo();
    setReputationInfo(repInfo);

    const streak = gameState.getStreakInfo();
    setStreakInfo(streak);

    const season = gameState.getSeasonInfo();
    setSeasonInfo(season);
  }, [state.currentDay, state.reputation, state.clinicLevel]);

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(sunAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(sunAnim, { toValue: 8, duration: 1500, useNativeDriver: true }),
      ])
    );
    float.start();
    return () => float.stop();
  }, [sunAnim]);

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(moonAnim, { toValue: -6, duration: 2000, useNativeDriver: true }),
        Animated.timing(moonAnim, { toValue: 6, duration: 2000, useNativeDriver: true }),
      ])
    );
    float.start();
    return () => float.stop();
  }, [moonAnim]);

  useEffect(() => {
    const tick = Animated.loop(
      Animated.sequence([
        Animated.timing(clockAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(clockAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    tick.start();
    return () => tick.stop();
  }, [clockAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(starAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, [starAnim]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const result = route.params?.result;
      const patientId = route.params?.patientId;
      if (result && patientId) {
        handlePatientComplete(result);
        navigation.setParams({ result: undefined, patientId: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params, patients, currentPatientIndex]);

  useEffect(() => {
    const unsub = gameState.subscribe(setState);
    soundManager.init();
    soundManager.playGameMusic();

    const streakResult = gameState.checkAndUpdateStreak();
    if (streakResult.updated) {
      soundManager.playSuccess();
    }

    return () => {
      unsub();
      soundManager.stopMusic();
    };
  }, []);

  useEffect(() => {
    if (dayEnded && dayEarnings > 0) {
      let count = 0;
      const step = Math.max(1, Math.floor(dayEarnings / 30));
      const timer = setInterval(() => {
        count += step;
        if (count >= dayEarnings) {
          count = dayEarnings;
          clearInterval(timer);
        }
        setDisplayEarnings(count);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [dayEnded, dayEarnings]);

  useEffect(() => {
    if (!showFlyerMinigame) {
      return undefined;
    }

    if (flyerTimerRef.current) {
      clearInterval(flyerTimerRef.current);
    }

    flyerTimerRef.current = setInterval(() => {
      setFlyerTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(flyerTimerRef.current);
          flyerTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (flyerTimerRef.current) {
        clearInterval(flyerTimerRef.current);
        flyerTimerRef.current = null;
      }
    };
  }, [showFlyerMinigame]);

  // Callbacks

  const animatePatientEntry = useCallback(() => {
    walkAnim.setValue(-100);
    Animated.timing(walkAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [walkAnim]);

  const getTargetPatientsForDay = useCallback(() => {
    if (isWalmerTutorial) {
      return 1;
    }
    return gameState.computeDailyDemand().demand;
  }, [isWalmerTutorial]);

  const finishFlyerMinigame = useCallback(() => {
    const gainedReach = Math.max(1, Math.floor(flyerTaps / 3));
    gameState.set({
      flyerReach: (gameState.get('flyerReach') || 0) + gainedReach,
      flyersDoneToday: true,
    });
    setShowFlyerMinigame(false);
    setCaMessage(`Flyers repartidos: +${gainedReach} alcance`);
    setTimeout(() => setCaMessage(null), 2200);
    soundManager.playSuccess();
  }, [flyerTaps]);

  useEffect(() => {
    if (showFlyerMinigame && flyerTimeLeft === 0) {
      finishFlyerMinigame();
    }
  }, [showFlyerMinigame, flyerTimeLeft, finishFlyerMinigame]);

  const startFlyerMinigame = useCallback(() => {
    if (dayStarted || dayEnded || gameState.get('flyersDoneToday')) {
      return;
    }
    setFlyerTaps(0);
    setFlyerTimeLeft(8);
    setShowFlyerMinigame(true);
    soundManager.playClick();
  }, [dayStarted, dayEnded]);

  const handleFlyerTap = useCallback(() => {
    if (!showFlyerMinigame || flyerTimeLeft <= 0) {
      return;
    }
    setFlyerTaps((prev) => prev + 1);
    soundManager.playClick();
  }, [showFlyerMinigame, flyerTimeLeft]);

  const buyAdvertising = useCallback(() => {
    const cost = 1200;
    if (dayStarted || dayEnded) {
      return;
    }

    if (!gameState.canAfford(cost)) {
      setCaMessage('No hay dinero para publicidad (coste 1200).');
      setTimeout(() => setCaMessage(null), 2000);
      soundManager.playError();
      return;
    }

    gameState.spendMoney(cost);
    gameState.set({
      paidAdvertisingLevel: (gameState.get('paidAdvertisingLevel') || 0) + 1,
    });
    soundManager.playMoney();
    setCaMessage('Publicidad contratada: +1 pacientes potenciales por dia.');
    setTimeout(() => setCaMessage(null), 2400);
  }, [dayStarted, dayEnded]);

  const claimDailyReward = useCallback(() => {
    if (dayStarted || dayEnded) return;
    const claimed = gameState.claimDailyReward();
    if (claimed <= 0) {
      setCaMessage('No hay bonus pendiente por reclamar.');
      setTimeout(() => setCaMessage(null), 1800);
      return;
    }
    soundManager.playMoney();
    setCaMessage(`Bonus diario reclamado: +$${claimed}`);
    setTimeout(() => setCaMessage(null), 2200);
  }, [dayStarted, dayEnded]);

  const payLoanNow = useCallback(() => {
    if (dayStarted || dayEnded || isWalmerTutorial) return;
    const principal = gameState.get('loanPrincipal') || 0;
    const installment = gameState.get('loanInstallment') || 0;
    if (principal <= 0 || installment <= 0) {
      setCaMessage('No hay deuda activa para pagar.');
      setTimeout(() => setCaMessage(null), 1800);
      return;
    }

    const result = gameState.payLoanEarly(installment);
    if (!result.success) {
      if (result.reason === 'insufficient_cash') {
        setCaMessage('No tienes caja suficiente para pagar la cuota.');
      } else {
        setCaMessage('No se pudo procesar el pago.');
      }
      setTimeout(() => setCaMessage(null), 1800);
      soundManager.playError();
      return;
    }

    setCaMessage(
      `Cuota pagada: $${result.paid}. Principal restante: $${result.remainingPrincipal}.`
    );
    setTimeout(() => setCaMessage(null), 2200);
    soundManager.playMoney();
  }, [dayStarted, dayEnded, isWalmerTutorial]);

  const adjustConsultPrice = useCallback(
    (delta) => {
      if (dayStarted || dayEnded || isWalmerTutorial) {
        return;
      }
      const next = gameState.adjustConsultPrice(delta);
      const demand = gameState.computeDailyDemand({
        consultPrice: next,
        economyProfile: gameState.get('economyProfile') || 'normal',
      });
      setCaMessage(`Precio consulta: $${next} | Pacientes previstos: ${demand.demand}`);
      setTimeout(() => setCaMessage(null), 2200);
      soundManager.playClick();
    },
    [dayStarted, dayEnded, isWalmerTutorial]
  );

  const cycleEconomyProfile = useCallback(() => {
    if (dayStarted || dayEnded || isWalmerTutorial) {
      return;
    }
    const order = ['casual', 'normal', 'hardcore'];
    const current = gameState.get('economyProfile') || 'normal';
    const index = order.indexOf(current);
    const next = order[(index + 1) % order.length];
    gameState.setEconomyProfile(next);

    const cfg = gameState.getEconomyProfileConfig(next);
    const demand = gameState.computeDailyDemand({
      economyProfile: next,
      consultPrice: gameState.get('consultPrice') || 100,
    });
    setCaMessage(`Economia: ${cfg.label} | Demanda prevista: ${demand.demand}`);
    setTimeout(() => setCaMessage(null), 2200);
    soundManager.playClick();
  }, [dayStarted, dayEnded, isWalmerTutorial]);

  const applyRecommendedPrice = useCallback(() => {
    if (dayStarted || dayEnded || isWalmerTutorial) {
      return;
    }
    const current = state.consultPrice || 100;
    const target = priceGuidance?.recommendedPrice || current;
    if (target === current) {
      setCaMessage(`Precio ya optimizado en $${current}.`);
      setTimeout(() => setCaMessage(null), 1800);
      return;
    }
    const next = gameState.adjustConsultPrice(target - current);
    const demand = gameState.computeDailyDemand({
      consultPrice: next,
      economyProfile: gameState.get('economyProfile') || 'normal',
    });
    setCaMessage(`Aplicado precio recomendado: $${next} | Demanda: ${demand.demand}`);
    setTimeout(() => setCaMessage(null), 2200);
    soundManager.playSuccess();
  }, [dayStarted, dayEnded, isWalmerTutorial, state.consultPrice, priceGuidance]);

  const selectClinicMode = useCallback((mode) => {
    gameState.set({ clinicMode: mode });
    setShowRoomChoice(false);
    gameState.save();
    setCaMessage(
      mode === 'open'
        ? 'Sala abierta seleccionada: ritmo rapido con ajustes directos.'
        : 'Sala cerrada seleccionada: consulta completa 1 a 1.'
    );
    setTimeout(() => setCaMessage(null), 2600);
  }, []);

  const startDay = useCallback(() => {
    if (startDayLockRef.current || dayStarted) {
      return;
    }
    startDayLockRef.current = true;
    endDayLockRef.current = false;

    const newPatients = [];
    setTutorialAdjustedToday(0);
    setDayMetrics({ treated: 0, good: 0, regular: 0, bad: 0, qualityTotal: 0 });

    let appliedEconomicEvent = null;
    if (!isWalmerTutorial) {
      gameState.clearDailyEconomicEvent();
      const rolledEvent = gameState.generateDailyEconomicEvent({
        economyProfile: gameState.get('economyProfile') || 'normal',
      });
      if (rolledEvent) {
        appliedEconomicEvent = gameState.applyDailyEconomicEvent(rolledEvent);
      }
    }

    const maxPatients = getTargetPatientsForDay();
    telemetry.logEvent(TELEMETRY_EVENTS.DAY_START, {
      day: gameState.get('currentDay') || 1,
      profile: gameState.get('economyProfile') || 'normal',
      treatmentMode: gameState.get('treatmentMode') || 'auto',
      demandTarget: maxPatients,
      activeEvent: appliedEconomicEvent?.id || null,
    });

    if (!isWalmerTutorial) {
      // Add returning patients first (Papers Please style)
      const returningToday = gameState.getReturningPatientsForToday();
      returningToday.forEach((rp) => {
        const patientData = generatePatient(
          gameState.get('skillLevel'),
          gameState.get('currentDay'),
          gameState.get('reputation'),
          gameState.get('consultPrice') || 100
        );
        patientData.fullName = rp.name;
        patientData.isReturning = true;
        newPatients.push(patientData);
      });

      const premiumChance = gameState.get('reputation') / 500;
      if (Math.random() < premiumChance && gameState.get('premiumPatientsServed') < 50) {
        const premium = generatePremiumPatient(gameState.get('reputation'));
        if (premium) newPatients.push(premium);
      }
    }

    while (newPatients.length < maxPatients) {
      newPatients.push(
        generatePatient(
          gameState.get('skillLevel'),
          gameState.get('currentDay'),
          gameState.get('reputation'),
          gameState.get('consultPrice') || 100
        )
      );
    }

    setPatients(newPatients);
    setCurrentPatientIndex(0);
    setDayStarted(true);
    setDayEnded(false);
    setDayEarnings(0);
    setDisplayEarnings(0);
    setShowEndOfDayReport(false);
    setDayReport(null);
    setPatientExpression('worried');
    soundManager.playPatientEnter();

    // Start day timer
    const dayDuration = isWalmerTutorial ? 120 : 240;
    setDayTimeRemaining(dayDuration);
    if (dayTimerRef.current) clearInterval(dayTimerRef.current);
    dayTimerRef.current = setInterval(() => {
      setDayTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(dayTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Reset daily citations
    gameState.set({ citationsToday: 0, dayEarnings: 0 });

    animatePatientEntry();

    if (isWalmerTutorial) {
      setCaMessage(`Walmer Tutorial: Dia ${state.walmerDaysCompleted + 1}/3. Ajusta 1 paciente.`);
      setTimeout(() => setCaMessage(null), 2600);
    } else if (gameState.hasCA()) {
      soundManager.playCASpeak();
      setCaMessage(t(getCADialogue('greetings'), { n: maxPatients }));
      setTimeout(() => setCaMessage(null), 3000);
    }

    if (appliedEconomicEvent) {
      setTimeout(
        () => {
          const signDemand = appliedEconomicEvent.demandDelta > 0 ? '+' : '';
          const signCost = appliedEconomicEvent.dailyCostDelta > 0 ? '+' : '';
          const signRep = appliedEconomicEvent.reputationDelta > 0 ? '+' : '';
          const effects = [
            appliedEconomicEvent.demandDelta !== 0
              ? `Demanda ${signDemand}${appliedEconomicEvent.demandDelta}`
              : null,
            appliedEconomicEvent.dailyCostDelta !== 0
              ? `Coste ${signCost}${appliedEconomicEvent.dailyCostDelta}`
              : null,
            appliedEconomicEvent.reputationDelta !== 0
              ? `Rep ${signRep}${appliedEconomicEvent.reputationDelta}`
              : null,
          ]
            .filter(Boolean)
            .join(' | ');
          setCaMessage(
            `Evento: ${appliedEconomicEvent.title}. ${effects || appliedEconomicEvent.description}`
          );
          setTimeout(() => setCaMessage(null), 3200);
          if (appliedEconomicEvent.tone === 'negative') soundManager.playError();
          else soundManager.playSuccess();
        },
        gameState.hasCA() ? 1200 : 300
      );
    }

    const staffState = gameState.get('staff');
    if (!isWalmerTutorial && (staffState.whatsappManager || staffState.appointmentAssistant)) {
      const generated = generateBookings(maxPatients, gameState.get('currentDay'));
      setPendingBookings(generated);

      if (staffState.appointmentAssistant) {
        setPatients([
          ...newPatients,
          ...generated
            .filter((b) => b.confirmed)
            .map((b) => ({
              ...(function () {
                const generatedPatient = generatePatient(
                  gameState.get('skillLevel'),
                  gameState.get('currentDay'),
                  gameState.get('reputation'),
                  gameState.get('consultPrice') || 100
                );
                return {
                  ...generatedPatient,
                  id: b.id,
                  fullName: b.name,
                  firstName: b.name,
                  lastName: '',
                  isReturning: b.isReturning,
                };
              })(),
            })),
        ]);
        setPendingBookings([]);
      }
    }
    startDayLockRef.current = false;
  }, [animatePatientEntry, getTargetPatientsForDay, isWalmerTutorial, state.walmerDaysCompleted]);

  const handlePatientComplete = useCallback(
    (result, payload = null) => {
      const patient = patients[currentPatientIndex];
      const resolvedPayload = payload || {};
      const hasPayloadRep = typeof resolvedPayload.rep === 'number';
      const hasPayloadEarnings = typeof resolvedPayload.earnings === 'number';
      let earnings = 0;

      const streakInfo = gameState.getStreakInfo();
      const repInfo = gameState.getReputationInfo();
      const socialRepMultiplier = patient?.repMultiplier ?? patient?.socialRepMultiplier ?? 1;
      const socialClass = patient?.socialClass || 'middle';
      const hasQualityScore = typeof resolvedPayload.qualityScore === 'number';
      const fallbackTierFromResult =
        result === 'wrong_treat' || result === 'wrong_refer'
          ? 'Bad'
          : result === 'referred'
            ? 'Good'
            : 'Regular';
      const qualityTier =
        resolvedPayload.qualityTier ||
        (hasQualityScore
          ? resolvedPayload.qualityScore >= 72
            ? 'Good'
            : resolvedPayload.qualityScore >= 40
              ? 'Regular'
              : 'Bad'
          : fallbackTierFromResult);
      const qualityScore = hasQualityScore
        ? resolvedPayload.qualityScore
        : qualityTier === 'Good'
          ? 82
          : qualityTier === 'Regular'
            ? 58
            : 28;

      if (result === 'treated') {
        earnings = resolvedPayload.earnings ?? route.params?.earnings ?? patient.payment;
        const xp = resolvedPayload.xp ?? route.params?.xp ?? (patient.condition.xpReward || 20);
        let rep = resolvedPayload.rep ?? route.params?.rep ?? (patient.isPremium ? 10 : 2);

        if (!hasPayloadEarnings && patient.discountApplied) {
          earnings = Math.round(earnings * 0.6);
          rep += 2; // helping patients with limited resources gives goodwill
        }

        if (!hasPayloadEarnings && streakInfo.moneyBonus > 0) {
          earnings = Math.round(earnings * (1 + streakInfo.moneyBonus));
        }

        if (!hasPayloadEarnings && repInfo.rank.tipBonus > 0) {
          earnings = Math.round(earnings * (1 + repInfo.rank.tipBonus));
        }

        if (!hasPayloadEarnings && socialClass === 'rich' && gameState.get('dailyMistakes') === 0) {
          earnings = Math.round(earnings * 1.1);
        }

        // Conflictive patients may leave without paying
        if (patient.noPayRisk > 0 && Math.random() < patient.noPayRisk) {
          earnings = 0;
          setCaMessage(`${patient.fullName} se fue sin pagar.`);
          setTimeout(() => setCaMessage(null), 2200);
        }

        gameState.earnMoney(earnings);
        gameState.addExperience(xp);

        let finalRep = rep;
        if (patient.isInfluencer) {
          finalRep = gameState.get('dailyMistakes') === 0 ? 30 : -20;
        }

        if (!hasPayloadRep && streakInfo.repBonus > 0) {
          finalRep += streakInfo.repBonus;
        }

        finalRep = hasPayloadRep
          ? Math.round(finalRep)
          : Math.round(finalRep * socialRepMultiplier);
        if (
          !hasPayloadRep &&
          socialClass === 'conflictive' &&
          !patient.discountApplied &&
          finalRep > 0
        ) {
          finalRep = Math.max(1, finalRep - 1);
        }

        gameState.updateReputation(finalRep);

        gameState.set({
          totalPatientsHealed: gameState.get('totalPatientsHealed') + 1,
        });

        if (patient.isPremium) {
          gameState.set({ premiumPatientsServed: gameState.get('premiumPatientsServed') + 1 });
        }

        gameState.addSatisfiedPatient(patient.fullName);

        setMoneyParticlesActive(true);
        setPreviousEarnings(earnings);
        setTimeout(() => setMoneyParticlesActive(false), 2500);
        setPatientExpression('happy');
        if (isWalmerTutorial) {
          setTutorialAdjustedToday((prev) => prev + 1);
        }
      } else if (result === 'referred') {
        earnings = resolvedPayload.earnings ?? Math.round(patient.payment * 0.3);
        gameState.earnMoney(earnings);
        gameState.addExperience(patient.condition.xpReward || 30);
        gameState.updateReputation(resolvedPayload.rep ?? Math.round(5 * socialRepMultiplier));
        gameState.set({
          totalPatientsReferred: gameState.get('totalPatientsReferred') + 1,
        });
        setPatientExpression('neutral');
      } else if (result === 'wrong_treat') {
        gameState.updateReputation(-10);
        gameState.set({
          dailyMistakes: (gameState.get('dailyMistakes') || 0) + 1,
        });
        setPatientExpression('pain');
      } else if (result === 'wrong_refer') {
        earnings = 0;
        gameState.updateReputation(-3);
        gameState.set({
          dailyMistakes: (gameState.get('dailyMistakes') || 0) + 1,
        });
        setPatientExpression('worried');
      }

      setDayMetrics((prev) => {
        const next = {
          ...prev,
          treated: prev.treated + 1,
          qualityTotal: prev.qualityTotal + qualityScore,
        };

        if (result === 'wrong_treat' || result === 'wrong_refer' || qualityTier === 'Bad') {
          next.bad += 1;
        } else if (qualityTier === 'Good' || result === 'referred') {
          next.good += 1;
        } else {
          next.regular += 1;
        }
        return next;
      });

      setDayEarnings((prev) => prev + earnings);
      const visitScore = Math.max(0, Math.min(100, Math.round(qualityScore || 0)));
      const visitOutcome = result;
      const currentPatientsToday = gameState.get('patientsToday') || [];
      const returnChance = patient?.returnChance ?? 0.3;
      const visitRecord = {
        id: patient?.id || `visit_${Date.now()}`,
        name: patient?.fullName || patient?.firstName || 'Paciente',
        condition: patient?.condition?.name || '',
        score: visitScore,
        outcome: visitOutcome,
        payment: Math.round(earnings || 0),
        socialClass,
        returnChance,
      };
      gameState.set({
        patientsToday: [...currentPatientsToday, visitRecord],
      });
      gameState.addAppointmentRecord({
        patientName: visitRecord.name,
        condition: visitRecord.condition,
        payment: visitRecord.payment,
        outcome: visitRecord.outcome,
        score: visitRecord.score,
      });

      telemetry.logEvent(TELEMETRY_EVENTS.PATIENT_RESOLVED, {
        day: gameState.get('currentDay') || 1,
        patientId: patient?.id || null,
        result,
        qualityTier,
        qualityScore,
        earnings: Math.round(earnings || 0),
        socialClass,
        treatmentMode: gameState.get('treatmentMode') || 'auto',
      });

      const newAchievements = checkAchievements(gameState);
      if (newAchievements.length > 0) {
        setPendingAchievements((prev) => [...prev, ...newAchievements]);
        newAchievements.forEach((ach) => unlockAchievement(gameState, ach));
        soundManager.playSuccess();
      }

      if (gameState.hasCA()) {
        setTimeout(() => {
          soundManager.playCASpeak();
          let commentType = 'goodJob';
          if (result === 'wrong_treat' || result === 'wrong_refer') {
            commentType = result === 'wrong_treat' ? 'badJob' : 'wrongReferral';
          } else if (result === 'referred') {
            commentType = 'referral';
          }
          setCaMessage(t(getCADialogue(commentType)));
          setTimeout(() => setCaMessage(null), 3000);
        }, 500);
      }

      const nextIndex = currentPatientIndex + 1;
      if (nextIndex >= patients.length) {
        endDay();
      } else {
        setCurrentPatientIndex(nextIndex);
        soundManager.playPatientEnter();
        setPatientExpression('worried');
        animatePatientEntry();
      }
    },
    [patients, currentPatientIndex, walkAnim, animatePatientEntry, isWalmerTutorial, route.params]
  );

  const endDay = useCallback(() => {
    if (dayEnded || endDayLockRef.current) {
      return;
    }
    endDayLockRef.current = true;
    setDayEnded(true);
    if (dayTimerRef.current) clearInterval(dayTimerRef.current);

    if (isWalmerTutorial) {
      const graduated = gameState.completeWalmerDay(tutorialAdjustedToday > 0 ? 1 : 0);
      gameState.save();

      if (graduated) {
        setCaMessage('Graduacion de Walmer completada. Elige el tipo de sala para tu consulta.');
        setShowRoomChoice(true);
      } else {
        setCaMessage(`Progreso Walmer: ${gameState.get('walmerDaysCompleted')}/3 dias.`);
      }
      setTimeout(() => setCaMessage(null), 3200);
      return;
    }

    let totalEarnings = dayEarnings;

    const hiredChiros = gameState.getHiredChirosCount();
    if (hiredChiros > 0) {
      const chiroIncome = hiredChiros * 250;
      totalEarnings += chiroIncome;
      gameState.earnMoney(chiroIncome);
      setDayEarnings(totalEarnings);
    }

    soundManager.playMoney();

    // Process end-of-day bills (Papers Please style)
    const report = gameState.processEndOfDay(totalEarnings);
    const dailyObjectives = buildDailyObjectives({
      netIncome: report.netIncome,
      dayMetrics,
      day: gameState.get('currentDay') || 1,
      economyProfile: gameState.get('economyProfile') || 'normal',
    });

    // Daily reward loop: encourages good execution and consistency.
    const rewardCalc = calculatePerformanceReward({
      netIncome: report.netIncome,
      objectives: dailyObjectives,
      mistakesToday: gameState.get('dailyMistakes') || 0,
      rewardMultiplier: gameState.getEconomyRewardMultiplier(),
    });
    const completedObjectivesCount = rewardCalc.completedObjectivesCount;
    const rewardAdjusted = rewardCalc.rewardAdjusted;
    if (rewardAdjusted > 0) {
      gameState.addDailyReward(rewardAdjusted);
    }

    const closeResolution = resolveMonthlyCloseIfNeeded({
      gameState,
      report,
    });
    const finalReport = closeResolution.finalReport;
    if (closeResolution.monthlyChargeInfo) {
      setMonthlyChargeInfo(closeResolution.monthlyChargeInfo);
      setShowMonthlyChargeModal(true);
    }

    const memorableMoments = buildDailyMemorableMoments({
      dailyEvent: finalReport.dailyEvent || null,
      objectives: dailyObjectives,
      topFactors: finalReport.topFactors || [],
      dayMetrics,
      consultPrice: gameState.get('consultPrice') || 100,
      economyProfile: gameState.get('economyProfile') || 'normal',
      debtTier: gameState.get('debtTier') || 'none',
    });

    setDayReport({
      ...finalReport,
      objectives: dailyObjectives,
      autoMetrics: dayMetrics,
      rewardFromPerformance: rewardAdjusted,
      completedObjectivesCount,
      memorableMoments,
    });
    telemetry.logEvent(TELEMETRY_EVENTS.DAY_END, {
      day: gameState.get('currentDay') || 1,
      treated: dayMetrics.treated,
      netIncome: finalReport.netIncome,
      balance: finalReport.newBalance,
      reward: rewardAdjusted,
      objectivesCompleted: completedObjectivesCount,
      debtTier: gameState.get('debtTier') || 'none',
      rescueApplied: !!(finalReport.rescue?.applied || finalReport.postMonthlyRescue?.applied),
    });

    // Schedule returning patients from today's happy patients
    const patientsToday = gameState.get('patientsToday') || [];
    patientsToday.forEach((p) => {
      const returnChance =
        typeof p.returnChance === 'number' ? Math.max(0, Math.min(1, p.returnChance)) : 0.3;
      if (p.score >= 70 && Math.random() < returnChance) {
        gameState.scheduleReturningPatient(p.name, p.condition, Math.floor(Math.random() * 5) + 3);
      }
    });

    gameState.save();

    // Show end-of-day report with bills
    setTimeout(() => setShowEndOfDayReport(true), 500);

    if (gameState.get('currentDay') > 3 && Math.random() < 0.15) {
      setTimeout(() => setShowInspection(true), 6000); // After report
    }

    if (gameState.hasCA()) {
      setTimeout(() => {
        soundManager.playCASpeak();
        const debt = gameState.get('clinicDebt') || 0;
        const reward = gameState.get('pendingDailyReward') || 0;
        const debtNote = debt > 0 ? ` Deuda activa: $${debt}.` : '';
        const rewardNote = reward > 0 ? ` Bonus pendiente: $${reward}.` : '';
        setCaMessage(
          `${t(getCADialogue('endDay'), { money: totalEarnings })}${rewardNote}${debtNote}`
        );
        setTimeout(() => setCaMessage(null), 3000);
      }, 6500);
    }
  }, [dayEarnings, isWalmerTutorial, tutorialAdjustedToday, dayMetrics, dayEnded]);

  useEffect(() => {
    if (!dayStarted || dayEnded) {
      return;
    }
    if (dayTimeRemaining <= 0) {
      endDay();
    }
  }, [dayStarted, dayEnded, dayTimeRemaining, endDay]);

  const nextDay = useCallback(() => {
    if (dayTimerRef.current) clearInterval(dayTimerRef.current);
    gameState.advanceDay();
    startDayLockRef.current = false;
    endDayLockRef.current = false;
    setDayStarted(false);
    setDayEnded(false);
    setShowEndOfDayReport(false);
    setDayReport(null);
    setPatients([]);
    setCurrentPatientIndex(0);
    setDisplayEarnings(0);
    setPatientExpression('worried');
    setDayTimeRemaining(0);
    setTutorialAdjustedToday(0);
    setShowFlyerMinigame(false);
    setFlyerTimeLeft(0);
    setFlyerTaps(0);
    setShowMonthlyChargeModal(false);
    setShowNegotiationModal(false);
    setNegotiationPatient(null);
    setDayMetrics({ treated: 0, good: 0, regular: 0, bad: 0, qualityTotal: 0 });
    gameState.save();
  }, []);

  const handleAcceptBooking = useCallback((booking) => {
    setPendingBookings((prev) => prev.filter((b) => b.id !== booking.id));
    setPatients((prev) => [
      ...prev,
      {
        ...(function () {
          const generatedPatient = generatePatient(
            gameState.get('skillLevel'),
            gameState.get('currentDay'),
            gameState.get('reputation'),
            gameState.get('consultPrice') || 100
          );
          return {
            ...generatedPatient,
            id: booking.id,
            fullName: booking.name,
            firstName: booking.name,
            lastName: '',
            isReturning: booking.isReturning,
          };
        })(),
      },
    ]);
  }, []);

  const handleRejectBooking = useCallback((booking) => {
    setPendingBookings((prev) => prev.filter((b) => b.id !== booking.id));
  }, []);

  const handleInspectionClose = (fine) => {
    setShowInspection(false);
    if (fine > 0) {
      gameState.spendMoney(fine);
    } else {
      gameState.set({ reputation: gameState.get('reputation') + 5 });
    }
    gameState.save();
  };

  const currentPatient = patients[currentPatientIndex];

  const navigatePatientFlow = useCallback(
    (patientToOpen) => {
      if (!patientToOpen) {
        return;
      }

      const treatmentMode = gameState.get('treatmentMode') || 'auto';
      const clinicMode = gameState.get('clinicMode') || 'closed';
      const directAdjustMode = isWalmerTutorial || clinicMode === 'open';
      const shouldAutoTreat =
        treatmentMode === 'auto' ||
        (treatmentMode === 'hybrid' && !patientToOpen.isPremium && !patientToOpen.isReferralCase);

      if (shouldAutoTreat) {
        const autoResult = gameState.resolveAutoTreatment(patientToOpen, {
          queuePosition: currentPatientIndex,
          queueLength: patients.length,
          timeRemaining: dayTimeRemaining,
          dayDuration: isWalmerTutorial ? 120 : 240,
        });
        setCaMessage(`Auto: ${autoResult.qualityTier} (${autoResult.qualityScore})`);
        setTimeout(() => setCaMessage(null), 1400);
        handlePatientComplete(autoResult.result, {
          earnings: autoResult.income,
          rep: autoResult.repDelta,
          qualityScore: autoResult.qualityScore,
          qualityTier: autoResult.qualityTier,
        });
        return;
      }

      if (directAdjustMode) {
        navigation.navigate('Treatment', { patient: patientToOpen });
        return;
      }

      navigation.navigate('Consultation', {
        patient: patientToOpen,
        onResult: handlePatientComplete,
      });
    },
    [
      handlePatientComplete,
      isWalmerTutorial,
      navigation,
      currentPatientIndex,
      patients.length,
      dayTimeRemaining,
    ]
  );

  const handleNegotiationDecision = useCallback(
    (acceptDiscount) => {
      if (!negotiationPatient) return;
      setShowNegotiationModal(false);
      setNegotiationPatient(null);

      if (acceptDiscount) {
        const updated = {
          ...negotiationPatient,
          negotiationResolved: true,
          discountApplied: true,
        };
        setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setCaMessage(`Descuento aplicado a ${updated.fullName}.`);
        setTimeout(() => setCaMessage(null), 1800);
        navigatePatientFlow(updated);
        return;
      }

      const leaveChance = negotiationPatient.socialClass === 'conflictive' ? 0.65 : 0.4;
      const leavesAngry = Math.random() < leaveChance;
      if (leavesAngry) {
        const repPenalty = negotiationPatient.socialClass === 'conflictive' ? -6 : -3;
        gameState.updateReputation(repPenalty);
        setCaMessage(`${negotiationPatient.fullName} se marcho enfadado.`);
        setTimeout(() => setCaMessage(null), 2200);

        const nextIndex = currentPatientIndex + 1;
        if (nextIndex >= patients.length) {
          endDay();
        } else {
          setCurrentPatientIndex(nextIndex);
          soundManager.playPatientEnter();
          animatePatientEntry();
        }
        return;
      }

      const updated = {
        ...negotiationPatient,
        negotiationResolved: true,
        discountRejected: true,
      };
      setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setCaMessage(`${updated.fullName} acepto sin descuento.`);
      setTimeout(() => setCaMessage(null), 1800);
      navigatePatientFlow(updated);
    },
    [
      negotiationPatient,
      navigatePatientFlow,
      currentPatientIndex,
      patients.length,
      endDay,
      animatePatientEntry,
    ]
  );

  const openCurrentPatient = useCallback(() => {
    if (!currentPatient) {
      return;
    }

    if (currentPatient.requiresDiscountNegotiation && !currentPatient.negotiationResolved) {
      setNegotiationPatient(currentPatient);
      setShowNegotiationModal(true);
      soundManager.playCASpeak();
      return;
    }

    navigatePatientFlow(currentPatient);
  }, [currentPatient, navigatePatientFlow]);

  // Derived values

  // Render
  return (
    <View style={styles.container}>
      <FloatingMoneyParticles active={moneyParticlesActive} amount={previousEarnings} />

      {/* HUD bar */}
      <View style={styles.hudWrap}>
        <ClinicHud
          state={state}
          dayStarted={dayStarted}
          dayEnded={dayEnded}
          dayTimeRemaining={dayTimeRemaining}
          predictedPatients={predictedPatients}
          seasonInfo={seasonInfo}
          reputationInfo={reputationInfo}
          streakInfo={streakInfo}
        />
      </View>

      {/* Patient zone (wall + portrait) */}
      <View style={styles.patientZoneWrap}>
        <PatientZone
          dayStarted={dayStarted}
          dayEnded={dayEnded}
          currentPatient={currentPatient}
          patientExpression={patientExpression}
          walkAnim={walkAnim}
          pulseAnim={pulseAnim}
          starAnim={starAnim}
          sunAnim={sunAnim}
          moonAnim={moonAnim}
          caMessage={caMessage}
          displayEarnings={displayEarnings}
          clinicUpgrades={clinicUpgrades}
          timeOfDay={timeOfDay}
        />
      </View>

      {/* Desk workspace */}
      <View style={styles.deskWrap}>
        <DeskWorkspace
          currentPatient={currentPatient}
          dayStarted={dayStarted}
          dayEnded={dayEnded}
          dayEarnings={dayEarnings}
        />
      </View>

      {/* Action bar */}
      <ScrollView style={styles.actionBarWrap} showsVerticalScrollIndicator={false} bounces={false}>
        <ActionBar
          dayStarted={dayStarted}
          dayEnded={dayEnded}
          currentPatient={currentPatient}
          patients={patients}
          currentPatientIndex={currentPatientIndex}
          displayEarnings={displayEarnings}
          state={state}
          pulseAnim={pulseAnim}
          pendingBookings={pendingBookings}
          showDailyMissions={showDailyMissions}
          isWalmerTutorial={isWalmerTutorial}
          walmerProgressText={`${state.walmerDaysCompleted || 0}/3 dias - ${state.walmerPatientsAdjusted || 0}/3 pacientes`}
          flyersDoneToday={!!state.flyersDoneToday}
          onPlayFlyers={startFlyerMinigame}
          onBuyAdvertising={buyAdvertising}
          canBuyAdvertising={(state.money || 0) >= 1200}
          consultPrice={state.consultPrice || 100}
          onDecreasePrice={() => adjustConsultPrice(-10)}
          onIncreasePrice={() => adjustConsultPrice(10)}
          economyProfile={state.economyProfile || 'normal'}
          onCycleEconomyProfile={cycleEconomyProfile}
          onApplyRecommendedPrice={applyRecommendedPrice}
          canApplyRecommendedPrice={
            Math.abs((priceGuidance?.recommendedPrice || 0) - (state.consultPrice || 0)) >= 10
          }
          onPayLoanNow={payLoanNow}
          canPayLoanNow={
            (state.loanPrincipal || 0) > 0 && (state.money || 0) >= (state.loanInstallment || 0)
          }
          activeDailyEconomicEvent={state.activeDailyEconomicEvent || null}
          dailyEconomicEventHistory={state.dailyEconomicEventHistory || []}
          demandPreview={demandPreview}
          dailyCostPreview={dailyCostPreview}
          estimatedIncome={estimatedIncome}
          estimatedNet={estimatedNet}
          forecast30={forecast30}
          priceGuidance={priceGuidance}
          economyHealth={economyHealth}
          pendingDailyReward={state.pendingDailyReward || 0}
          treatmentMode={treatmentMode}
          onClaimDailyReward={claimDailyReward}
          onStartDay={startDay}
          onNextDay={nextDay}
          onOpenConsultation={openCurrentPatient}
          onOpenShop={() => navigation.navigate('Shop')}
          onOpenEvents={() => navigation.navigate('Events')}
          onOpenRegistry={() => {
            soundManager.playClick();
            setShowRegistry(true);
          }}
          onOpenBookings={() => {
            soundManager.playClick();
            setShowBookingsModal(true);
          }}
          onOpenMissions={() => setShowDailyMissions((prev) => !prev)}
          onOpenPathologyBook={() => navigation.navigate('PathologyBook')}
          onOpenAerialView={() => navigation.navigate('AerialView')}
          onOpenAchievements={() => {
            soundManager.playClick();
            navigation.navigate('Achievements');
          }}
          onOpenIntroStory={() => {}}
          onSave={() => {
            gameState.save();
            soundManager.playSuccess();
          }}
          onGoToMenu={() => {
            soundManager.stopMusic();
            navigation.replace('MainMenu');
          }}
        />
      </ScrollView>

      {showFlyerMinigame && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Repartir Flyers</Text>
            <Text style={styles.modalSubtitle}>Toca rapido para ganar alcance</Text>
            <Text style={styles.modalInfo}>Tiempo: {flyerTimeLeft}s</Text>
            <Text style={styles.modalInfo}>Taps: {flyerTaps}</Text>
            <Pressable style={styles.flyerTapCell} onPress={handleFlyerTap}>
              <Text style={styles.flyerTapText}>TAP</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showRoomChoice && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Graduacion Walmer</Text>
            <Text style={styles.modalSubtitle}>Elige tu primera consulta</Text>
            <View style={styles.roomButtonsRow}>
              <Pressable style={styles.roomChoiceButton} onPress={() => selectClinicMode('open')}>
                <Text style={styles.roomChoiceTitle}>Sala abierta</Text>
                <Text style={styles.roomChoiceText}>Ritmo arcade, varios pacientes</Text>
              </Pressable>
              <Pressable style={styles.roomChoiceButton} onPress={() => selectClinicMode('closed')}>
                <Text style={styles.roomChoiceTitle}>Sala cerrada</Text>
                <Text style={styles.roomChoiceText}>Consulta 1 a 1, mas clinica</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showNegotiationModal && negotiationPatient && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Paciente pide descuento</Text>
            <Text style={styles.modalSubtitle}>
              {negotiationPatient.fullName} ({negotiationPatient.socialLabel}) quiere rebaja.
            </Text>
            <Text style={styles.modalInfo}>Tarifa actual: ${negotiationPatient.payment}</Text>
            <View style={styles.roomButtonsRow}>
              <Pressable
                style={styles.roomChoiceButton}
                onPress={() => handleNegotiationDecision(true)}
              >
                <Text style={styles.roomChoiceTitle}>Aceptar descuento</Text>
                <Text style={styles.roomChoiceText}>Cobras menos, pero ganas reputacion.</Text>
              </Pressable>
              <Pressable
                style={styles.roomChoiceButton}
                onPress={() => handleNegotiationDecision(false)}
              >
                <Text style={styles.roomChoiceTitle}>Mantener precio</Text>
                <Text style={styles.roomChoiceText}>Puede aceptar... o irse molesto.</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showMonthlyChargeModal && monthlyChargeInfo && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cierre Mensual</Text>
            <Text style={styles.modalInfo}>
              Beneficio gravable: ${monthlyChargeInfo.monthProfit || 0}
            </Text>
            <Text style={styles.modalInfo}>Alquiler: ${monthlyChargeInfo.rent}</Text>
            <Text style={styles.modalInfo}>Impuestos: ${monthlyChargeInfo.taxes}</Text>
            <Text style={styles.modalInfo}>Total cobrado: ${monthlyChargeInfo.total}</Text>
            <Pressable
              style={styles.primaryInlineButton}
              onPress={() => setShowMonthlyChargeModal(false)}
            >
              <Text style={styles.primaryInlineButtonText}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Modals */}
      <BookingsModal
        visible={showBookingsModal}
        bookings={pendingBookings}
        onClose={() => setShowBookingsModal(false)}
        onAccept={handleAcceptBooking}
        onReject={handleRejectBooking}
      />

      <HealthInspectionModal
        visible={showInspection}
        mistakes={gameState.get('dailyMistakes') || 0}
        onClose={handleInspectionClose}
      />

      <AppointmentRegistry visible={showRegistry} onClose={() => setShowRegistry(false)} />

      <AchievementNotification
        achievement={currentAchievement}
        visible={showAchievement}
        onComplete={() => {
          setShowAchievement(false);
          setPendingAchievements((prev) => prev.slice(1));
          setCurrentAchievement(null);
        }}
      />

      <EndOfDayReport
        visible={showEndOfDayReport}
        dayReport={dayReport}
        onContinue={() => setShowEndOfDayReport(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.desk,
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  hudWrap: {
    minHeight: 60,
    marginBottom: 6,
    flexShrink: 0,
  },
  patientZoneWrap: {
    flex: 3,
    minHeight: 120,
    marginBottom: 6,
  },
  deskWrap: {
    flex: 1,
    minHeight: 60,
    marginBottom: 6,
  },
  actionBarWrap: {
    flexShrink: 0,
    marginBottom: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#141822',
    borderWidth: 2,
    borderColor: '#47C8FF',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    color: '#F4F8FF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#A9B9D1',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInfo: {
    color: '#D8E8FF',
    fontSize: 15,
    marginBottom: 6,
    textAlign: 'center',
  },
  flyerTapCell: {
    marginTop: 10,
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#72E787',
    backgroundColor: '#1E2A3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyerTapText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roomButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  roomChoiceButton: {
    flex: 1,
    backgroundColor: '#1E2A3E',
    borderColor: '#4D7FAE',
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
  },
  roomChoiceTitle: {
    color: '#F4F8FF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  roomChoiceText: {
    color: '#B7C7DE',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryInlineButton: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#47C8FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryInlineButtonText: {
    color: '#001A2A',
    fontSize: 15,
    fontWeight: '800',
  },
});
