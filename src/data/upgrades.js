// Upgrade shop data

export const TOOL_UPGRADES = [
  {
    id: 'activator',
    name: '🔧 Activador Quiropráctico',
    description: 'Instrumento de impulso para ajustes precisos. +15% efectividad.',
    cost: 800,
    icon: '🔧',
    effect: { adjustmentBonus: 0.15 },
  },
  {
    id: 'dropTable',
    name: '🛏️ Mesa de Caída (Drop Table)',
    description: 'Mesa con secciones que caen para técnica Thompson. +20% efectividad lumbar.',
    cost: 2000,
    icon: '🛏️',
    effect: { lumbarBonus: 0.20 },
  },
  {
    id: 'flexionTable',
    name: '🔄 Mesa Flexión-Distracción',
    description: 'Mesa especializada para problemas discales. +25% efectividad en ciática.',
    cost: 3500,
    icon: '🔄',
    effect: { sciaticaBonus: 0.25 },
  },
  {
    id: 'ultrasound',
    name: '📡 Ultrasonido Terapéutico',
    description: 'Reduce inflamación y dolor. +10% satisfacción del paciente.',
    cost: 1500,
    icon: '📡',
    effect: { satisfactionBonus: 0.10 },
  },
  {
    id: 'tens',
    name: '⚡ TENS Electroterapia',
    description: 'Electroestimulación para alivio del dolor. +10% satisfacción.',
    cost: 1200,
    icon: '⚡',
    effect: { satisfactionBonus: 0.10 },
  },
  {
    id: 'massageGun',
    name: '💆 Pistola de Masaje',
    description: 'Terapia percusiva para contracturas. +15% velocidad de tratamiento.',
    cost: 600,
    icon: '💆',
    effect: { speedBonus: 0.15 },
  },
  // New tools
  {
    id: 'laser',
    name: '🔴 Láser Terapéutico',
    description: 'Láser de baja intensidad para bioestimulación. +20% efectividad en tejidos.',
    cost: 2800,
    icon: '🔴',
    effect: { tissueHealing: 0.20 },
  },
  {
    id: 'thermography',
    name: '🌡️ Termografía Infrarroja',
    description: 'Cámara térmica para detección de inflamaciones. +25% precisión diagnóstica.',
    cost: 4500,
    icon: '🌡️',
    effect: { diagBonus: 0.25 },
  },
  {
    id: 'ergometer',
    name: '🚴 Ergonómetro',
    description: 'Evalúa capacidad funcional y postura. +15% detección de problemas.',
    cost: 3200,
    icon: '🚴',
    effect: { detectionBonus: 0.15 },
  },
  {
    id: 'xray',
    name: '📋 Equipo de Rayos-X',
    description: 'Radiografía digital para diagnóstico por imagen. Desbloquea mini-juego de Rayos-X en consulta.',
    cost: 2000,
    icon: '📋',
    effect: { xrayUnlocked: true, diagBonus: 0.10 },
  },
];

export const CLINIC_UPGRADES = [
  {
    id: 'waitingRoom',
    name: '🪑 Sala de Espera',
    levels: [
      { level: 2, cost: 1000, description: 'Sillas cómodas y revistas. +5% satisfacción.', effect: { satisfactionBonus: 0.05 } },
      { level: 3, cost: 3000, description: 'TV, WiFi y café. +10% satisfacción.', effect: { satisfactionBonus: 0.10 } },
      { level: 4, cost: 8000, description: 'Sala premium con masaje mientras espera. +20% satisfacción.', effect: { satisfactionBonus: 0.20 } },
    ],
  },
  {
    id: 'decoration',
    name: '🖼️ Decoración',
    levels: [
      { level: 2, cost: 500, description: 'Cuadros y plantas. +1 reputación/paciente.', effect: { repBonus: 1 } },
      { level: 3, cost: 2000, description: 'Diseño moderno. +2 reputación/paciente.', effect: { repBonus: 2 } },
      { level: 4, cost: 5000, description: 'Clínica de lujo. +5 reputación/paciente.', effect: { repBonus: 5 } },
    ],
  },
  {
    id: 'lighting',
    name: '💡 Iluminación',
    levels: [
      { level: 2, cost: 400, description: 'Luz cálida ambiental. +5% satisfacción.', effect: { satisfactionBonus: 0.05 } },
      { level: 3, cost: 1500, description: 'Iluminación regulable. +10% satisfacción.', effect: { satisfactionBonus: 0.10 } },
      { level: 4, cost: 4000, description: 'Cromoterapia LED. +15% satisfacción.', effect: { satisfactionBonus: 0.15 } },
    ],
  },
];

