import { getDebtTierForPrincipal as getDebtTierForPrincipalEngine } from '../engines/economyEngine';
import { getReputationLevel } from './reputation';

export const SAVE_SCHEMA_VERSION = 2;

export const SAVE_KEYS = {
  1: '@chirohero_save_1',
  2: '@chirohero_save_2',
  3: '@chirohero_save_3',
};

export const DEFAULT_STATE = {
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

export function normalizeLoadedState(parsed = {}) {
  const source = parsed || {};
  const sourceVersion = Number(source.saveSchemaVersion || 1);
  const normalizeVisitRecord = (record = {}) => ({
    id: record.id || `visit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: record.name || record.patientName || 'Paciente',
    condition: record.condition || '',
    score: Math.max(0, Math.min(100, Math.round(record.score || 0))),
    outcome: record.outcome || 'treated',
    payment: Math.round(record.payment || 0),
    socialClass: record.socialClass || 'middle',
    returnChance:
      typeof record.returnChance === 'number' ? Math.max(0, Math.min(1, record.returnChance)) : 0.3,
  });

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
    appointmentHistory: Array.isArray(source.appointmentHistory)
      ? source.appointmentHistory.map((item) => ({
          patientName: item.patientName || item.name || 'Paciente',
          day: item.day || source.currentDay || 1,
          condition: item.condition || '',
          payment: Math.round(item.payment || 0),
          outcome: item.outcome || 'treated',
          score: Math.max(0, Math.min(100, Math.round(item.score || 0))),
          date: item.date || new Date().toISOString(),
        }))
      : [],
    patientsToday: Array.isArray(source.patientsToday)
      ? source.patientsToday.map((item) => normalizeVisitRecord(item))
      : [],
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
