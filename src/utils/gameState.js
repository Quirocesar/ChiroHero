// Global Game State Manager
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  computeDailyDemand as computeDailyDemandEngine,
  computeDailyCosts as computeDailyCostsEngine,
  computeDebtInterest as computeDebtInterestEngine,
  computeDebtRescue as computeDebtRescueEngine,
  getDemandBaseByDay as getDemandBaseByDayEngine,
  getDebtTierForPrincipal as getDebtTierForPrincipalEngine,
  getDebtTierConfig as getDebtTierConfigEngine,
  getEffectiveRescueThreshold as getEffectiveRescueThresholdEngine,
} from '../engines/economyEngine';
import {
  getDayQualityPenalty as getDayQualityPenaltyEngine,
  getSocialMixWeights as getSocialMixWeightsEngine,
  getWeightedSocialStats as getWeightedSocialStatsEngine,
  resolveAutoTreatment as resolveAutoTreatmentEngine,
} from '../engines/patientFlowEngine';

const SAVE_SCHEMA_VERSION = 2;

const SAVE_KEYS = {
  1: '@chirohero_save_1',
  2: '@chirohero_save_2',
  3: '@chirohero_save_3',
};

export const CLINIC_LEVEL_BENEFITS = {
  1: { maxPatients: 2, incomeBonus: 0, patientBonus: 0, referralChance: 0.05 },
  2: { maxPatients: 3, incomeBonus: 0.05, patientBonus: 0, referralChance: 0.08 },
  3: { maxPatients: 4, incomeBonus: 0.1, patientBonus: 1, referralChance: 0.1 },
  4: { maxPatients: 4, incomeBonus: 0.15, patientBonus: 1, referralChance: 0.12 },
  5: { maxPatients: 5, incomeBonus: 0.2, patientBonus: 2, referralChance: 0.15 },
  6: { maxPatients: 5, incomeBonus: 0.25, patientBonus: 2, referralChance: 0.18 },
  7: { maxPatients: 6, incomeBonus: 0.3, patientBonus: 3, referralChance: 0.2 },
  8: { maxPatients: 6, incomeBonus: 0.35, patientBonus: 3, referralChance: 0.22 },
  9: { maxPatients: 7, incomeBonus: 0.4, patientBonus: 4, referralChance: 0.25 },
  10: { maxPatients: 8, incomeBonus: 0.5, patientBonus: 5, referralChance: 0.3 },
};

export const REPUTATION_TITLES = {
  1: { title: 'Aprendiz', minRep: 0, maxPatientsBonus: 0, tipBonus: 0 },
  2: { title: 'Principiante', minRep: 50, maxPatientsBonus: 0, tipBonus: 0.05 },
  3: { title: 'Competente', minRep: 150, maxPatientsBonus: 0, tipBonus: 0.1 },
  4: { title: 'Experto', minRep: 300, maxPatientsBonus: 1, tipBonus: 0.15 },
  5: { title: 'Avanzado', minRep: 500, maxPatientsBonus: 1, tipBonus: 0.2 },
  6: { title: 'Maestro', minRep: 750, maxPatientsBonus: 2, tipBonus: 0.25 },
  7: { title: 'Experto Senior', minRep: 1000, maxPatientsBonus: 2, tipBonus: 0.3 },
  8: { title: 'Licenciado', minRep: 1500, maxPatientsBonus: 3, tipBonus: 0.35 },
  9: { title: 'Doctor', minRep: 2000, maxPatientsBonus: 3, tipBonus: 0.4 },
  10: { title: 'Doctor Senior', minRep: 3000, maxPatientsBonus: 4, tipBonus: 0.45 },
  15: { title: 'Especialista', minRep: 5000, maxPatientsBonus: 5, tipBonus: 0.5 },
  20: { title: 'Cirujano', minRep: 7500, maxPatientsBonus: 6, tipBonus: 0.55 },
  25: { title: 'Jefe de Clinica', minRep: 10000, maxPatientsBonus: 7, tipBonus: 0.6 },
  30: { title: 'Director', minRep: 15000, maxPatientsBonus: 8, tipBonus: 0.65 },
  35: { title: 'Consul', minRep: 20000, maxPatientsBonus: 9, tipBonus: 0.7 },
  40: { title: 'Ministro', minRep: 30000, maxPatientsBonus: 10, tipBonus: 0.75 },
  45: { title: 'Legado', minRep: 50000, maxPatientsBonus: 12, tipBonus: 0.8 },
  50: { title: 'Leyenda', minRep: 100000, maxPatientsBonus: 15, tipBonus: 1.0 },
};

export const RANK_TIERS = {
  Bronze: { minRep: 0, maxRep: 500, color: '#cd7f32' },
  Silver: { minRep: 501, maxRep: 1500, color: '#c0c0c0' },
  Gold: { minRep: 1501, maxRep: 4000, color: '#ffd700' },
  Platinum: { minRep: 4001, maxRep: 10000, color: '#e5e4e2' },
  Diamond: { minRep: 10001, maxRep: Infinity, color: '#b9f2ff' },
};

export const SEASON_LENGTH_DAYS = 30;

export const STREAK_BONUSES = {
  3: { moneyBonus: 0.1, repBonus: 1 },
  7: { moneyBonus: 0.2, repBonus: 2 },
  14: { moneyBonus: 0.3, repBonus: 3 },
  30: { moneyBonus: 0.5, repBonus: 5 },
};

export const ECONOMY_PROFILES = {
  casual: {
    label: 'Casual',
    fixedCostMultiplier: 0.8,
    variableCostMultiplier: 0.82,
    maintenanceMultiplier: 0.85,
    staffMultiplier: 0.9,
    taxRateMultiplier: 0.75,
    monthlyRentMultiplier: 0.8,
    demandModifier: 1,
    debtInterestMultiplier: 0.7,
    rescueThreshold: -320,
    rescueTargetCash: 220,
    rescueInterestMultiplier: 1.04,
    rewardMultiplier: 1.2,
    safeCashBuffer: 200,
  },
  normal: {
    label: 'Normal',
    fixedCostMultiplier: 1,
    variableCostMultiplier: 1,
    maintenanceMultiplier: 1,
    staffMultiplier: 1,
    taxRateMultiplier: 1,
    monthlyRentMultiplier: 1,
    demandModifier: 0,
    debtInterestMultiplier: 1,
    rescueThreshold: -200,
    rescueTargetCash: 100,
    rescueInterestMultiplier: 1.18,
    rewardMultiplier: 1,
    safeCashBuffer: 300,
  },
  hardcore: {
    label: 'Hardcore',
    fixedCostMultiplier: 1.28,
    variableCostMultiplier: 1.22,
    maintenanceMultiplier: 1.25,
    staffMultiplier: 1.2,
    taxRateMultiplier: 1.25,
    monthlyRentMultiplier: 1.2,
    demandModifier: -1,
    debtInterestMultiplier: 1.45,
    rescueThreshold: -120,
    rescueTargetCash: 70,
    rescueInterestMultiplier: 1.38,
    rewardMultiplier: 0.85,
    safeCashBuffer: 450,
  },
};

export function getReputationLevel(rep) {
  let level = 1;
  for (let lvl in REPUTATION_TITLES) {
    if (rep >= REPUTATION_TITLES[lvl].minRep) {
      level = parseInt(lvl);
    }
  }
  return level;
}