export const SKILL_UPGRADES = [
  {
    id: 'cervicalTechnique',
    name: '🦴 Técnica Cervical',
    levels: [
      { level: 2, cost: 1000, description: 'Ajuste cervical diversificado. Desbloquea nuevas zonas.', effect: { cervicalBonus: 0.2 } },
      { level: 3, cost: 3000, description: 'Técnica Gonstead cervical. +30% efectividad.', effect: { cervicalBonus: 0.3 } },
      { level: 4, cost: 8000, description: 'Maestría cervical. +50% efectividad.', effect: { cervicalBonus: 0.5 } },
    ],
  },
  {
    id: 'thoracicTechnique',
    name: '🫁 Técnica Torácica',
    levels: [
      { level: 2, cost: 1000, description: 'Ajuste torácico en decúbito. Mejora costillas.', effect: { thoracicBonus: 0.2 } },
      { level: 3, cost: 3000, description: 'Técnica de drop torácica. +30% efectividad.', effect: { thoracicBonus: 0.3 } },
      { level: 4, cost: 8000, description: 'Maestría torácica. +50% efectividad.', effect: { thoracicBonus: 0.5 } },
    ],
  },
  {
    id: 'lumbarTechnique',
    name: '🦿 Técnica Lumbar',
    levels: [
      { level: 2, cost: 1000, description: 'Ajuste lumbar en decúbito lateral. Más precisión.', effect: { lumbarBonus: 0.2 } },
      { level: 3, cost: 3000, description: 'Técnica SOT lumbar. +30% efectividad.', effect: { lumbarBonus: 0.3 } },
      { level: 4, cost: 8000, description: 'Maestría lumbar. +50% efectividad.', effect: { lumbarBonus: 0.5 } },
    ],
  },
  {
    id: 'palpation',
    name: '🤲 Palpación',
    levels: [
      { level: 2, cost: 800, description: 'Mejor detección de subluxaciones. +10% precisión.', effect: { detectionBonus: 0.1 } },
      { level: 3, cost: 2500, description: 'Palpación avanzada. Muestra guías en tratamiento.', effect: { detectionBonus: 0.2 } },
      { level: 4, cost: 6000, description: 'Manos de oro. Zona de acierto más grande.', effect: { detectionBonus: 0.3 } },
    ],
  },
  {
    id: 'diagnostics',
    name: '🔍 Diagnóstico',
    levels: [
      { level: 2, cost: 800, description: 'Mejor detección de red flags. +10% precisión referral.', effect: { diagBonus: 0.1 } },
      { level: 3, cost: 2500, description: 'Diagnóstico diferencial avanzado. Muestra pistas.', effect: { diagBonus: 0.2 } },
      { level: 4, cost: 6000, description: 'Diagnóstico experto. Nunca fallas una derivación.', effect: { diagBonus: 0.3 } },
    ],
  },
];

export const CLINIC_EXPANSION = [
  {
    level: 2,
    name: '🏥 Clínica Mediana',
    cost: 10000,
    description: 'Doble sala de tratamiento. +2 pacientes/día.',
    patientsBonus: 2,
  },
  {
    level: 3,
    name: '🏢 Clínica Grande',
    cost: 30000,
    description: 'Triple sala + recepción. +4 pacientes/día. Recepcionista.',
    patientsBonus: 4,
  },
  {
    level: 4,
    name: '🏛️ Centro Quiropráctico Premium',
    cost: 80000,
    description: 'Centro completo con múltiples profesionales. +6 pacientes/día. Atrae VIPs.',
    patientsBonus: 6,
  },
];

