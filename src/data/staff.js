// Staff and CA (Chiropractic Assistant) upgrade data
import i18n from '../utils/i18n';

export const STAFF_UPGRADES = [
  {
    id: 'whatsappManager',
    name: 'whatsappManager',
    icon: '📱',
    cost: 300,
    level: 1,
    description: 'whatsappManagerDesc',
    effect: { bookingSystem: 'whatsapp' },
  },
  {
    id: 'appointmentAssistant',
    name: 'appointmentAssistant',
    icon: '💻',
    cost: 1500,
    level: 2,
    requires: 'whatsappManager',
    description: 'appointmentAssistantDesc',
    effect: { bookingSystem: 'online', autoBooking: true },
  },
  {
    id: 'chiroAssistant',
    name: 'chiroAssistant',
    icon: '👩‍⚕️',
    cost: 5000,
    level: 3,
    requires: 'appointmentAssistant',
    description: 'chiroAssistantDesc',
    effect: { hasCA: true, caComments: true, caGreeting: true },
  },
  {
    id: 'multipleCA',
    name: 'multipleCA',
    icon: '👥',
    cost: 15000,
    level: 4,
    requires: 'chiroAssistant',
    description: 'multipleCADesc',
    effect: { multipleCA: true, patientsBonus: 2 },
  },
  {
    id: 'hireChiro1',
    name: 'hireChiro',
    icon: '🦴',
    cost: 25000,
    level: 5,
    requires: 'multipleCA',
    description: 'hireChiroDesc',
    effect: { hiredChiros: 1, autoTreat: true, unlockAerialView: true },
  },
  {
    id: 'hireChiro2',
    name: 'hireChiro2',
    icon: '🦴',
    cost: 50000,
    level: 6,
    requires: 'hireChiro1',
    description: 'hireChiro2Desc',
    effect: { hiredChiros: 2 },
  },
  {
    id: 'hireChiro3',
    name: 'hireChiro3',
    icon: '🦴',
    cost: 80000,
    level: 7,
    requires: 'hireChiro2',
    description: 'hireChiro3Desc',
    effect: { hiredChiros: 3 },
  },
  {
    id: 'zenReceptionist',
    name: 'zenReceptionist',
    icon: '🧘',
    cost: 8000,
    level: 4,
    requires: 'chiroAssistant',
    description: 'zenReceptionistDesc',
    effect: { calmImpatient: true, patienceBonus: 0.3, queueReduction: 0.2 },
  },
  {
    id: 'accountant',
    name: 'accountant',
    icon: '📊',
    cost: 12000,
    level: 5,
    requires: 'zenReceptionist',
    description: 'accountantDesc',
    effect: { financialManagement: true, incomeBonus: 0.15, expenseReduction: 0.1 },
  },
  {
    id: 'student',
    name: 'student',
    icon: '📚',
    cost: 5000,
    level: 3,
    requires: 'chiroAssistant',
    description: 'studentDesc',
    effect: { learningMode: true, skillGainBonus: 0.2, mistakeReduction: 0.15 },
  },
];

export const ADDITIONAL_STAFF = {
  zenReceptionist: {
    id: 'zenReceptionist',
    name: 'zenReceptionist',
    icon: '🧘',
    role: 'Recepcionista Zen',
    description: 'Calma a los pacientes impacientes y reduce el tiempo de espera',
    cost: 8000,
    benefits: {
      patientPatience: 0.3,
      queueTimeReduction: 0.2,
      impatientReduction: 0.5,
    },
    upgrades: [
      { level: 1, bonus: 0.3 },
      { level: 2, bonus: 0.5 },
      { level: 3, bonus: 0.7 },
    ],
  },
  accountant: {
    id: 'accountant',
    name: 'accountant',
    icon: '📊',
    role: 'Contador',
    description: 'Gestiona las finanzas de la clínica eficientemente',
    cost: 12000,
    benefits: {
      incomeBonus: 0.15,
      expenseReduction: 0.1,
      financialTracking: true,
    },
    upgrades: [
      { level: 1, bonus: 0.15 },
      { level: 2, bonus: 0.25 },
      { level: 3, bonus: 0.35 },
    ],
  },
  student: {
    id: 'student',
    name: 'student',
    icon: '📚',
    role: 'Estudiante',
    description: 'Aprende de ti, comete menos errores y acelera tu aprendizaje',
    cost: 5000,
    benefits: {
      skillGainBonus: 0.2,
      mistakeReduction: 0.15,
      learningPoints: true,
    },
    upgrades: [
      { level: 1, bonus: 0.2 },
      { level: 2, bonus: 0.35 },
      { level: 3, bonus: 0.5 },
    ],
  },
};