export function getReputationTitle(rep) {
  const level = getReputationLevel(rep);
  return REPUTATION_TITLES[level]?.title || 'Aprendiz';
}

export function getCurrentRank(rep) {
  for (let rank in RANK_TIERS) {
    if (rep >= RANK_TIERS[rank].minRep && rep <= RANK_TIERS[rank].maxRep) {
      return { rank, ...RANK_TIERS[rank] };
    }
  }
  return { rank: 'Bronze', ...RANK_TIERS.Bronze };
}

export function getSeasonNumber(currentDay) {
  return Math.ceil(currentDay / SEASON_LENGTH_DAYS);
}

export function getStreakBonus(streak) {
  let bonus = { moneyBonus: 0, repBonus: 0 };
  for (let days in STREAK_BONUSES) {
    if (streak >= parseInt(days)) {
      bonus = STREAK_BONUSES[days];
    }
  }
  return bonus;
}

export function getClinicBenefits(level) {
  return CLINIC_LEVEL_BENEFITS[level] || CLINIC_LEVEL_BENEFITS[1];
}

const DEFAULT_STATE = {
  saveSchemaVersion: SAVE_SCHEMA_VERSION,
  // Player
  playerName: 'Dr. Quiro',
  money: 500,
  reputation: 0,
  reputationLevel: 1,
  skillLevel: 1,
  experience: 0,
  treatmentMode: 'auto', // auto | hybrid | manual
  hasCompletedTutorial: false,
  hasSeenStory: false,
  hasGraduatedWalmer: false,
  walmerDaysCompleted: 0,
  walmerPatientsAdjusted: 0,
  clinicMode: null, // 'open' | 'closed'

  // Game Mode
  gameMode: 'relaxed', // arcade, challenge, relaxed

  // Progression
  currentDay: 1,
  currentWeek: 1,
  currentMonth: 1,
  currentSeason: 1,
  totalPatientsHealed: 0,
  totalPatientsReferred: 0,
  totalMoneyEarned: 0,

  // Arcade mode stats
  arcadeHighScore: 0,
  arcadePatientsTreated: 0,
  arcadeCurrentSpeed: 1,

  // Challenge mode stats
  challengeMistakes: 0,
  challengeRepLost: 0,

  // Relaxed mode stats
  relaxedPatientsTreated: 0,

  // Clinic
  clinicLevel: 1,
  consultPrice: 100,
  monthlyTaxRate: 0.15,
  economyProfile: 'normal',
  clinicName: 'Clinica QuiroHero',

  // Daily Streak
  dailyStreak: 0,
  lastPlayedDate: null,
  streakBonusClaimed: false,

  // Season
  seasonPatients: [],
  seasonStartDay: 1,

  // Referred patients system
  referredPatients: [],
  referredToday: [],

  // Daily Missions
  dailyMissions: [],
  lastMissionReset: null,

  // Upgrades purchased
  upgrades: {
    // Tools
    activator: false, // Activador quiropractico
    dropTable: false, // Mesa de caida
    flexionTable: false, // Mesa de flexion-distraccion
    ultrasound: false, // Ultrasonido
    tens: false, // TENS electrico
    massageGun: false, // Pistola de masaje

    // Clinic
    waitingRoom: 1, // Nivel sala de espera
    decoration: 1, // Decoracion
    lighting: 1, // Iluminacion

    // Skills
    cervicalTechnique: 1, // Tecnica cervical
    thoracicTechnique: 1, // Tecnica toracica
    lumbarTechnique: 1, // Tecnica lumbar
    palpation: 1, // Palpacion
    diagnostics: 1, // Diagnostico
  },

  // Decorations (Passive Buffs)
  decorations: {
    plants: false, // patience
    neonSign: false, // combo duration
    premiumBed: false, // base pay
  },

  // Staff
  staff: {
    whatsappManager: false,
    appointmentAssistant: false,
    chiroAssistant: false,
    multipleCA: false,
    hireChiro1: false,
    hireChiro2: false,
    hireChiro3: false,
  },

  // Language
  language: 'es',

  // Returning patients tracking
  satisfiedPatients: [], // Names of patients who were happy

  // Events unlocked
  eventsCompleted: [],
  premiumPatientsServed: 0,

  // Daily tracking
  patientsToday: [],
  dayComplete: false,
  dailyMistakes: 0,
  flyersDoneToday: false,
  flyerReach: 0,
  paidAdvertisingLevel: 0,
  dailyDemandModifier: 0,
  dailyCostFlatModifier: 0,
  activeDailyEconomicEvent: null,
  dailyEconomicEventHistory: [],
  lastMonthlyChargeDay: 0,
  monthProfitAccum: 0,
  dailyFixedCosts: 120,
  dailyVariableCosts: 18,
  loanPrincipal: 0,
  loanInstallment: 0,
  loanDaysRemaining: 0,
  debtTier: 'none',
  pendingDailyReward: 0,

  // Papers Please-inspired systems
  citations: 0, // Total citations received
  citationsToday: 0, // Citations this day (first 2 are warnings)
  totalFines: 0, // Total fines paid
  clinicDebt: 0, // Unpaid bills accumulate as debt
  dayEarnings: 0, // Earnings for current day
  newspaperHeadlines: [], // Recent headlines about your clinic
  returningPatients: [], // Patients who will return (name, condition, day to return)

  // Statistics
  stats: {
    perfectAdjustments: 0,
    fastestTreatment: null,
    longestStreak: 0,
    currentStreak: 0,
    highestCombo: 0,
    perfectDays: 0,
  },

  // Achievements
  achievements: [],

  // Appointment History
  appointmentHistory: [],
};

function normalizeLoadedState(parsed = {}) {
  const source = parsed || {};
  const sourceVersion = Number(source.saveSchemaVersion || 1);

  const normalized = {
    ...DEFAULT_STATE,
    ...source,
    upgrades: { ...DEFAULT_STATE.upgrades, ...(source.upgrades || {}) },
    decorations: { ...DEFAULT_STATE.decorations, ...(source.decorations || {}) },
    staff: { ...DEFAULT_STATE.staff, ...(source.staff || {}) },
    stats: { ...DEFAULT_STATE.stats, ...(source.stats || {}) },
    referredPatients: source.referredPatients || [],
    referredToday: source.referredToday || [],
    dailyMissions: source.dailyMissions || [],
    seasonPatients: source.seasonPatients || [],
    appointmentHistory: source.appointmentHistory || [],
    patientsToday: source.patientsToday || [],
    dailyEconomicEventHistory: source.dailyEconomicEventHistory || [],
    newspaperHeadlines: source.newspaperHeadlines || [],
    returningPatients: source.returningPatients || [],
    satisfiedPatients: source.satisfiedPatients || [],
    achievements: source.achievements || [],
    saveSchemaVersion: SAVE_SCHEMA_VERSION,
  };

  if (sourceVersion < 2) {
    if (!normalized.treatmentMode) normalized.treatmentMode = 'auto';
    if (typeof normalized.dailyDemandModifier !== 'number') normalized.dailyDemandModifier = 0;
    if (typeof normalized.dailyCostFlatModifier !== 'number') normalized.dailyCostFlatModifier = 0;
    if (typeof normalized.pendingDailyReward !== 'number') normalized.pendingDailyReward = 0;
    if (typeof normalized.dailyFixedCosts !== 'number') normalized.dailyFixedCosts = 120;
    if (typeof normalized.dailyVariableCosts !== 'number') normalized.dailyVariableCosts = 18;
    if (typeof normalized.monthlyTaxRate !== 'number') normalized.monthlyTaxRate = 0.15;
    if (!normalized.economyProfile) normalized.economyProfile = 'normal';
  }

  normalized.loanPrincipal = Math.max(0, Math.round(normalized.loanPrincipal || 0));
  normalized.loanInstallment = Math.max(0, Math.round(normalized.loanInstallment || 0));
  normalized.loanDaysRemaining = Math.max(0, Math.round(normalized.loanDaysRemaining || 0));
  normalized.debtTier = getDebtTierForPrincipalEngine(normalized.loanPrincipal);
  normalized.reputationLevel = getReputationLevel(normalized.reputation || 0);

  return normalized;
}

