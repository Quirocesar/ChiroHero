/**
 * neuroTests.js
 * Data for the Neurological Tests mini-game.
 * Maps conditions to expected reflex, sensation, and strength results.
 */

// Normal results (for non-red-flag conditions)
const NORMAL_RESULTS = {
  reflex: 'normal',        // Normal reflex response
  sensation: 'normal',     // Normal sensation
  strengthTarget: 5,       // Full strength (grade 5)
};

// Abnormal results by condition type
const RED_FLAG_RESULTS = {
  cauda_equina: {
    reflex: 'absent',
    sensation: 'deficit',
    strengthTarget: 2,
    recommendation: 'refer',
    explanation: 'Reflejos ausentes, déficit sensorial severo, debilidad marcada → Sospecha de Síndrome de Cauda Equina',
  },
  fracture: {
    reflex: 'normal',
    sensation: 'normal',
    strengthTarget: 3,
    recommendation: 'refer',
    explanation: 'Fuerza reducida por dolor intenso, sospecha de fractura → Derivar para imagen',
  },
  myelopathy: {
    reflex: 'exaggerated',
    sensation: 'deficit',
    strengthTarget: 3,
    recommendation: 'refer',
    explanation: 'Hiperreflexia y déficit sensorial → Sospecha de mielopatía, derivar urgente',
  },
  tumor: {
    reflex: 'exaggerated',
    sensation: 'deficit',
    strengthTarget: 2,
    recommendation: 'refer',
    explanation: 'Signos neurológicos progresivos → Sospecha de tumor, derivar para estudio',
  },
  infection: {
    reflex: 'absent',
    sensation: 'deficit',
    strengthTarget: 3,
    recommendation: 'refer',
    explanation: 'Déficits neurológicos con fiebre → Sospecha de infección, derivar urgente',
  },
  vascular: {
    reflex: 'absent',
    sensation: 'deficit',
    strengthTarget: 1,
    recommendation: 'refer',
    explanation: 'Déficit severo agudo → Posible patología vascular, derivar a urgencias',
  },
  neurological: {
    reflex: 'exaggerated',
    sensation: 'deficit',
    strengthTarget: 3,
    recommendation: 'refer',
    explanation: 'Signos de neurona motora superior → Derivar a neurología',
  },
};

// Safe but notable results (minor nerve involvement, still treatable)
const CAUTION_RESULTS = {
  mild_radiculopathy: {
    reflex: 'diminished',
    sensation: 'mild_deficit',
    strengthTarget: 4,
    recommendation: 'caution',
    explanation: 'Radiculopatía leve — tratable con precaución, monitorizar progresión',
  },
};

/**
 * Reflex test options
 */
export const REFLEX_OPTIONS = [
  { id: 'normal', label: 'Normal', description: 'Respuesta refleja normal' },
  { id: 'absent', label: 'Ausente', description: 'Sin respuesta refleja' },
  { id: 'exaggerated', label: 'Exagerado', description: 'Respuesta exagerada (hiperreflexia)' },
];

/**
 * Sensation test options
 */
export const SENSATION_OPTIONS = [
  { id: 'normal', label: 'Sí (Normal)', description: 'Sensación normal' },
  { id: 'deficit', label: 'No (Déficit)', description: 'Sensación reducida o ausente' },
];

/**
 * Reflex test points by zone
 */
export const REFLEX_POINTS = {
  cervical: [
    { id: 'bicep', name: 'Reflejo bicipital', x: 0.25, y: 0.35, nerve: 'C5-C6' },
    { id: 'tricep', name: 'Reflejo tricipital', x: 0.75, y: 0.40, nerve: 'C7' },
  ],
  thoracic: [
    { id: 'abdominal', name: 'Reflejo abdominal', x: 0.50, y: 0.55, nerve: 'T8-T12' },
  ],
  lumbar: [
    { id: 'patellar', name: 'Reflejo rotuliano', x: 0.40, y: 0.70, nerve: 'L3-L4' },
    { id: 'achilles', name: 'Reflejo aquíleo', x: 0.60, y: 0.85, nerve: 'S1' },
  ],
  gluteal: [
    { id: 'achilles_g', name: 'Reflejo aquíleo', x: 0.50, y: 0.85, nerve: 'S1-S2' },
  ],
};

