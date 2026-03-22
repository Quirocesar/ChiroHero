// Daily missions system for ChiroHero
import AsyncStorage from '@react-native-async-storage/async-storage';

const MISSION_STORAGE_KEY = '@chirohero_daily_missions';
const MISSION_RESET_KEY = '@chirohero_mission_reset';

const MISSION_TYPES = [
  {
    id: 'treat_patients',
    nameTemplate: 'Atiende {count} pacientes',
    description: 'Treat a certain number of patients today',
    flavorTexts: [
      'Los pacientes no se tratan solos... aunque a veces lo intentan',
      'Hay gente con dolor de espalda esperando por ti',
      'Cada paciente es una espalda nueva por crujir',
      'Tu sala de espera parece la cola del supermercado',
    ],
    parameters: ['count'],
    generate: (day, skillLevel) => {
      const targetCount = Math.min(3 + Math.floor(skillLevel / 3), 8);
      return {
        targetCount,
        currentCount: 0,
        type: 'treat_patients',
        name: `Atiende ${targetCount} pacientes`,
      };
    },
  },
  {
    id: 'earn_money',
    nameTemplate: 'Gana ${amount}',
    description: 'Earn a certain amount of money today',
    flavorTexts: [
      'El alquiler no se paga solo',
      'Tu cuenta bancaria llora de alegría',
      'Dinero bien ganado... crujiendo espaldas',
      'Hoy toca llenar la hucha vertebral',
    ],
    parameters: ['amount'],
    generate: (day, skillLevel) => {
      const targetAmount = 300 + day * 20 + skillLevel * 50;
      return {
        targetAmount,
        currentAmount: 0,
        type: 'earn_money',
        name: `Gana $${targetAmount}`,
      };
    },
  },
  {
    id: 'perfect_treatment',
    name: 'No cometas errores',
    description: 'Complete treatments without mistakes today',
    flavorTexts: [
      'Cero errores. Como un cirujano... pero con más cracks',
      'La perfección no existe... ¿o sí?',
      'Hoy no hay margen de error. Presión, ¿qué presión?',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: Math.min(2 + Math.floor(skillLevel / 4), 5),
      currentCount: 0,
      type: 'perfect_treatment',
    }),
  },
  {
    id: 'use_tool',
    nameTemplate: 'Usa herramienta {count} veces',
    description: 'Use a specific tool today',
    flavorTexts: [
      'Un buen quiropráctico conoce sus herramientas',
      'Las herramientas no se usan solas... todavía',
      'Hora de sacar el arsenal quiropráctico',
    ],
    parameters: ['toolId'],
    generate: (day, skillLevel) => {
      const tools = ['activator', 'massageGun', 'ultrasound', 'tens'];
      const toolId = tools[Math.floor(Math.random() * tools.length)];
      const targetCount = 3 + Math.floor(skillLevel / 2);
      return {
        targetCount,
        currentCount: 0,
        type: 'use_tool',
        toolId,
        name: `Usa herramienta ${targetCount} veces`,
      };
    },
  },
  {
    id: 'refer_cases',
    nameTemplate: 'Deriva {count} pacientes',
    description: 'Correctly refer patients with red flags today',
    flavorTexts: [
      'A veces la valentía es saber cuándo NO tratar',
      'Derivar también es curar... filosofía quiropráctica',
      'No todo paciente es para ti, y está bien',
    ],
    parameters: [],
    generate: (day, skillLevel) => {
      const targetCount = Math.min(1 + Math.floor(skillLevel / 5), 3);
      return {
        targetCount,
        currentCount: 0,
        type: 'refer_cases',
        name: `Deriva ${targetCount} pacientes`,
      };
    },
  },
  {
    id: 'vip_patient',
    name: 'Atiende paciente VIP',
    description: 'Treat a VIP patient today',
    flavorTexts: [
      'Hoy viene alguien importante. No la pifies',
      'Paciente VIP detectado. Ponte la bata buena',
      'Los famosos también tienen dolor de espalda',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: 1,
      currentCount: 0,
      type: 'vip_patient',
    }),
  },
  // === NEW MISSION TYPES ===
  {
    id: 'difficulty_challenge',
    name: 'Tratamientos difíciles',
    description: 'Treat patients with difficult conditions',
    flavorTexts: [
      'Los casos fáciles son para principiantes',
      'Hoy toca sudar la bata. Casos complicados al frente',
      'Si fuera fácil, cualquiera sería quiropráctico',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: Math.min(1 + Math.floor(skillLevel / 4), 3),
      currentCount: 0,
      type: 'difficulty_challenge',
    }),
  },
  {
    id: 'speed_treatment',
    name: 'Tratamiento rápido',
    description: 'Complete treatments within time limit',
    flavorTexts: [
      'Rápido pero bien. Bueno, sobre todo rápido',
      'El reloj corre y las espaldas no esperan',
      'Velocidad y precisión: el combo del quiropráctico ninja',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: Math.min(2 + Math.floor(skillLevel / 3), 5),
      currentCount: 0,
      type: 'speed_treatment',
    }),
  },
  {
    id: 'combo_mission',
    nameTemplate: 'Encadena {count} combos',
    description: 'Get a combo streak during treatments',
    flavorTexts: [
      '¡Esto no es un juego! Ah, espera, sí lo es',
      'Combo tras combo. Tus dedos están en llamas',
      'Encadena ajustes como si fuera un videojuego... que lo es',
    ],
    parameters: [],
    generate: (day, skillLevel) => {
      const targetCount = Math.min(3 + Math.floor(skillLevel / 2), 8);
      return {
        targetCount,
        currentCount: 0,
        type: 'combo_mission',
        name: `Encadena ${targetCount} combos`,
      };
    },
  },
  {
    id: 'zone_expert',
    name: 'Experto en zona',
    description: 'Treat all zones in a single session',
    flavorTexts: [
      'De la cervical al lumbar, hoy toca recorrido completo',
      'Conoce cada zona como la palma de tu mano',
      'Tour completo por la columna. Sin paradas',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: 4,
      currentCount: 0,
      type: 'zone_expert',
    }),
  },
  {
    id: 'no_referrals',
    name: 'Sin derivaciones',
    description: 'Complete all treatments without referring patients',
    flavorTexts: [
      'Hoy los resuelves todos tú solito',
      'Sin derivaciones. Todo pasa por tus manos',
      'Eres el principio y el fin del tratamiento',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: Math.min(2 + Math.floor(skillLevel / 3), 4),
      currentCount: 0,
      type: 'no_referrals',
    }),
  },
  {
    id: 'special_patient',
    name: 'Paciente especial',
    description: 'Treat a patient with a special condition',
    flavorTexts: [
      'Este paciente es... diferente. Buena suerte',
      'Caso especial detectado. Ajusta tu estrategia',
      'No todos los días llega alguien así a tu consulta',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: 1,
      currentCount: 0,
      type: 'special_patient',
    }),
  },
  {
    id: 'clinic_upgrade',
    name: 'Mejora tu clínica',
    description: 'Purchase an upgrade for your clinic',
    flavorTexts: [
      'Tu clínica necesita un lavado de cara',
      'Invertir en tu clínica es invertir en espaldas felices',
      'Hora de gastar esos ahorros en algo útil',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetCount: 1,
      currentCount: 0,
      type: 'clinic_upgrade',
    }),
  },
  {
    id: 'earn_reputation',
    name: 'Gana reputación',
    description: 'Earn reputation points today',
    flavorTexts: [
      'La fama no se construye sola... o sí, si eres bueno',
      'Haz que hablen bien de ti. O al menos que hablen',
      'Reputación: lo que te separa de ser "ese raro que cruje cosas"',
    ],
    parameters: [],
    generate: (day, skillLevel) => ({
      targetAmount: 10 + day * 2 + skillLevel * 5,
      currentAmount: 0,
      type: 'earn_reputation',
    }),
  },
];