class GameState {
  constructor() {
    this.state = { ...DEFAULT_STATE };
    this.listeners = [];
    this.currentSlot = 1;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  get(key) {
    return this.state[key];
  }

  getState() {
    return this.state;
  }

  set(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  getMaxPatientsPerDay() {
    const { currentDay, currentWeek, clinicLevel } = this.state;
    const benefits = getClinicBenefits(clinicLevel);
    const repLevel = getReputationLevel(this.state.reputation);
    const repTitle = REPUTATION_TITLES[repLevel];
    const repBonus = repTitle?.maxPatientsBonus || 0;

    if (currentDay <= 7) return 2 + benefits.patientBonus + repBonus;
    if (currentDay <= 14) return 3 + benefits.patientBonus + repBonus;
    if (currentDay <= 30) return 4 + benefits.patientBonus + repBonus;
    if (currentDay <= 60) return 5 + (clinicLevel - 1) + benefits.patientBonus + repBonus;
    return 6 + (clinicLevel - 1) * 2 + benefits.patientBonus + repBonus;
  }

  getPatientPayRange() {
    const base = 50 + (this.state.clinicLevel - 1) * 20;
    const benefits = getClinicBenefits(this.state.clinicLevel);
    const repLevel = getReputationLevel(this.state.reputation);
    const repTitle = REPUTATION_TITLES[repLevel];
    const repBonus = this.state.reputation * 2;
    const incomeBonus = benefits.incomeBonus + (repTitle?.tipBonus || 0);

    return {
      min: Math.round((base + repBonus) * (1 + incomeBonus)),
      max: Math.round((base * 2 + repBonus + this.state.skillLevel * 10) * (1 + incomeBonus)),
    };
  }

  getCurrentRank() {
    return getCurrentRank(this.state.reputation);
  }

  getReputationInfo() {
    const level = getReputationLevel(this.state.reputation);
    const title = getReputationTitle(this.state.reputation);
    const rank = getCurrentRank(this.state.reputation);
    const nextLevel = REPUTATION_TITLES[level + 1];

    let progress = 100;
    let remaining = 0;

    if (nextLevel) {
      const currentLevelMin = REPUTATION_TITLES[level].minRep;
      const nextLevelMin = nextLevel.minRep;
      const progressInLevel = this.state.reputation - currentLevelMin;
      const range = nextLevelMin - currentLevelMin;
      progress = Math.round((progressInLevel / range) * 100);
      remaining = nextLevelMin - this.state.reputation;
    }

    return { level, title, rank, progress, remaining, nextLevel };
  }

  getSeasonInfo() {
    return {
      currentSeason: getSeasonNumber(this.state.currentDay),
      seasonDay: ((this.state.currentDay - 1) % SEASON_LENGTH_DAYS) + 1,
      totalDays: SEASON_LENGTH_DAYS,
    };
  }

  getStreakInfo() {
    const streak = this.state.dailyStreak || 0;
    const bonus = getStreakBonus(streak);
    return { streak, ...bonus };
  }

  checkAndUpdateStreak() {
    const today = new Date().toDateString();
    const lastPlayed = this.state.lastPlayedDate;

    if (lastPlayed === today) {
      return { updated: false, streak: this.state.dailyStreak };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (lastPlayed === yesterday.toDateString()) {
      newStreak = (this.state.dailyStreak || 0) + 1;
    }

    this.set({
      dailyStreak: newStreak,
      lastPlayedDate: today,
      streakBonusClaimed: false,
    });

    return { updated: true, streak: newStreak };
  }

  addReferredPatient(patient) {
    const referred = [...(this.state.referredPatients || [])];
    const referredToday = [...(this.state.referredToday || [])];

    if (!referred.find((p) => p.id === patient.id)) {
      referred.push(patient);
    }
    if (!referredToday.find((p) => p.id === patient.id)) {
      referredToday.push(patient);
    }

    this.set({
      referredPatients: referred.slice(-50),
      referredToday: referredToday.slice(-10),
    });
  }

  getReferralChance() {
    const benefits = getClinicBenefits(this.state.clinicLevel);
    const repLevel = getReputationLevel(this.state.reputation);
    const repTitle = REPUTATION_TITLES[repLevel];
    const repBonus = (repTitle?.tipBonus || 0) * 0.5;
    return benefits.referralChance + repBonus;
  }

  canPatientRefer() {
    const chance = this.getReferralChance();
    return Math.random() < chance;
  }

  checkAndStartNewSeason() {
    const newSeason = getSeasonNumber(this.state.currentDay);
    if (newSeason > this.state.currentSeason) {
      this.set({
        currentSeason: newSeason,
        seasonStartDay: this.state.currentDay,
        seasonPatients: [],
        referredToday: [],
      });
      return true;
    }
    return false;
  }

  updateReputation(amount) {
    const newRep = Math.max(0, this.state.reputation + amount);
    const oldLevel = getReputationLevel(this.state.reputation);
    const newLevel = getReputationLevel(newRep);

    this.set({ reputation: newRep });

    if (newLevel > oldLevel) {
      this.set({ reputationLevel: newLevel });
    }
  }

  upgradeClinic() {
    if (this.state.clinicLevel >= 10) return false;

    const costs = {
      2: 1000,
      3: 2500,
      4: 5000,
      5: 10000,
      6: 20000,
      7: 35000,
      8: 55000,
      9: 80000,
      10: 120000,
    };

    const cost = costs[this.state.clinicLevel + 1];
    if (!cost || !this.canAfford(cost)) return false;

    this.spendMoney(cost);
    this.set({ clinicLevel: this.state.clinicLevel + 1 });
    return true;
  }

  getClinicUpgradeCost() {
    const costs = {
      2: 1000,
      3: 2500,
      4: 5000,
      5: 10000,
      6: 20000,
      7: 35000,
      8: 55000,
      9: 80000,
      10: 120000,
    };
    return costs[this.state.clinicLevel + 1] || null;
  }

  canAfford(cost) {
    return this.state.money >= cost;
  }

  getEconomyProfileConfig(profileId = null) {
    const id = profileId || this.state.economyProfile || 'normal';
    return ECONOMY_PROFILES[id] || ECONOMY_PROFILES.normal;
  }

  setEconomyProfile(profileId) {
    if (!ECONOMY_PROFILES[profileId]) return this.state.economyProfile || 'normal';
    this.set({ economyProfile: profileId });
    return profileId;
  }

  getEffectiveMonthlyTaxRate() {
    const profile = this.getEconomyProfileConfig();
    const base = this.state.monthlyTaxRate || 0.15;
    return Math.max(0, base * (profile.taxRateMultiplier || 1));
  }

  getEconomyRewardMultiplier() {
    const profile = this.getEconomyProfileConfig();
    return profile.rewardMultiplier || 1;
  }

  getEconomyHealthSnapshot(days = 30) {
    const profile = this.getEconomyProfileConfig();
    const forecast = this.simulateEconomyForecast(days, {
      consultPrice: this.getConsultPrice(),
      economyProfile: this.state.economyProfile || 'normal',
    });
    const guidance = this.getConsultPriceRecommendation({ days });

    const projected = forecast.projectedBalance || 0;
    const safeBuffer = profile.safeCashBuffer || 300;
    let level = 'safe';
    let hint = 'Economia estable';

    if (forecast.rescueRisk === 'alto' || projected < 0) {
      level = 'critical';
      hint = 'Riesgo alto de rescate: baja costes o ajusta precio';
    } else if (forecast.rescueRisk === 'medio' || projected < safeBuffer) {
      level = 'watch';
      hint = 'Margen justo: vigila precio y gastos';
    }

    return {
      profile,
      forecast,
      guidance,
      level,
      hint,
    };
  }

  clearDailyEconomicEvent() {
    this.set({
      dailyDemandModifier: 0,
      dailyCostFlatModifier: 0,
      activeDailyEconomicEvent: null,
    });
  }

  generateDailyEconomicEvent(options = {}) {
    const profileId = options.economyProfile || this.state.economyProfile || 'normal';
    const currentDay = options.currentDay || this.state.currentDay || 1;
    const loanPrincipal = this.state.loanPrincipal || 0;

    let chance = currentDay <= 3 ? 0.12 : 0.3;
    if (profileId === 'casual') chance -= 0.06;
    if (profileId === 'hardcore') chance += 0.08;
    if (loanPrincipal > 0) chance += 0.05;
    chance = Math.max(0.05, Math.min(0.65, chance));

    if (Math.random() > chance) {
      return null;
    }

    let positiveChance = 0.58;
    if (profileId === 'casual') positiveChance += 0.12;
    if (profileId === 'hardcore') positiveChance -= 0.12;
    if (loanPrincipal > 0) positiveChance -= 0.08;
    positiveChance = Math.max(0.2, Math.min(0.8, positiveChance));

    const isPositive = Math.random() < positiveChance;
    const positives = [
      {
        id: 'wellness_fair',
        title: 'Feria de bienestar',
        description: 'Mas interes en la clinica hoy.',
        demandDelta: 1,
        dailyCostDelta: 0,
        reputationDelta: 1,
      },
      {
        id: 'supplier_discount',
        title: 'Descuento de proveedor',
        description: 'Costes del dia reducidos.',
        demandDelta: 0,
        dailyCostDelta: -30,
        reputationDelta: 0,
      },
      {
        id: 'referral_wave',
        title: 'Oleada de recomendaciones',
        description: 'Llegan pacientes por boca a boca.',
        demandDelta: 2,
        dailyCostDelta: 0,
        reputationDelta: 1,
      },
      {
        id: 'community_support',
        title: 'Apoyo de la comunidad',
        description: 'Mejor imagen local y mas confianza.',
        demandDelta: 1,
        dailyCostDelta: -15,
        reputationDelta: 2,
      },
    ];
    const negatives = [
      {
        id: 'supply_spike',
        title: 'Subida de suministros',
        description: 'Materiales mas caros hoy.',
        demandDelta: 0,
        dailyCostDelta: 35,
        reputationDelta: 0,
      },
      {
        id: 'cancellation_wave',
        title: 'Cancelaciones de ultima hora',
        description: 'Menos pacientes de lo previsto.',
        demandDelta: -1,
        dailyCostDelta: 0,
        reputationDelta: 0,
      },
      {
        id: 'online_complaint',
        title: 'Queja en redes',
        description: 'Baja puntual de confianza.',
        demandDelta: -1,
        dailyCostDelta: 0,
        reputationDelta: -2,
      },
      {
        id: 'equipment_issue',
        title: 'Ajuste tecnico urgente',
        description: 'Mantenimiento extra no previsto.',
        demandDelta: 0,
        dailyCostDelta: 55,
        reputationDelta: -1,
      },
    ];

    const source = isPositive ? positives : negatives;
    const baseEvent = source[Math.floor(Math.random() * source.length)];
    const positiveScale = profileId === 'casual' ? 1.15 : profileId === 'hardcore' ? 0.9 : 1;
    const negativeScale = profileId === 'casual' ? 0.85 : profileId === 'hardcore' ? 1.25 : 1;
    const scale = isPositive ? positiveScale : negativeScale;

    return {
      ...baseEvent,
      demandDelta: Math.round((baseEvent.demandDelta || 0) * scale),
      dailyCostDelta: Math.round((baseEvent.dailyCostDelta || 0) * scale),
      reputationDelta: Math.round((baseEvent.reputationDelta || 0) * scale),
      tone: isPositive ? 'positive' : 'negative',
      day: currentDay,
    };
  }

  applyDailyEconomicEvent(event) {
    if (!event) return null;

    const demandDelta = event.demandDelta || 0;
    const dailyCostDelta = event.dailyCostDelta || 0;
    const reputationDelta = event.reputationDelta || 0;
    const activeEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      tone: event.tone || 'neutral',
      day: event.day || this.state.currentDay || 1,
      demandDelta,
      dailyCostDelta,
      reputationDelta,
    };

    const history = [...(this.state.dailyEconomicEventHistory || []), activeEvent];
    this.set({
      dailyDemandModifier: demandDelta,
      dailyCostFlatModifier: dailyCostDelta,
      activeDailyEconomicEvent: activeEvent,
      dailyEconomicEventHistory: history.slice(-25),
    });

    if (reputationDelta !== 0) {
      this.updateReputation(reputationDelta);
    }

    return activeEvent;
  }

  getConsultPrice() {
    return this.state.consultPrice || 100;
  }

  adjustConsultPrice(delta = 0) {
    const current = this.getConsultPrice();
    const next = Math.max(60, Math.min(260, Math.round(current + delta)));
    if (next !== current) {
      this.set({ consultPrice: next });
    }
    return next;
  }

  spendMoney(amount) {
    if (!this.canAfford(amount)) return false;
    this.set({ money: this.state.money - amount });
    return true;
  }

  earnMoney(amount) {
    this.set({
      money: this.state.money + amount,
      totalMoneyEarned: this.state.totalMoneyEarned + amount,
    });
  }

  addExperience(xp) {
    const newXp = this.state.experience + xp;
    const xpForNextLevel = this.state.skillLevel * 100;
    if (newXp >= xpForNextLevel) {
      this.set({
        experience: newXp - xpForNextLevel,
        skillLevel: this.state.skillLevel + 1,
      });
    } else {
      this.set({ experience: newXp });
    }
  }

  advanceDay() {
    const newDay = this.state.currentDay + 1;
    const newWeek = Math.ceil(newDay / 7);
    const newMonth = Math.ceil(newDay / 30);
    const newSeason = getSeasonNumber(newDay);
    const decayedFlyerReach = Math.max(0, (this.state.flyerReach || 0) - 2);

    this.checkAndUpdateStreak();
    this.checkAndStartNewSeason();

    this.set({
      currentDay: newDay,
      currentWeek: newWeek,
      currentMonth: newMonth,
      currentSeason: newSeason,
      patientsToday: [],
      dayComplete: false,
      dailyMistakes: 0,
      referredToday: [],
      flyersDoneToday: false,
      flyerReach: decayedFlyerReach,
      dailyDemandModifier: 0,
      dailyCostFlatModifier: 0,
      activeDailyEconomicEvent: null,
    });
  }

  completeWalmerDay(adjustedPatients = 0) {
    if (this.state.hasGraduatedWalmer) {
      return this.state.hasGraduatedWalmer;
    }

    const addDay = adjustedPatients > 0 ? 1 : 0;
    const nextDays = (this.state.walmerDaysCompleted || 0) + addDay;
    const nextAdjusted = (this.state.walmerPatientsAdjusted || 0) + Math.max(0, adjustedPatients);
    const graduated = nextDays >= 3 && nextAdjusted >= 3;

    this.set({
      walmerDaysCompleted: nextDays,
      walmerPatientsAdjusted: nextAdjusted,
      hasGraduatedWalmer: graduated,
      hasCompletedTutorial: graduated ? true : this.state.hasCompletedTutorial,
    });

    return graduated;
  }

  purchaseUpgrade(category, cost) {
    if (!this.canAfford(cost)) return false;
    const upgrades = { ...this.state.upgrades };
    if (typeof upgrades[category] === 'boolean') {
      upgrades[category] = true;
    } else {
      upgrades[category] += 1;
    }
    this.set({ upgrades, money: this.state.money - cost });
    return true;
  }

  purchaseStaff(staffId, cost) {
    if (!this.canAfford(cost)) return false;
    const staff = { ...this.state.staff };
    staff[staffId] = true;
    this.set({ staff, money: this.state.money - cost });
    return true;
  }

  hasStaff(staffId) {
    return this.state.staff[staffId] === true;
  }

  hasCA() {
    return this.state.staff.chiroAssistant === true;
  }

  getHiredChirosCount() {
    let count = 0;
    if (this.state.staff.hireChiro1) count++;
    if (this.state.staff.hireChiro2) count++;
    if (this.state.staff.hireChiro3) count++;
    return count;
  }

  hasAerialView() {
    return this.state.staff.hireChiro1 === true;
  }

  addAppointmentRecord(record) {
    const history = [...(this.state.appointmentHistory || [])];
    history.push({
      patientName: record.patientName || 'Unknown',
      day: record.day || this.state.currentDay,
      condition: record.condition || '',
      payment: record.payment || 0,
      outcome: record.outcome || 'treated',
      score: record.score || 0,
      date: record.date || new Date().toISOString(),
    });
    // Keep max 100 records
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    this.set({ appointmentHistory: history });
  }

  // --- Papers Please-inspired Systems ---

  calculateToolBonus() {
    const upgrades = this.state.upgrades || {};
    let bonus = 0;
    if (upgrades.activator) bonus += 2;
    if (upgrades.dropTable) bonus += 2;
    if (upgrades.flexionTable) bonus += 1.5;
    if (upgrades.ultrasound) bonus += 1;
    if (upgrades.tens) bonus += 1;
    if (upgrades.massageGun) bonus += 1;

    // Skill-track upgrades also improve auto quality.
    bonus += Math.max(0, ((upgrades.cervicalTechnique || 1) - 1) * 0.5);
    bonus += Math.max(0, ((upgrades.thoracicTechnique || 1) - 1) * 0.5);
    bonus += Math.max(0, ((upgrades.lumbarTechnique || 1) - 1) * 0.5);
    bonus += Math.max(0, ((upgrades.diagnostics || 1) - 1) * 0.35);
    return bonus;
  }

  calculateClinicBonus() {
    const clinicLevel = this.state.clinicLevel || 1;
    const decorations = this.state.decorations || {};
    let decorBonus = 0;
    if (decorations.plants) decorBonus += 0.7;
    if (decorations.neonSign) decorBonus += 0.7;
    if (decorations.premiumBed) decorBonus += 1.2;
    return clinicLevel * 1.8 + decorBonus;
  }

  getDemandBaseByDay(day = 1) {
    return getDemandBaseByDayEngine(day);
  }

  getDayQualityPenalty(day = 1) {
    return getDayQualityPenaltyEngine(day);
  }

  getDebtTierForPrincipal(principal = 0) {
    return getDebtTierForPrincipalEngine(principal);
  }

  getDebtTierConfig(tier = 'none') {
    return getDebtTierConfigEngine(tier);
  }

  getEffectiveRescueThreshold(
    profile = this.getEconomyProfileConfig(),
    tier = this.state.debtTier || 'none'
  ) {
    return getEffectiveRescueThresholdEngine(profile, tier);
  }

  resolveAutoTreatment(patient, context = {}) {
    return resolveAutoTreatmentEngine({
      patient,
      skill: this.state.skillLevel || 1,
      reputation: this.state.reputation || 0,
      toolBonus: this.calculateToolBonus(),
      clinicBonus: this.calculateClinicBonus(),
      queuePosition: context.queuePosition || 0,
      queueLength: context.queueLength || 1,
      timeRemaining: context.timeRemaining || context.dayDuration || 240,
      dayDuration: context.dayDuration || 240,
      day: context.day || this.state.currentDay || 1,
      consultPrice: this.state.consultPrice || 100,
    });
  }

  computeDailyDemand(options = {}) {
    const day = options.day || this.state.currentDay || 1;
    const reputation = options.reputation ?? (this.state.reputation || 0);
    const consultPrice = options.consultPrice ?? (this.state.consultPrice || 100);
    const marketing =
      options.marketing ??
      (this.state.paidAdvertisingLevel || 0) + Math.floor((this.state.flyerReach || 0) / 3);
    const profile = this.getEconomyProfileConfig(options.economyProfile);
    const cap = this.getMaxPatientsForCurrentMode();
    const debtTier =
      options.debtTier || this.getDebtTierForPrincipal(this.state.loanPrincipal || 0);
    const temporaryDemandModifier =
      options.dailyDemandModifier ?? (this.state.dailyDemandModifier || 0);

    return computeDailyDemandEngine({
      day,
      reputation,
      consultPrice,
      marketing,
      profileDemandModifier: profile.demandModifier || 0,
      temporaryDemandModifier,
      debtTier,
      cap,
    });
  }

  getSocialMixWeights(reputation = 0, consultPrice = 100, day = 1) {
    return getSocialMixWeightsEngine(reputation, consultPrice, day);
  }

  getWeightedSocialStats(reputation = 0, consultPrice = 100, day = 1) {
    return getWeightedSocialStatsEngine(reputation, consultPrice, day);
  }

  simulateEconomyForecast(days = 30, options = {}) {
    const horizon = Math.max(1, Math.min(365, Math.round(days)));
    const consultPrice = options.consultPrice ?? (this.state.consultPrice || 100);
    const profile = this.getEconomyProfileConfig(options.economyProfile);
    const taxRate = (this.state.monthlyTaxRate || 0.15) * (profile.taxRateMultiplier || 1);
    const clinicLevel = this.state.clinicLevel || 1;
    const skill = this.state.skillLevel || 1;
    const toolBonus = this.calculateToolBonus();
    const clinicBonus = this.calculateClinicBonus();
    const hiredChiros = this.getHiredChirosCount();
    const baseCap = Math.max(2, this.getMaxPatientsForCurrentMode());

    let money = options.startMoney ?? (this.state.money || 0);
    let reputation = options.startReputation ?? (this.state.reputation || 0);
    let monthProfitAccum = options.startMonthProfit ?? (this.state.monthProfitAccum || 0);
    let flyerReach = options.startFlyerReach ?? (this.state.flyerReach || 0);

    let loanPrincipal = this.state.loanPrincipal || 0;
    let loanInstallment = this.state.loanInstallment || 0;
    let loanDaysRemaining = this.state.loanDaysRemaining || 0;
    let debtTier = this.getDebtTierForPrincipal(loanPrincipal);

    let totalDemand = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    let monthlyChargesTotal = 0;
    let rescueCount = 0;

    for (let i = 0; i < horizon; i++) {
      const simDay = (this.state.currentDay || 1) + i;
      const marketing =
        (this.state.paidAdvertisingLevel || 0) + Math.floor(Math.max(0, flyerReach) / 3);
      const baseByDay = this.getDemandBaseByDay(simDay);
      const repInfluence = Math.floor(Math.max(0, reputation) / 180);
      const overpricingPenalty = Math.max(0, Math.round((consultPrice - 100) / 20));
      const debtDemandPenalty = debtTier === 'critical' ? 1 : debtTier === 'standard' ? 0.5 : 0;
      const demand = Math.max(
        1,
        Math.min(
          baseCap,
          Math.round(
            baseByDay +
              repInfluence +
              marketing -
              overpricingPenalty +
              (profile.demandModifier || 0) -
              debtDemandPenalty
          )
        )
      );
      totalDemand += demand;

      const socialStats = this.getWeightedSocialStats(reputation, consultPrice, simDay);
      const avgQueuePenalty = demand - 1 + Math.max(0, demand - 3);
      const avgFatiguePenalty = 5;
      const dayDifficultyPenalty = this.getDayQualityPenalty(simDay);
      const qualityExpected = Math.max(
        0,
        Math.min(
          100,
          50 +
            skill * 4 +
            toolBonus +
            clinicBonus +
            reputation / 40 -
            avgQueuePenalty -
            avgFatiguePenalty -
            dayDifficultyPenalty
        )
      );

      const pGood = Math.max(0.05, Math.min(0.85, (qualityExpected - 60) / 25));
      const pBad = Math.max(0.03, Math.min(0.6, (45 - qualityExpected) / 20));
      const pRegular = Math.max(0.1, 1 - pGood - pBad);
      const qualityMultiplier = pGood * 1.15 + pRegular * 0.95 + pBad * 0.65;

      const expectedPatientIncome = Math.round(
        consultPrice *
          socialStats.paymentMultiplier *
          qualityMultiplier *
          (1 - socialStats.noPayRisk)
      );
      const dayEarnings =
        Math.round(demand * expectedPatientIncome) + (hiredChiros > 0 ? hiredChiros * 250 : 0);
      totalIncome += dayEarnings;

      const fixedCost = Math.round(
        ((this.state.dailyFixedCosts || 120) + (clinicLevel - 1) * 12) *
          (profile.fixedCostMultiplier || 1)
      );
      const variableCost = Math.round(
        ((this.state.dailyVariableCosts || 18) + demand * 5) * (profile.variableCostMultiplier || 1)
      );
      const maintenanceCost = Math.round(
        ((clinicLevel - 1) * 6 + (simDay % 7 === 0 ? 15 : 0)) * (profile.maintenanceMultiplier || 1)
      );
      let staffCost = 0;
      const staff = this.state.staff || {};
      if (staff.chiroAssistant) staffCost += 35;
      if (staff.appointmentAssistant) staffCost += 30;
      if (staff.whatsappManager) staffCost += 20;
      if (staff.multipleCA) staffCost += 45;
      if (staff.hireChiro1) staffCost += 60;
      if (staff.hireChiro2) staffCost += 80;
      if (staff.hireChiro3) staffCost += 100;
      staffCost = Math.round(staffCost * (profile.staffMultiplier || 1));

      const loanPayment =
        loanDaysRemaining > 0 && loanPrincipal > 0 ? Math.min(loanInstallment, loanPrincipal) : 0;
      if (loanPayment > 0) {
        loanPrincipal = Math.max(0, loanPrincipal - loanPayment);
        loanDaysRemaining = Math.max(0, loanDaysRemaining - 1);
        if (loanPrincipal <= 0) {
          loanInstallment = 0;
          loanDaysRemaining = 0;
        }
      }

      const dayExpenses = Math.round(
        fixedCost + variableCost + maintenanceCost + staffCost + loanPayment
      );
      totalExpenses += dayExpenses;

      const dayNet = dayEarnings - dayExpenses;
      monthProfitAccum += dayNet;
      money += dayNet;

      if (money < 0) {
        const debtInterest = computeDebtInterestEngine(money, profile.debtInterestMultiplier || 1);
        money -= debtInterest;
        totalExpenses += debtInterest;
      }

      const rescuePlan = computeDebtRescueEngine({
        money,
        loanPrincipal,
        loanDaysRemaining,
        profile,
        debtTier,
      });
      if (rescuePlan.applied) {
        rescueCount += 1;
        loanPrincipal = rescuePlan.newLoanPrincipal;
        loanDaysRemaining = rescuePlan.days;
        loanInstallment = rescuePlan.newInstallment;
        debtTier = rescuePlan.debtTier;
        money = rescuePlan.targetCash;
      }

      if (simDay % 30 === 0) {
        const rent = Math.round((400 + clinicLevel * 80) * (profile.monthlyRentMultiplier || 1));
        const taxes = Math.round(Math.max(0, monthProfitAccum) * taxRate);
        const monthlyCharge = rent + taxes;
        money -= monthlyCharge;
        monthlyChargesTotal += monthlyCharge;
        monthProfitAccum = 0;
      }

      const repPerPatient =
        2 * socialStats.repMultiplier - pBad * 3 - socialStats.shares.conflictive * pBad * 2;
      reputation = Math.max(0, reputation + demand * repPerPatient);
      flyerReach = Math.max(0, flyerReach - 2);
    }

    const projectedBalance = Math.round(money);
    const averageDailyNet = Math.round((totalIncome - totalExpenses) / Math.max(1, horizon));
    const averageDemand = Math.round((totalDemand / Math.max(1, horizon)) * 10) / 10;
    const rescueRisk =
      rescueCount > 1 || projectedBalance < 0
        ? 'alto'
        : rescueCount === 1 || projectedBalance < 250
          ? 'medio'
          : 'bajo';

    return {
      days: horizon,
      projectedBalance,
      projectedReputation: Math.round(reputation),
      averageDailyNet,
      averageDemand,
      averageDailyIncome: Math.round(totalIncome / Math.max(1, horizon)),
      averageDailyExpenses: Math.round(totalExpenses / Math.max(1, horizon)),
      monthlyChargesTotal: Math.round(monthlyChargesTotal),
      rescueCount,
      rescueRisk,
      projectedLoanPrincipal: Math.round(loanPrincipal),
    };
  }

  getConsultPriceRecommendation(options = {}) {
    const horizon = options.days || 30;
    const priceSteps = options.priceSteps || [80, 100, 120, 140, 160, 180];
    const economyProfile = options.economyProfile || this.state.economyProfile || 'normal';
    const candidates = priceSteps.map((price) => {
      const forecast = this.simulateEconomyForecast(horizon, {
        consultPrice: price,
        economyProfile,
      });
      const rescuePenalty = (forecast.rescueCount || 0) * 800;
      const negativeNetPenalty = Math.max(0, -(forecast.averageDailyNet || 0) * 8);
      const score = (forecast.projectedBalance || 0) - rescuePenalty - negativeNetPenalty;
      return { price, score, forecast };
    });

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0] || null;
    return {
      recommendedPrice: best?.price || this.state.consultPrice || 100,
      currentPrice: this.state.consultPrice || 100,
      bestForecast: best?.forecast || null,
      candidates,
    };
  }

  applyDailyCostsBreakdown(dayEarnings = 0, options = {}) {
    const { clinicLevel, staff, currentDay } = this.state;
    const treatedPatients =
      options.treatedPatientsOverride ?? (this.state.patientsToday || []).length;
    const preview = !!options.preview;
    const commitLoanPayment = !!options.commitLoanPayment;
    const profile = this.getEconomyProfileConfig(options.economyProfile);
    const eventCostDelta = options.dailyCostFlatModifier ?? (this.state.dailyCostFlatModifier || 0);

    return computeDailyCostsEngine({
      clinicLevel,
      currentDay,
      treatedPatients,
      dailyFixedCosts: this.state.dailyFixedCosts || 120,
      dailyVariableCosts: this.state.dailyVariableCosts || 18,
      staff,
      profile,
      eventCostDelta,
      commitLoanPayment: commitLoanPayment && !preview,
      loanPrincipal: this.state.loanPrincipal || 0,
      loanDaysRemaining: this.state.loanDaysRemaining || 0,
      loanInstallment: this.state.loanInstallment || 0,
    });
  }

  getDailyExpenses() {
    return this.applyDailyCostsBreakdown(0, { preview: true });
  }

  addCitation(reason) {
    const todayCitations = (this.state.citationsToday || 0) + 1;
    const totalCitations = (this.state.citations || 0) + 1;
    // First 2 per day are warnings, after that $50 fine each
    const isWarning = todayCitations <= 2;
    const fine = isWarning ? 0 : 50;

    this.set({
      citationsToday: todayCitations,
      citations: totalCitations,
      totalFines: (this.state.totalFines || 0) + fine,
      money: this.state.money - fine,
    });

    return { isWarning, fine, todayCitations, totalCitations };
  }

  processEndOfDay(dayEarnings) {
    const expenses = this.applyDailyCostsBreakdown(dayEarnings, { commitLoanPayment: true });
    const profile = this.getEconomyProfileConfig();
    const netIncome = Math.round(dayEarnings - expenses.total);
    const monthProfitAccum = (this.state.monthProfitAccum || 0) + netIncome;
    // IMPORTANT: money already includes patient income during the day.
    let newMoney = this.state.money - expenses.total;
    let debtInterest = 0;

    if (newMoney < 0) {
      debtInterest = computeDebtInterestEngine(newMoney, profile.debtInterestMultiplier || 1);
      newMoney -= debtInterest;
    }

    // Generate newspaper headline based on performance
    const headlines = [...(this.state.newspaperHeadlines || [])];
    const headline = this.generateHeadline(dayEarnings, expenses.total);
    headlines.push(headline);
    if (headlines.length > 10) headlines.shift();

    const returningPatients = [...(this.state.returningPatients || [])];

    this.set({
      money: newMoney,
      dayEarnings: 0,
      citationsToday: 0,
      newspaperHeadlines: headlines,
      returningPatients,
      clinicDebt: newMoney < 0 ? Math.abs(newMoney) : 0,
      loanPrincipal: expenses.nextLoanPrincipal,
      loanDaysRemaining: expenses.nextLoanDaysRemaining,
      loanInstallment: expenses.nextLoanInstallment,
      debtTier: this.getDebtTierForPrincipal(expenses.nextLoanPrincipal),
      monthProfitAccum,
    });

    const factors = [
      { label: 'Ingresos pacientes', amount: Math.round(dayEarnings) },
      { label: 'Coste fijo diario', amount: -Math.round(expenses.fixedCost) },
      { label: 'Coste variable', amount: -Math.round(expenses.variableCost) },
      { label: 'Salarios', amount: -Math.round(expenses.staffCost) },
      { label: 'Mantenimiento', amount: -Math.round(expenses.maintenanceCost) },
    ];
    if (expenses.eventCostDelta !== 0) {
      factors.push({
        label: expenses.eventCostDelta > 0 ? 'Impacto evento' : 'Bonificacion evento',
        amount: -Math.round(expenses.eventCostDelta),
      });
    }
    if (expenses.loanPayment > 0) {
      factors.push({ label: 'Cuota prestamo', amount: -Math.round(expenses.loanPayment) });
    }
    if (debtInterest > 0) {
      factors.push({ label: 'Interes de deuda', amount: -Math.round(debtInterest) });
    }
    const topFactors = factors.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 3);

    let rescue = null;
    const projectedDebtTier = this.getDebtTierForPrincipal(expenses.nextLoanPrincipal);
    const rescueThreshold = this.getEffectiveRescueThreshold(profile, projectedDebtTier);
    if (newMoney < rescueThreshold) {
      rescue = this.applyDebtRescue();
      newMoney = this.state.money;
    }

    return {
      earnings: Math.round(dayEarnings),
      expenses,
      netIncome,
      newBalance: Math.round(newMoney),
      headline,
      isInDebt: newMoney < 0,
      debtInterest: Math.round(debtInterest),
      topFactors,
      rescue,
      debtTier: this.getDebtTierForPrincipal(this.state.loanPrincipal || 0),
      dailyEvent: this.state.activeDailyEconomicEvent || null,
    };
  }

