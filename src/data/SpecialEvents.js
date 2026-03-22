// Special Events System for ChiroHero

export const SPECIAL_EVENTS = {
  MYSTERIOUS_PATIENT: {
    id: 'mysteriousPatient',
    name: 'mysteriousPatient',
    icon: '🔮',
    description: 'mysteriousPatientDesc',
    type: 'weekly',
    duration: 7,
    requirements: { minDay: 10, minRep: 100 },
    rewards: { money: 5000, reputation: 500, exclusive: 'mysteryCase' },
    spawnRate: 0.15,
  },
  OPEN_HOUSE: {
    id: 'openHouse',
    name: 'openHouse',
    icon: '🏠',
    description: 'openHouseDesc',
    type: 'special',
    duration: 1,
    requirements: { minDay: 5, minRep: 50 },
    rewards: { money: 3000, reputation: 300, patients: 10 },
    spawnRate: 0.1,
  },
  RIVAL_CLINIC: {
    id: 'rivalClinic',
    name: 'rivalClinic',
    icon: '⚔️',
    description: 'rivalClinicDesc',
    type: 'narrative',
    duration: 14,
    requirements: { minDay: 30, minRep: 500 },
    rewards: { money: 8000, reputation: -200, exclusive: 'rivalDefeated' },
    spawnRate: 0.05,
    narrative: {
      intro: 'rivalClinicIntro',
      middle: 'rivalClinicMiddle',
      conclusion: 'rivalClinicConclusion',
    },
  },
  STORM: {
    id: 'storm',
    name: 'stormEvent',
    icon: '⛈️',
    description: 'stormEventDesc',
    type: 'weather',
    duration: 3,
    requirements: { minDay: 1, minRep: 0 },
    rewards: { money: 1000, reputation: 100 },
    effects: {
      patientDelay: 1.5,
      patienceReduction: 0.3,
      accidentChance: 0.2,
    },
    spawnRate: 0.08,
  },
  RAIN: {
    id: 'rain',
    name: 'rainEvent',
    icon: '🌧️',
    description: 'rainEventDesc',
    type: 'weather',
    duration: 2,
    requirements: { minDay: 1, minRep: 0 },
    rewards: { money: 500, reputation: 50 },
    effects: {
      patientDelay: 1.2,
      patienceReduction: 0.15,
    },
    spawnRate: 0.12,
  },
  // === NEW CONTENT: 5 Additional Special Events ===
  RAINY_DAY: {
    id: 'rainyDay',
    name: 'rainyDayEvent',
    icon: '🌧️',
    description: 'rainyDayEventDesc',
    type: 'weather',
    duration: 1,
    requirements: { minDay: 3, minRep: 0 },
    rewards: { money: 800, reputation: 75 },
    effects: {
      patientReduction: 0.4,
      paymentMultiplier: 1.5,
      patienceBonus: 0.2,
    },
    spawnRate: 0.10,
  },
  LOCAL_COMPETITION: {
    id: 'localCompetition',
    name: 'localCompetitionEvent',
    icon: '⚔️',
    description: 'localCompetitionEventDesc',
    type: 'narrative',
    duration: 7,
    requirements: { minDay: 15, minRep: 200 },
    rewards: { money: 5000, reputation: 400, exclusive: 'competitionVictor' },
    effects: {
      reputationDrain: 0.1,
      patientStealChance: 0.15,
      qualityBonusMultiplier: 1.3,
    },
    spawnRate: 0.06,
    narrative: {
      intro: 'localCompetitionIntro',
      middle: 'localCompetitionMiddle',
      conclusion: 'localCompetitionConclusion',
    },
  },
  MYSTERY_PATIENT: {
    id: 'mysteryPatient',
    name: 'mysteryPatientEvent',
    icon: '🕵️',
    description: 'mysteryPatientEventDesc',
    type: 'special',
    duration: 1,
    requirements: { minDay: 10, minRep: 150 },
    rewards: { money: 3000, reputation: 500 },
    effects: {
      inspectorMode: true,
      qualityCheckMultiplier: 2.0,
      reputationRisk: 0.3,
    },
    spawnRate: 0.07,
    outcomes: {
      success: { money: 5000, reputation: 800, message: 'mysteryPatientSuccess' },
      failure: { money: -1000, reputation: -300, message: 'mysteryPatientFailure' },
    },
  },
  EQUIPMENT_DONATION: {
    id: 'equipmentDonation',
    name: 'equipmentDonationEvent',
    icon: '🎁',
    description: 'equipmentDonationEventDesc',
    type: 'special',
    duration: 1,
    requirements: { minDay: 7, minRep: 100 },
    rewards: { money: 0, reputation: 200, freeUpgrade: true },
    effects: {
      freeUpgradeChance: 0.5,
      upgradeDiscount: 0.3,
    },
    spawnRate: 0.05,
  },
  HEALTH_DAY: {
    id: 'healthDay',
    name: 'healthDayEvent',
    icon: '💚',
    description: 'healthDayEventDesc',
    type: 'special',
    duration: 1,
    requirements: { minDay: 5, minRep: 50 },
    rewards: { money: 2000, reputation: 300 },
    effects: {
      xpMultiplier: 2.0,
      patientBonus: 3,
      reputationGainMultiplier: 1.5,
    },
    spawnRate: 0.08,
  },
};