// CA dialogue system
const CA_DIALOGUES = {
  greetings: ['caGreeting', 'caGreeting2', 'caGreeting3', 'caGreeting4', 'caGreeting5', 'caGreeting6', 'caGreeting7', 'caGreeting8'],
  goodJob: ['caGoodJob', 'caGoodJob2', 'caGoodJob3', 'caGoodJob4', 'caGoodJob5', 'caGoodJob6', 'caGoodJob7', 'caGoodJob8'],
  badJob: ['caBadJob', 'caBadJob2', 'caBadJob3', 'caBadJob4', 'caBadJob5', 'caBadJob6', 'caBadJob7', 'caBadJob8'],
  referral: ['caReferral', 'caReferral2', 'caReferral3', 'caReferral4'],
  wrongReferral: ['caWrongRefer'],
  endDay: ['caEndDay', 'caEndDay2', 'caEndDay3', 'caEndDay4', 'caEndDay5', 'caEndDay6', 'caEndDay7'],

  // Perfect treatment reactions (after player does perfectly)
  CA_PERFECT: [
    '\u00a1Incre\u00edble! Casi tan bueno como yo lo har\u00eda... casi.',
    '\u00bfHas practicado con un maniqu\u00ed? Porque eso fue perfecto.',
    'Toma nota... ah espera, yo tomo las notas. Impresionante.',
    'Si sigues as\u00ed voy a pedir un aumento.',
    'Tratamiento perfecto. \u00bfQui\u00e9n eres y qu\u00e9 hiciste con el doctor?',
  ],

  // Failed treatment reactions
  CA_FAIL: [
    'Bueno... al menos no lo mataste. La barra estaba baja.',
    '\u00bfLe devolvemos el dinero o solo un caramelo?',
    'Mi abuela tratar\u00eda mejor... y ella no es quiropr\u00e1ctica.',
    'Eso fue... educativo. Para ambos.',
    'Mira el lado positivo: ahora sabes qu\u00e9 NO hacer.',
  ],

  // Combo streak comments
  CA_COMBO: [
    '\u00a1Racha de {combo}! \u00bfEst\u00e1s en llamas o llamo a los bomberos?',
    '{combo} seguidos. A este ritmo me quedo sin exclamaciones.',
    '\u00a1{combo}x combo! Los pacientes hacen fila para que los atiendas.',
    'Racha de {combo}. Empiezo a creer en ti.',
  ],

  // Morning greetings (expanded, one shown per day start)
  CA_MORNING: [
    'Buenos d\u00edas, jefe. Los pacientes ya huelen el caf\u00e9.',
    'Otro d\u00eda, otra espalda. \u00bfListo para crujir?',
    'He organizado los expedientes... es broma, est\u00e1n donde los dejaste.',
    'Buen d\u00eda. Tu primer paciente ya est\u00e1 quej\u00e1ndose en la sala.',
    'Hoy presiento un gran d\u00eda. O al menos uno sin demandas.',
    'El caf\u00e9 est\u00e1 listo. Tu agenda tambi\u00e9n... m\u00e1s o menos.',
  ],

  // End of day comments
  CA_END_DAY: [
    'Buen d\u00eda. Ahora a descansar... esas manos lo merecen.',
    'D\u00eda terminado. La cl\u00ednica sigue en pie, eso es bueno.',
    'Los pacientes se fueron contentos. Bueno, la mayor\u00eda.',
    'Otro d\u00eda exitoso. O al menos no catastr\u00f3fico.',
    'Hora de cerrar. \u00bfPizza para celebrar?',
  ],

  // When clinic is empty (no patients)
  CA_EMPTY: [
    '\u00bfHola? \u00bfHay alguien? Solo nosotros y el silencio.',
    'Cero pacientes. \u00bfHacemos cara o cruz para ver qui\u00e9n limpia?',
    'La sala de espera est\u00e1 vac\u00eda. Como mi vida social.',
  ],

  // Money milestone comments
  CA_MONEY: [
    '\u00a1Ka-ching! El sonido m\u00e1s bonito del mundo.',
    'Dinero entrando. M\u00fasica para mis o\u00eddos.',
    '\u00bfYa somos ricos? \u00bfNo? Seguimos entonces.',
  ],
};

export function getCADialogue(type, params) {
  const options = CA_DIALOGUES[type] || CA_DIALOGUES.greetings;
  let message = options[Math.floor(Math.random() * options.length)];

  // Replace template placeholders with params values
  if (params) {
    Object.keys(params).forEach((key) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    });
  }

  return message;
}

// Generate online bookings for the day
export function generateBookings(maxPatients, day) {
  const bookings = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  const names = [
    'María G.', 'Carlos M.', 'Ana L.', 'Pedro S.', 'Laura R.', 'Miguel H.',
    'Elena P.', 'David T.', 'Sofía F.', 'Javier C.', 'Carmen O.', 'Roberto D.',
    'Lucía V.', 'Fernando N.', 'Rosa J.', 'Pablo A.', 'Marta B.', 'Andrés E.',
  ];
  const reasons = [
    'Dolor de espalda', 'Dolor cervical', 'Ciática', 'Revisión', 'Primera visita',
    'Dolor lumbar', 'Contractura', 'Dolor de cuello', 'Mareos', 'Cefaleas',
  ];

  const numBookings = Math.min(maxPatients + Math.floor(Math.random() * 3), times.length);
  const shuffledTimes = [...times].sort(() => Math.random() - 0.5).slice(0, numBookings).sort();

  for (let i = 0; i < numBookings; i++) {
    const isReturning = Math.random() < 0.2 && day > 5;
    bookings.push({
      id: `booking_${i}_${Date.now()}`,
      time: shuffledTimes[i],
      name: names[Math.floor(Math.random() * names.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      confirmed: Math.random() > 0.3,
      isReturning,
      isWhatsApp: Math.random() > 0.5,
    });
  }

  return bookings;
}

export default { STAFF_UPGRADES, getCADialogue, generateBookings };