  applyForcedCost(amount) {
    const cost = Math.max(0, Math.round(amount || 0));
    const nextMoney = this.state.money - cost;
    this.set({
      money: nextMoney,
      clinicDebt: nextMoney < 0 ? Math.abs(nextMoney) : 0,
    });
    return {
      applied: cost,
      newBalance: nextMoney,
      isInDebt: nextMoney < 0,
    };
  }

  applyDebtRescue() {
    const profile = this.getEconomyProfileConfig();
    const money = this.state.money || 0;
    const currentTier = this.getDebtTierForPrincipal(this.state.loanPrincipal || 0);
    const rescuePlan = computeDebtRescueEngine({
      money,
      loanPrincipal: this.state.loanPrincipal || 0,
      loanDaysRemaining: this.state.loanDaysRemaining || 0,
      profile,
      debtTier: currentTier,
    });
    if (!rescuePlan.applied) {
      return rescuePlan;
    }

    this.set({
      money: rescuePlan.targetCash,
      clinicDebt: 0,
      loanPrincipal: rescuePlan.newLoanPrincipal,
      loanInstallment: rescuePlan.newInstallment,
      loanDaysRemaining: rescuePlan.days,
      debtTier: rescuePlan.debtTier,
    });

    return {
      ...rescuePlan,
    };
  }

