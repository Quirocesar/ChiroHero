/**
 * exercises.js
 * Exercise database for the Exercise Prescription mini-game.
 * Each zone has correct exercises (beneficial) and incorrect ones (contraindicated or irrelevant).
 */

export const EXERCISES = {
  cervical: {
    correct: [
      { id: 'chin_tuck', name: 'Chin Tucks', icon: '🧏', description: 'Retracción cervical, 10 rep', zone: 'cervical' },
      { id: 'neck_stretch', name: 'Estiramiento cervical', icon: '🙆', description: 'Inclinación lateral suave, 15s cada lado', zone: 'cervical' },
      { id: 'iso_neck', name: 'Isométricos cervicales', icon: '💪', description: 'Presión contra la mano, 6s x 4 dir', zone: 'cervical' },
      { id: 'upper_trap_stretch', name: 'Estiramiento trapecio', icon: '🤸', description: 'Oreja al hombro, 20s cada lado', zone: 'cervical' },
      { id: 'scap_retraction', name: 'Retracción escapular', icon: '🔙', description: 'Juntar escápulas, 10 rep x 3', zone: 'cervical' },
    ],
    incorrect: [
      { id: 'heavy_squat', name: 'Sentadillas pesadas', icon: '🏋️', description: 'Sentadilla con barra', zone: 'lumbar' },
      { id: 'hamstring_stretch', name: 'Estiramiento isquios', icon: '🦵', description: 'Tocarse los pies de pie', zone: 'lumbar' },
      { id: 'neck_circles', name: 'Círculos de cuello', icon: '🔄', description: 'Rotar cuello 360° (CONTRAINDICADO)', zone: 'cervical', contraindicated: true },
      { id: 'crunches', name: 'Abdominales clásicos', icon: '🤸', description: 'Flexión de tronco', zone: 'lumbar' },
    ],
  },

  thoracic: {
    correct: [
      { id: 'cat_cow', name: 'Cat-Cow', icon: '🐱', description: 'Flexo-extensión en cuadrupedia, 10 rep', zone: 'thoracic' },
      { id: 'thoracic_rotation', name: 'Rotación torácica', icon: '🔄', description: 'Rotación sentado, 10 rep cada lado', zone: 'thoracic' },
      { id: 'foam_roller_ext', name: 'Extensión con foam roller', icon: '🧘', description: 'Extensión dorsal sobre foam roller', zone: 'thoracic' },
      { id: 'scap_squeeze', name: 'Apretar escápulas', icon: '🤜', description: 'Retracción escapular 3s x 15 rep', zone: 'thoracic' },
      { id: 'doorway_stretch', name: 'Estiramiento en puerta', icon: '🚪', description: 'Pectorales en marco de puerta, 30s', zone: 'thoracic' },
    ],
    incorrect: [
      { id: 'wrist_curls', name: 'Curl de muñeca', icon: '✊', description: 'Flexión de muñeca con peso', zone: 'none' },
      { id: 'calf_raises', name: 'Elevaciones de talón', icon: '🦶', description: 'De puntillas, 15 rep', zone: 'none' },
      { id: 'situps', name: 'Sit-ups rápidos', icon: '⚡', description: 'Abdominales con impulso (CONTRAINDICADO)', zone: 'lumbar', contraindicated: true },
      { id: 'heavy_ohp', name: 'Press militar pesado', icon: '🏋️', description: 'Press sobre cabeza con carga', zone: 'none' },
    ],
  },

  lumbar: {
    correct: [
      { id: 'bird_dog', name: 'Bird-Dog', icon: '🐕', description: 'Extensión cruzada en cuadrupedia, 10 rep', zone: 'lumbar' },
      { id: 'bridges', name: 'Puente de glúteos', icon: '🌉', description: 'Elevación de pelvis, 15 rep x 3', zone: 'lumbar' },
      { id: 'dead_bug', name: 'Dead Bug', icon: '🐛', description: 'Extensión contralateral supino, 10 rep', zone: 'lumbar' },
      { id: 'pelvic_tilt', name: 'Báscula pélvica', icon: '⚖️', description: 'Retroversión pélvica supino, 15 rep', zone: 'lumbar' },
      { id: 'press_up', name: 'Press-Up (McKenzie)', icon: '🔼', description: 'Extensión prono, 10 rep', zone: 'lumbar' },
    ],
    incorrect: [
      { id: 'situps_bad', name: 'Sit-ups clásicos', icon: '❌', description: 'Abdominales con flexión completa (CONTRAINDICADO)', zone: 'lumbar', contraindicated: true },
      { id: 'toe_touch_stand', name: 'Tocarse los pies de pie', icon: '🙇', description: 'Flexión anterior cargada (RIESGO)', zone: 'lumbar', contraindicated: true },
      { id: 'neck_rolls_bad', name: 'Círculos de cuello', icon: '🔄', description: 'Rotar cuello completo', zone: 'cervical' },
      { id: 'jumping_jacks', name: 'Jumping Jacks', icon: '⭐', description: 'Saltos con impacto', zone: 'none' },
    ],
  },

  gluteal: {
    correct: [
      { id: 'piriformis_stretch', name: 'Estiramiento piriforme', icon: '🦵', description: 'Cruzar pierna, tirar rodilla al pecho, 30s', zone: 'gluteal' },
      { id: 'hip_flexor_stretch', name: 'Estiramiento psoas', icon: '🧎', description: 'Zancada con rodilla al suelo, 30s', zone: 'gluteal' },
      { id: 'clamshells', name: 'Clamshells', icon: '🐚', description: 'Apertura de cadera lateral, 15 rep', zone: 'gluteal' },
      { id: 'glute_bridge', name: 'Puente glúteo', icon: '🌉', description: 'Elevación de pelvis unilateral, 12 rep', zone: 'gluteal' },
      { id: 'side_lying_abduction', name: 'Abducción lateral', icon: '↗️', description: 'Elevación lateral de pierna, 15 rep', zone: 'gluteal' },
    ],
    incorrect: [
      { id: 'heavy_deadlift', name: 'Peso muerto pesado', icon: '🏋️', description: 'Deadlift con carga máxima (CONTRAINDICADO)', zone: 'lumbar', contraindicated: true },
      { id: 'box_jumps', name: 'Box Jumps', icon: '📦', description: 'Saltos a cajón con impacto', zone: 'none' },
      { id: 'leg_press_heavy', name: 'Prensa de piernas', icon: '🦿', description: 'Prensa con carga alta', zone: 'none' },
      { id: 'russian_twist', name: 'Russian Twist', icon: '🔄', description: 'Rotación con peso (RIESGO)', zone: 'lumbar', contraindicated: true },
    ],
  },
};

/**
 * Get a shuffled set of 6 exercises for a given zone (3 correct, 3 incorrect).
 */
export function getExercisesForZone(zone) {
  const zoneKey = zone === 'sacral' ? 'gluteal' : zone;
  const data = EXERCISES[zoneKey] || EXERCISES.lumbar;

  // Pick 3 random correct
  const shuffledCorrect = [...data.correct].sort(() => Math.random() - 0.5);
  const correct = shuffledCorrect.slice(0, 3);

  // Pick 3 random incorrect (can borrow from other zones if needed)
  const allIncorrect = [...data.incorrect];
  // Add some from other zones for variety
  Object.keys(EXERCISES).forEach(k => {
    if (k !== zoneKey) {
      EXERCISES[k].incorrect.forEach(ex => {
        if (!allIncorrect.find(e => e.id === ex.id)) {
          allIncorrect.push(ex);
        }
      });
    }
  });
  const shuffledIncorrect = allIncorrect.sort(() => Math.random() - 0.5);
  const incorrect = shuffledIncorrect.slice(0, 3);

  // Combine and shuffle
  const exercises = [...correct, ...incorrect].sort(() => Math.random() - 0.5);

  return {
    exercises,
    correctIds: correct.map(e => e.id),
  };
}