export const MYSTERIOUS_PATIENT_CASES = [
  {
    id: 'complex_case_1',
    name: 'Profesional corporativo',
    age: 45,
    occupation: 'Ejecutivo',
    symptoms: [
      'Dolor de cabeza crónico',
      'Mareos matutinos',
      'Rigidez en el cuello',
      'Fatiga extrema',
    ],
    conditions: {
      previousTreatments: 'Medicamentos para el dolor',
      medicalHistory: 'Hipertensión',
      lifestyle: 'Trabajo sedentario, muchas horas frente al ordenador',
    },
    correctDiagnosis: 'Síndrome de fatiga crónica',
    redFlags: ['mareosMatutinos', 'fatigaExtrema'],
    treatment: 'Derivar a especialista',
    difficulty: 'hard',
  },
  {
    id: 'complex_case_2',
    name: 'Atleta profesional',
    age: 28,
    occupation: 'Corredor',
    symptoms: [
      'Dolor lumbar recurrente',
      'Hormigueo en piernas',
      'Debilidad muscular',
      'Dificultad para caminar largas distancias',
    ],
    conditions: {
      previousTreatments: 'Fisioterapia',
      medicalHistory: 'Lesiones deportivas previas',
      lifestyle: 'Entrenamiento intensivo',
    },
    correctDiagnosis: 'Estenosis espinal lumbar',
    redFlags: ['debilidadMuscular', 'dificultadCaminar'],
    treatment: 'Derivar a especialista',
    difficulty: 'hard',
  },
  {
    id: 'complex_case_3',
    name: 'Maestra',
    age: 52,
    occupation: 'Profesora',
    symptoms: [
      'Dolor en ambos brazos',
      'Entumecimiento en manos',
      'Debilidad al sostener objetos',
      'Dolor que empeora por la noche',
    ],
    conditions: {
      previousTreatments: 'Antiinflamatorios',
      medicalHistory: 'Diabetes tipo 2',
      lifestyle: 'Trabajo de escritura continua',
    },
    correctDiagnosis: 'Síndrome del túnel carpiano severo',
    redFlags: ['diabetes', 'empeoraNoche'],
    treatment: 'Derivar a especialista',
    difficulty: 'medium',
  },
];

export function checkEventTrigger(gameState) {
  const currentDay = gameState.currentDay;
  const reputation = gameState.reputation;
  const availableEvents = [];

  Object.values(SPECIAL_EVENTS).forEach((event) => {
    if (currentDay >= event.requirements.minDay && reputation >= event.requirements.minRep) {
      if (Math.random() < event.spawnRate) {
        if (!gameState.activeEvents?.find(e => e.id === event.id)) {
          availableEvents.push(event);
        }
      }
    }
  });

  if (availableEvents.length > 0) {
    return availableEvents[Math.floor(Math.random() * availableEvents.length)];
  }

  return null;
}

export function activateEvent(event, gameState) {
  const eventData = {
    ...event,
    startDay: gameState.currentDay,
    endDay: gameState.currentDay + event.duration,
  };

  gameState.set({
    activeEvents: [...(gameState.activeEvents || []), eventData],
  });

  return eventData;
}

export function getEventEffect(eventId) {
  const event = SPECIAL_EVENTS[eventId];
  if (!event || !event.effects) return null;
  return event.effects;
}

export function checkEventEnd(event, currentDay) {
  return currentDay >= event.endDay;
}

export function completeEvent(event, gameState) {
  const rewards = event.rewards || {};
  
  if (rewards.money) {
    gameState.earnMoney(rewards.money);
  }
  if (rewards.reputation) {
    gameState.updateReputation(rewards.reputation);
  }

  gameState.set({
    activeEvents: (gameState.activeEvents || []).filter(e => e.id !== event.id),
    completedEvents: [...(gameState.completedEvents || []), {
      ...event,
      completedDay: gameState.currentDay,
    }],
  });

  return rewards;
}

export function getMysteriousPatient() {
  return MYSTERIOUS_PATIENT_CASES[Math.floor(Math.random() * MYSTERIOUS_PATIENT_CASES.length)];
}

export function calculateOpenHousePatients(basePatients, gameState) {
  const multiplier = 2 + Math.floor(gameState.clinicLevel / 2);
  return basePatients * multiplier;
}

export function handleRivalClinic(gameState, rivalProgress) {
  const playerQuality = gameState.skillLevel + (gameState.reputation / 1000);
  const rivalQuality = rivalProgress;

  if (playerQuality > rivalQuality) {
    gameState.updateReputation(100);
    gameState.earnMoney(2000);
    return { outcome: 'victory', message: 'rivalDefeated' };
  } else if (playerQuality > rivalQuality * 0.7) {
    return { outcome: 'draw', message: 'rivalStalemate' };
  } else {
    gameState.updateReputation(-150);
    return { outcome: 'defeat', message: 'rivalLost' };
  }
}

export function applyWeatherEffects(baseTime, event) {
  const effects = getEventEffect(event.id);
  if (!effects) return baseTime;
  return baseTime * (effects.patientDelay || 1);
}

export function applyPatienceEffects(basePatience, event) {
  const effects = getEventEffect(event.id);
  if (!effects) return basePatience;
  return basePatience * (1 - (effects.patienceReduction || 0));
}

export default {
  SPECIAL_EVENTS,
  MYSTERIOUS_PATIENT_CASES,
  checkEventTrigger,
  activateEvent,
  getEventEffect,
  checkEventEnd,
  completeEvent,
  getMysteriousPatient,
  calculateOpenHousePatients,
  handleRivalClinic,
  applyWeatherEffects,
  applyPatienceEffects,
};