  addDailyReward(amount) {
    const reward = Math.max(0, Math.round(amount || 0));
    if (reward <= 0) return 0;
    const pending = this.state.pendingDailyReward || 0;
    this.set({ pendingDailyReward: pending + reward });
    return reward;
  }

  claimDailyReward() {
    const pending = Math.max(0, this.state.pendingDailyReward || 0);
    if (pending <= 0) return 0;
    this.set({
      money: this.state.money + pending,
      totalMoneyEarned: this.state.totalMoneyEarned + pending,
      pendingDailyReward: 0,
      streakBonusClaimed: true,
    });
    return pending;
  }

  payLoanEarly(amount = null) {
    const principal = Math.max(0, this.state.loanPrincipal || 0);
    const installment = Math.max(0, this.state.loanInstallment || 0);
    if (principal <= 0 || installment <= 0) {
      return { paid: 0, remainingPrincipal: principal, success: false, reason: 'no_loan' };
    }

    const targetPayment = amount == null ? installment : Math.max(0, Math.round(amount));
    const payment = Math.min(principal, targetPayment);
    if (payment <= 0) {
      return { paid: 0, remainingPrincipal: principal, success: false, reason: 'invalid_amount' };
    }
    if ((this.state.money || 0) < payment) {
      return {
        paid: 0,
        remainingPrincipal: principal,
        success: false,
        reason: 'insufficient_cash',
      };
    }

    const nextPrincipal = Math.max(0, principal - payment);
    const daysRemaining = Math.max(1, this.state.loanDaysRemaining || 1);
    const nextInstallment =
      nextPrincipal > 0 ? Math.max(1, Math.ceil(nextPrincipal / daysRemaining)) : 0;

    this.set({
      money: (this.state.money || 0) - payment,
      loanPrincipal: nextPrincipal,
      loanInstallment: nextInstallment,
      debtTier: this.getDebtTierForPrincipal(nextPrincipal),
      clinicDebt: nextPrincipal > 0 ? this.state.clinicDebt || 0 : 0,
    });

    return {
      paid: payment,
      remainingPrincipal: nextPrincipal,
      remainingInstallment: nextInstallment,
      success: true,
    };
  }