export const TRAVEL_EVENTS = [
  {
    id: 'olympics',
    name: '🏅 Juegos Olímpicos',
    cost: 5000,
    minReputation: 50,
    description: 'Viaja como quiropráctico del equipo olímpico.',
    reward: { money: 15000, reputation: 30, xp: 500 },
  },
  {
    id: 'boxing',
    name: '🥊 Campeonato Mundial de Boxeo',
    cost: 3000,
    minReputation: 40,
    description: 'Atiende a boxeadores profesionales en Las Vegas.',
    reward: { money: 10000, reputation: 20, xp: 300 },
  },
  {
    id: 'kickboxing',
    name: '🦵 Torneo Internacional de Kickboxing',
    cost: 2500,
    minReputation: 35,
    description: 'Quiropráctico oficial del torneo de kickboxing.',
    reward: { money: 8000, reputation: 15, xp: 250 },
  },
  {
    id: 'tennis',
    name: '🎾 Grand Slam',
    cost: 4000,
    minReputation: 45,
    description: 'Atiende a tenistas en un Grand Slam.',
    reward: { money: 12000, reputation: 25, xp: 400 },
  },
  {
    id: 'f1',
    name: '🏎️ Gran Premio de F1',
    cost: 6000,
    minReputation: 60,
    description: 'Quiropráctico del paddock de Fórmula 1.',
    reward: { money: 20000, reputation: 40, xp: 600 },
  },
  // New international events
  {
    id: 'worldcup',
    name: '⚽ Copa Mundial de Fútbol',
    cost: 8000,
    minReputation: 70,
    description: 'Quiropráctico de la selección champion.',
    reward: { money: 25000, reputation: 50, xp: 700 },
  },
  {
    id: 'ny_marathon',
    name: '🏃 Maratón de Nueva York',
    cost: 3500,
    minReputation: 40,
    description: 'Atención a corredores de élite en la gran carrera.',
    reward: { money: 9000, reputation: 20, xp: 280 },
  },
  {
    id: 'wimbledon',
    name: '🎾 Campeonato de Wimbledon',
    cost: 4500,
    minReputation: 50,
    description: 'El torneo de tenis más prestigioso del mundo.',
    reward: { money: 13000, reputation: 28, xp: 420 },
  },
  {
    id: 'superbowl',
    name: '🏈 Super Bowl',
    cost: 10000,
    minReputation: 80,
    description: 'El evento deportivo más visto de Estados Unidos.',
    reward: { money: 35000, reputation: 60, xp: 900 },
  },
  {
    id: 'carnival',
    name: '🎭 Carnaval de Río de Janeiro',
    cost: 5500,
    minReputation: 55,
    description: 'Viaja al mayor espectáculo de la Tierra.',
    reward: { money: 16000, reputation: 35, xp: 520 },
  },
  {
    id: 'expo',
    name: '🌐 Expo Universal',
    cost: 7000,
    minReputation: 65,
    description: 'Evento internacional de innovación y cultura.',
    reward: { money: 20000, reputation: 45, xp: 650 },
  },
];

export const DECORATION_UPGRADES = [
  {
    id: 'plants',
    name: '🌿 Plantas y Monsteras',
    description: 'Ambiente relajante. Reduce multas de inspección un 25%.',
    cost: 500,
    icon: '🌿',
    type: 'decoration',
  },
  {
    id: 'neonSign',
    name: '💡 Letrero Neón "RELAX"',
    description: 'Mejor ambiente. El combo dura 1 segundo más.',
    cost: 1500,
    icon: '💡',
    type: 'decoration',
  },
  {
    id: 'premiumBed',
    name: '🛏️ Camilla de Lujo Pro',
    description: 'Máximo confort. +15% de ingresos por paciente.',
    cost: 4000,
    icon: '🛏️',
    type: 'decoration',
  },
  {
    id: 'waterFountain',
    name: '⛲ Fuente de Agua Zen',
    description: 'Paz absoluta. Aumenta repetición de pacientes +10%.',
    cost: 2500,
    icon: '⛲',
    type: 'decoration',
  },
  // New decorations
  {
    id: 'aquarium',
    name: '🐠 Pecera Decorativa',
    description: 'Pecera con peces tropicales. Reduce ansiedad del paciente +20%.',
    cost: 1800,
    icon: '🐠',
    type: 'decoration',
  },
  {
    id: 'coffeeMachine',
    name: '☕ Máquina de Café Premium',
    description: 'Café de calidad para pacientes. +15% satisfacción y propinas.',
    cost: 2200,
    icon: '☕',
    type: 'decoration',
  },
  {
    id: 'diploma',
    name: '🏆 Cuadro con Diplomas',
    description: 'Certificaciones visibles. +10% confianza del paciente.',
    cost: 800,
    icon: '🏆',
    type: 'decoration',
  },
  {
    id: 'snackMachine',
    name: '🍫 Máquina de Snacks',
    description: 'Snacks saludables para esperar. +8% satisfacción.',
    cost: 1200,
    icon: '🍫',
    type: 'decoration',
  },
  {
    id: 'gameConsole',
    name: '🎮 Consola de Videojuegos',
    description: 'TV con consola en sala de espera. +12% satisfacción.',
    cost: 3000,
    icon: '🎮',
    type: 'decoration',
  },
  {
    id: 'largePlant',
    name: '🌴 Palmea Ornamental',
    description: 'Planta grande de oficina. +10% ambiente premium.',
    cost: 600,
    icon: '🌴',
    type: 'decoration',
  },
];