const MISSION_REWARDS = {
  easy: { money: 200, xp: 50, reputation: 2 },
  medium: { money: 400, xp: 100, reputation: 5 },
  hard: { money: 800, xp: 200, reputation: 10 },
};

function getDifficultyForMission(missionType) {
  switch (missionType) {
    case 'treat_patients':
    case 'use_tool':
      return 'easy';
    case 'earn_money':
    case 'perfect_treatment':
      return 'medium';
    case 'refer_cases':
    case 'vip_patient':
      return 'hard';
    default:
      return 'easy';
  }
}

function getTodayKey() {
  const today = new Date();
  return `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
}

async function getStoredMissions() {
  try {
    const stored = await AsyncStorage.getItem(MISSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

async function saveMissions(missions) {
  try {
    await AsyncStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(missions));
  } catch (e) {
    console.error('Error saving missions:', e);
  }
}

export async function generateDailyMissions(day = 1, skillLevel = 1) {
  const todayKey = getTodayKey();
  const savedMissions = await getStoredMissions();
  
  if (savedMissions && savedMissions.dateKey === todayKey) {
    return savedMissions.missions;
  }

  const shuffled = [...MISSION_TYPES].sort(() => Math.random() - 0.5);
  const selectedTypes = shuffled.slice(0, 3);

  const missions = selectedTypes.map(type => {
    const missionGenerator = type.generate(day, skillLevel);
    const difficulty = getDifficultyForMission(missionGenerator.type);

    return {
      ...missionGenerator,
      id: `mission_${missionGenerator.type}_${Date.now()}_${Math.random()}`,
      name: missionGenerator.name || type.nameTemplate || type.name,
      description: type.description,
      difficulty,
      reward: MISSION_REWARDS[difficulty],
      completed: false,
      claimed: false,
    };
  });

  const missionData = { dateKey: todayKey, missions };
  saveMissions(missionData);
  return missions;
}

export function updateMissionProgress(missions, eventType, eventData = {}) {
  const todayKey = getTodayKey();
  
  const updatedMissions = missions.map(mission => {
    if (mission.completed || mission.claimed) {
      return mission;
    }

    let updated = { ...mission };

    switch (eventType) {
      case 'patient_treated':
        if (mission.type === 'treat_patients') {
          updated.currentCount = (mission.currentCount || 0) + 1;
        }
        if (mission.type === 'earn_money' && eventData.payment) {
          updated.currentAmount = (mission.currentAmount || 0) + eventData.payment;
        }
        break;

      case 'perfect_treatment':
        if (mission.type === 'perfect_treatment') {
          updated.currentCount = (mission.currentCount || 0) + 1;
        }
        break;

      case 'tool_used':
        if (mission.type === 'use_tool' && mission.toolId === eventData.toolId) {
          updated.currentCount = (mission.currentCount || 0) + 1;
        }
        break;

      case 'patient_referred':
        if (mission.type === 'refer_cases') {
          updated.currentCount = (mission.currentCount || 0) + 1;
        }
        break;

      case 'vip_treated':
        if (mission.type === 'vip_patient') {
          updated.currentCount = (mission.currentCount || 0) + 1;
        }
        break;
    }

    if (mission.type === 'treat_patients' || mission.type === 'perfect_treatment' || 
        mission.type === 'refer_cases' || mission.type === 'vip_patient') {
      if (updated.currentCount >= mission.targetCount) {
        updated.completed = true;
      }
    } else if (mission.type === 'earn_money') {
      if (updated.currentAmount >= mission.targetAmount) {
        updated.completed = true;
      }
    } else if (mission.type === 'use_tool') {
      if (updated.currentCount >= mission.targetCount) {
        updated.completed = true;
      }
    }

    return updated;
  });

  saveMissions({ dateKey: todayKey, missions: updatedMissions });
  return updatedMissions;
}

export function claimMissionReward(missions, missionId) {
  const todayKey = getTodayKey();
  
  const updatedMissions = missions.map(mission => {
    if (mission.id === missionId && mission.completed && !mission.claimed) {
      return { ...mission, claimed: true };
    }
    return mission;
  });

  saveMissions({ dateKey: todayKey, missions: updatedMissions });
  return updatedMissions;
}

export function getMissionProgress(missions) {
  const completed = missions.filter(m => m.completed).length;
  const claimed = missions.filter(m => m.claimed).length;
  const total = missions.length;

  return {
    completed,
    claimed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function checkAndResetMissions() {
  try {
    const lastReset = await AsyncStorage.getItem(MISSION_RESET_KEY);
    const today = new Date();
    const todayStr = today.toDateString();

    if (lastReset !== todayStr) {
      const newMissions = generateDailyMissions(1, 1);
      await AsyncStorage.setItem(MISSION_RESET_KEY, todayStr);
      return { reset: true, missions: newMissions };
    }

    return { reset: false, missions: null };
  } catch (e) {
    return { reset: false, missions: null };
  }
}

export { MISSION_TYPES, MISSION_REWARDS };