  generateHeadline(earnings, expenses) {
    const day = this.state.currentDay;
    const rep = this.state.reputation;
    const mistakes = this.state.dailyMistakes || 0;
    const patients = (this.state.patientsToday || []).length;

    if (mistakes === 0 && patients > 3) {
      return { day, type: 'positive', key: 'headlinePerfectDay' };
    } else if (mistakes > 3) {
      return { day, type: 'negative', key: 'headlineComplaints' };
    } else if (earnings > expenses * 2) {
      return { day, type: 'positive', key: 'headlineBooming' };
    } else if (earnings < expenses) {
      return { day, type: 'warning', key: 'headlineStruggling' };
    } else if (rep > 500) {
      return { day, type: 'positive', key: 'headlineFamous' };
    } else {
      return { day, type: 'neutral', key: 'headlineRoutine' };
    }
  }

  scheduleReturningPatient(patientName, condition, daysUntilReturn) {
    const returningPatients = [...(this.state.returningPatients || [])];
    returningPatients.push({
      name: patientName,
      condition,
      returnDay: this.state.currentDay + daysUntilReturn,
      scheduled: true,
    });
    if (returningPatients.length > 20) returningPatients.shift();
    this.set({ returningPatients });
  }

  getReturningPatientsForToday() {
    const today = this.state.currentDay;
    return (this.state.returningPatients || []).filter((p) => p.returnDay === today);
  }