/**
 * Dermatome zones for sensation test
 */
export const DERMATOME_ZONES = {
  cervical: [
    { id: 'C5', area: 'Deltoides lateral', x: 0.20, y: 0.30, width: 0.15, height: 0.10 },
    { id: 'C6', area: 'Pulgar y cara lateral antebrazo', x: 0.15, y: 0.45, width: 0.12, height: 0.08 },
    { id: 'C7', area: 'Dedo medio', x: 0.12, y: 0.55, width: 0.10, height: 0.06 },
  ],
  thoracic: [
    { id: 'T6', area: 'Apófisis xifoides', x: 0.50, y: 0.45, width: 0.20, height: 0.08 },
    { id: 'T10', area: 'Ombligo', x: 0.50, y: 0.55, width: 0.20, height: 0.08 },
  ],
  lumbar: [
    { id: 'L4', area: 'Cara medial pierna', x: 0.35, y: 0.75, width: 0.12, height: 0.10 },
    { id: 'L5', area: 'Dorso del pie', x: 0.40, y: 0.90, width: 0.10, height: 0.06 },
    { id: 'S1', area: 'Cara lateral pie', x: 0.60, y: 0.90, width: 0.10, height: 0.06 },
  ],
  gluteal: [
    { id: 'S2', area: 'Cara posterior muslo', x: 0.50, y: 0.80, width: 0.15, height: 0.10 },
    { id: 'S3_S5', area: 'Periné (silla de montar)', x: 0.50, y: 0.75, width: 0.10, height: 0.08 },
  ],
};

/**
 * Get expected neuro test results for a given condition.
 * @param {object} condition - The patient's condition object
 * @returns {object} Expected results for reflex, sensation, and strength tests
 */
export function getNeuroTestResults(condition) {
  const isDangerous = condition.dangerous || condition.isDangerous || false;

  if (isDangerous) {
    // Find matching red flag type
    const condId = (condition.id || '').toLowerCase();
    const condName = (condition.name || '').toLowerCase();

    for (const [key, results] of Object.entries(RED_FLAG_RESULTS)) {
      if (condId.includes(key) || condName.includes(key)) {
        return { ...results, isDangerous: true };
      }
    }

    // Generic dangerous fallback
    return {
      reflex: 'absent',
      sensation: 'deficit',
      strengthTarget: 2,
      recommendation: 'refer',
      explanation: 'Hallazgos neurológicos anormales → Derivar para evaluación especializada',
      isDangerous: true,
    };
  }

  // Check for mild nerve involvement (sciatica, radiculopathy)
  const hasNerveInvolvement = (condition.zones || []).includes('lumbar') &&
    ((condition.id || '').includes('sciatica') || (condition.name || '').includes('ciática'));

  if (hasNerveInvolvement) {
    return { ...CAUTION_RESULTS.mild_radiculopathy, isDangerous: false };
  }

  // Normal / safe to treat
  return {
    ...NORMAL_RESULTS,
    recommendation: 'safe',
    explanation: 'Exploración neurológica normal — seguro para tratamiento quiropráctico',
    isDangerous: false,
  };
}

/**
 * Determine if neuro tests should trigger for this patient.
 * ~30% of patients, higher for conditions with nerve keywords.
 */
export function shouldTriggerNeuroTest(condition) {
  const isDangerous = condition.dangerous || condition.isDangerous || false;
  if (isDangerous) return true; // Always test red flag candidates

  const condName = (condition.name || '').toLowerCase();
  const nerveKeywords = ['ciática', 'sciatica', 'radiculopatía', 'neurológ', 'cauda', 'mielopatía', 'parestesia'];
  const hasNerveKeyword = nerveKeywords.some(kw => condName.includes(kw));

  if (hasNerveKeyword) return true; // Always test nerve-related conditions

  return Math.random() < 0.3; // 30% random chance for others
}
