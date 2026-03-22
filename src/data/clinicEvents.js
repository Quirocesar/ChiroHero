// Random daily clinic events — add humor and dynamic gameplay variety

export const CLINIC_EVENTS = [
  {
    id: 'coffee_machine_broken',
    title: '☕ La cafetera se rompió',
    description: 'Tu CA está de mal humor. Los pacientes tardan más en entrar.',
    effect: { tag: 'slow_patients' },
  },
  {
    id: 'local_news',
    title: '📰 Sales en el periódico local',
    description: '"El quiropráctico del barrio: ¿genio o loco?" +20% pacientes hoy.',
    effect: { tag: 'more_patients', reputationBonus: 5 },
  },
  {
    id: 'rival_opens',
    title: '😤 Tu rival abrió al lado',
    description: 'Dr. Crack-Man ha abierto una clínica junto a la tuya. ¡Demuestra quién es mejor!',
    effect: { tag: 'rival', reputationBonus: -3 },
  },
  {
    id: 'free_pizza',
    title: '🍕 Pizza gratis en la sala de espera',
    description: 'No sabes quién la dejó, pero los pacientes están más contentos.',
    effect: { tag: 'happy_patients', moneyBonus: 50 },
  },
  {
    id: 'influencer_visit',
    title: '📱 Un influencer te etiquetó',
    description: '@QuiroBro subió tu ajuste a TikTok. ¡Llueven pacientes!',
    effect: { tag: 'more_patients', reputationBonus: 10 },
  },
  {
    id: 'power_outage',
    title: '⚡ Corte de luz',
    description: 'Solo puedes usar las manos hoy. Herramientas eléctricas fuera de servicio.',
    effect: { tag: 'no_electric_tools' },
  },
  {
    id: 'cat_in_clinic',
    title: '🐱 Un gato entró a la clínica',
    description: 'Los pacientes lo aman. Se llama Dr. Miau y no piensa irse.',
    effect: { tag: 'happy_patients', reputationBonus: 3 },
  },
  {
    id: 'rain_day',
    title: '🌧️ Día lluvioso',
    description: 'Todo el mundo tiene dolor cervical hoy. Típico.',
    effect: { tag: 'cervical_day' },
  },
  {
    id: 'student_visit',
    title: '🎓 Visita de estudiantes',
    description: 'Estudiantes de quiropráctica te observan. ¡2x XP hoy!',
    effect: { tag: 'double_xp' },
  },
  {
    id: 'monday_blues',
    title: '😩 Es lunes',
    description: 'Todos vienen con dolor lumbar. Típico lunes.',
    effect: { tag: 'lumbar_day' },
  },
  {
    id: 'gossip',
    title: '🗣️ Chisme en la sala de espera',
    description: 'Un paciente dice que le hiciste crack "como en las películas".',
    effect: { tag: 'reputation_boost', reputationBonus: 5 },
  },
  {
    id: 'health_trend',
    title: '🧘 Trend de bienestar viral',
    description: 'TikTok descubrió la quiropráctica. Pacientes VIP +50% hoy.',
    effect: { tag: 'vip_boost' },
  },
  {
    id: 'yoga_class_next_door',
    title: '🧘‍♀️ Abrieron un estudio de yoga al lado',
    description: 'Todos intentaron hacer "la cobra" y ahora les duele todo.',
    effect: { tag: 'more_patients' },
  },
  {
    id: 'marathon_nearby',
    title: '🏃 Maratón en la ciudad',
    description: 'Corredores con dolor de rodilla hacen fila en tu puerta.',
    effect: { tag: 'more_patients', moneyBonus: 30 },
  },
  {
    id: 'wifi_down',
    title: '📵 Se cayó el WiFi',
    description: 'Los pacientes no pueden googlear sus síntomas. ¡Confían más en ti!',
    effect: { tag: 'happy_patients', reputationBonus: 3 },
  },
];

/**
 * Roll for a random daily event. 20% chance of triggering.
 * @param {number} day - Current game day
 * @returns {object|null} Event object or null
 */
export function rollDailyEvent(day) {
  if (Math.random() > 0.20) return null;
  // Avoid repeating last event
  const pool = CLINIC_EVENTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