  addSatisfiedPatient(name) {
    const list = [...(this.state.satisfiedPatients || [])];
    if (!list.includes(name)) {
      list.push(name);
      if (list.length > 50) list.shift();
      this.set({ satisfiedPatients: list });
    }

    if (this.canPatientRefer()) {
      const referralChance = this.getReferralChance();
      this.addReferredPatient({
        id: `referred_${Date.now()}`,
        name: name,
        referredDate: new Date().toISOString(),
        season: this.state.currentSeason,
      });
    }
  }

  isReturningPatient(name) {
    return (this.state.satisfiedPatients || []).includes(name);
  }

  getGameMode() {
    return this.state.gameMode || 'relaxed';
  }

  getMaxPatientsForCurrentMode() {
    const mode = this.getGameMode();
    const baseMax = this.getMaxPatientsPerDay();

    switch (mode) {
      case 'arcade':
        return 999;
      case 'challenge':
        return Math.max(2, baseMax - 1);
      case 'relaxed':
      default:
        return baseMax;
    }
  }

  getTreatmentTimeMultiplier() {
    const mode = this.getGameMode();
    switch (mode) {
      case 'arcade':
        const speed = this.state.arcadeCurrentSpeed || 1;
        return 1 / speed;
      case 'challenge':
        return 0.7;
      case 'relaxed':
      default:
        return 2;
    }
  }

  getMistakePenalty() {
    const mode = this.getGameMode();
    switch (mode) {
      case 'arcade':
        return 0;
      case 'challenge':
        return 50;
      case 'relaxed':
      default:
        return 0;
    }
  }

  getErrorReputationPenalty() {
    const mode = this.getGameMode();
    switch (mode) {
      case 'arcade':
        return 5;
      case 'challenge':
        return 25;
      case 'relaxed':
      default:
        return 0;
    }
  }

  canContinueAfterFail() {
    const mode = this.getGameMode();
    if (mode === 'challenge') {
      return this.state.challengeRepLost < 100;
    }
    return true;
  }

  recordArcadePatient() {
    if (this.getGameMode() === 'arcade') {
      const newSpeed = Math.min(3, (this.state.arcadePatientsTreated || 0) / 10 + 1);
      this.set({
        arcadePatientsTreated: (this.state.arcadePatientsTreated || 0) + 1,
        arcadeCurrentSpeed: newSpeed,
        totalPatientsHealed: this.state.totalPatientsHealed + 1,
      });
    }
  }

  recordRelaxedPatient() {
    if (this.getGameMode() === 'relaxed') {
      this.set({
        relaxedPatientsTreated: (this.state.relaxedPatientsTreated || 0) + 1,
        totalPatientsHealed: this.state.totalPatientsHealed + 1,
      });
    }
  }

  recordChallengeMistake() {
    if (this.getGameMode() === 'challenge') {
      this.set({
        challengeMistakes: (this.state.challengeMistakes || 0) + 1,
        challengeRepLost: (this.state.challengeRepLost || 0) + this.getErrorReputationPenalty(),
      });
    }
  }

  getArcadeScore() {
    return (this.state.arcadePatientsTreated || 0) * 100;
  }

  async save() {
    try {
      const payload = {
        ...this.state,
        saveSchemaVersion: SAVE_SCHEMA_VERSION,
      };
      await AsyncStorage.setItem(
        SAVE_KEYS[this.currentSlot] || SAVE_KEYS[1],
        JSON.stringify(payload)
      );
      return true;
    } catch (e) {
      console.error('Error saving game:', e);
      return false;
    }
  }

  async load(slotId = 1) {
    try {
      this.currentSlot = slotId;
      const saved = await AsyncStorage.getItem(SAVE_KEYS[slotId]);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = normalizeLoadedState(parsed);
        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error loading game:', e);
      return false;
    }
  }

  async getAvailableSlots() {
    const slots = [1, 2, 3];
    const data = {};
    for (let slot of slots) {
      try {
        const saved = await AsyncStorage.getItem(SAVE_KEYS[slot]);
        if (saved) {
          const parsed = JSON.parse(saved);
          data[slot] = {
            exists: true,
            day: parsed.currentDay,
            reputation: parsed.reputation,
            money: parsed.money,
          };
        } else {
          data[slot] = { exists: false };
        }
      } catch (e) {
        data[slot] = { exists: false };
      }
    }
    return data;
  }

  reset() {
    this.state = { ...DEFAULT_STATE };
    this.notify();
    AsyncStorage.removeItem(SAVE_KEYS[this.currentSlot]);
  }
}

export const gameState = new GameState();
export default gameState;
