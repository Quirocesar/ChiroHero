# ChiroHero: Addictive, Fun & Funny Improvements Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ChiroHero addictive (dopamine loops, "one more day" hooks), fun (satisfying feedback, dynamic gameplay), and funny (patient personalities, humor in every interaction).

**Architecture:** Add personality/humor layer on top of existing systems without restructuring. New data files for patient quirks and funny dialogue. Enhanced visual/audio feedback in existing screens. All changes additive — no gameplay breaking changes.

**Tech Stack:** React Native / Expo SDK 55, Web Audio API (procedural sounds), Animated API, existing i18n system.

---

## Chunk 1: Patient Personalities & Funny Dialogue

### Task 1: Create Patient Personality System

**Files:**
- Create: `src/data/patientPersonalities.js`
- Modify: `src/data/patients.js` (generatePatient function)

- [ ] **Step 1: Create patientPersonalities.js with 10 personality archetypes**

Each personality has: id, nameTag (shown to player), quirk (funny one-liner during consultation), greetings[], reactions.happy[], reactions.angry[], reactions.pain[], and a treatmentComment.

Archetypes:
1. **hypochondriac** — "Creo que tengo 15 enfermedades" (self-diagnosed everything)
2. **gymBro** — "Esto me pasó haciendo peso muerto" (blames gym for everything)
3. **googler** — "Según Google tengo algo grave..." (WebMD warrior)
4. **dramatic** — "¡¡¡AYYYY!!! ...ah espera, ya pasó" (overreacts then fine)
5. **skeptic** — "¿Seguro que esto funciona?" (doubts everything)
6. **talker** — "Te cuento que mi vecina también..." (won't stop talking)
7. **tough** — "No me duele nada" (clearly in pain, denies it)
8. **impatient** — "¿Ya terminamos? Tengo prisa" (rushed, checks watch)
9. **grateful** — "¡Eres el mejor doctor del mundo!" (over-the-top grateful)
10. **conspiracist** — "Las farmacéuticas no quieren que sepas esto" (conspiracy theories)

```js
export const PATIENT_PERSONALITIES = [
  {
    id: 'hypochondriac',
    nameTag: '🤒 Hipocondríaco',
    weight: 10,
    quirk: 'Creo que tengo 15 enfermedades diferentes',
    greetings: [
      'Doctor, creo que me estoy muriendo... otra vez',
      'He venido porque WebMD dice que me quedan 3 días',
      'Traigo una lista de 47 síntomas, ¿tiene un momento?',
    ],
    reactions: {
      happy: ['¡No me estoy muriendo! ...¿o sí?', '¿Seguro que no necesito una resonancia?'],
      angry: ['¡Lo sabía! Esto es peor de lo que pensaba', 'Voy a pedir una segunda opinión... y una tercera'],
      pain: ['¡¡¡AAAGH!!! ¿Eso fue un hueso?!', '¡Anote eso como nuevo síntoma!'],
    },
    treatmentComment: 'Mientras tanto... ¿puede revisar este lunar también?',
  },
  // ... 9 more
];
```

- [ ] **Step 2: Integrate personality into generatePatient()**

In `src/data/patients.js`, assign a random personality from the pool (weighted) to each generated patient. Add `personality` field to patient object.

```js
import { PATIENT_PERSONALITIES } from './patientPersonalities';

// Inside generatePatient():
const personality = pickWeightedRandom(PATIENT_PERSONALITIES);
return { ...patient, personality };
```

- [ ] **Step 3: Commit**
```bash
git add src/data/patientPersonalities.js src/data/patients.js
git commit -m "feat: add 10 patient personality archetypes with humor"
```

### Task 2: Show Patient Personality in ConsultationScreen

**Files:**
- Modify: `src/screens/ConsultationScreen.js`

- [ ] **Step 1: Add personality greeting bubble above SOAP report**

When consultation opens, show patient's personality greeting in a speech bubble before the SOAP report. Auto-dismiss after 3 seconds or on tap.

```jsx
{patient.personality && phase === 'soap' && (
  <View style={styles.speechBubble}>
    <PixelText size="small" color={COLORS.white}>
      "{patient.personality.greetings[Math.floor(Math.random() * patient.personality.greetings.length)]}"
    </PixelText>
    <PixelText size="tiny" color={COLORS.gray}>
      {patient.personality.nameTag}
    </PixelText>
  </View>
)}
```

- [ ] **Step 2: Add personality comment during treatment phase**

Show `treatmentComment` as floating text during treatment for extra humor.

- [ ] **Step 3: Add personality reaction on result screen**

After treatment result (success/fail), show the personality-appropriate reaction.

- [ ] **Step 4: Commit**
```bash
git add src/screens/ConsultationScreen.js
git commit -m "feat: show patient personality dialogue in consultation"
```

### Task 3: Funny Patient Reviews System

**Files:**
- Create: `src/data/patientReviews.js`
- Modify: `src/screens/ClinicViewScreen.js`

- [ ] **Step 1: Create patientReviews.js with review templates**

Reviews appear after treating a patient and scroll in the clinic view. Mix of funny, grateful, and brutal:

```js
export const FUNNY_REVIEWS = {
  perfect: [
    { stars: 5, text: 'Me crujió todo. Todo. Hasta partes que no sabía que tenía. 10/10', author: 'Paciente Satisfecho' },
    { stars: 5, text: 'Entré caminando como un cangrejo, salgo bailando salsa', author: 'María G.' },
    { stars: 5, text: 'Mi vecina me recomendó venir. Ahora somos las dos adictas', author: 'Carmen L.' },
  ],
  good: [
    { stars: 4, text: 'Buen doctor, pero el crack me asustó. Creí que me rompía', author: 'Pedro M.' },
    { stars: 4, text: 'Me quitó el dolor. Le quité $150. Trato justo', author: 'Roberto S.' },
  ],
  bad: [
    { stars: 2, text: 'Me tocó la espalda y me cobró. Eso también lo hace mi gato gratis', author: 'Juan P.' },
    { stars: 1, text: '0 estrellas pero el mínimo es 1. Me duele más que antes', author: 'Paciente Anónimo' },
  ],
};
```

- [ ] **Step 2: Show random review as toast notification in ClinicViewScreen after treating patient**

Display a floating review card that slides in from the right, stays 4 seconds, slides out. Uses patient name from the actual treated patient.

- [ ] **Step 3: Commit**
```bash
git add src/data/patientReviews.js src/screens/ClinicViewScreen.js
git commit -m "feat: add funny patient review notifications after treatment"
```

---

## Chunk 2: Dopamine Loops & Satisfying Feedback

### Task 4: Combo System with Escalating Rewards

**Files:**
- Modify: `src/screens/ClinicViewScreen.js`
- Modify: `src/components/ParticleSystem.js`

- [ ] **Step 1: Add combo counter state to ClinicViewScreen**

Track consecutive successful treatments. Each combo level gives increasing money bonus:
- 2x combo: +10% bonus
- 3x combo: +20% bonus, screen flash
- 5x combo: +50% bonus, confetti
- 10x combo: +100% bonus, special sound, "IMPARABLE!" text

```js
const [comboCount, setComboCount] = useState(0);
const comboMultiplier = comboCount >= 10 ? 2.0 : comboCount >= 5 ? 1.5 : comboCount >= 3 ? 1.2 : comboCount >= 2 ? 1.1 : 1.0;
```

- [ ] **Step 2: Add combo break feedback**

When combo breaks (failed treatment), show dramatic "COMBO ROTO" with shake animation and sad sound.

- [ ] **Step 3: Add combo milestone particles in ParticleSystem**

New particle type `combo` with escalating effects based on combo count.

- [ ] **Step 4: Commit**
```bash
git add src/screens/ClinicViewScreen.js src/components/ParticleSystem.js
git commit -m "feat: add combo system with escalating rewards and feedback"
```

### Task 5: Screen Shake & Juice Effects

**Files:**
- Create: `src/utils/juiceEffects.js`
- Modify: `src/screens/ConsultationScreen.js`
- Modify: `src/screens/ClinicViewScreen.js`

- [ ] **Step 1: Create juiceEffects.js utility**

```js
import { Animated } from 'react-native';

export function screenShake(animValue, intensity = 10) {
  Animated.sequence([
    Animated.timing(animValue, { toValue: intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: intensity / 2, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]).start();
}

export function pulseScale(animValue) {
  Animated.sequence([
    Animated.timing(animValue, { toValue: 1.15, duration: 150, useNativeDriver: true }),
    Animated.spring(animValue, { toValue: 1, friction: 3, useNativeDriver: true }),
  ]).start();
}

export function celebrationBurst(shakeAnim, scaleAnim) {
  screenShake(shakeAnim, 15);
  pulseScale(scaleAnim);
}
```

- [ ] **Step 2: Add screen shake on crack/adjustment sounds in ConsultationScreen**

When treatment action happens (crack, muscle release), shake the view slightly.

- [ ] **Step 3: Add pulse effect on money earned in ClinicViewScreen**

When patient pays, pulse the money counter.

- [ ] **Step 4: Commit**
```bash
git add src/utils/juiceEffects.js src/screens/ConsultationScreen.js src/screens/ClinicViewScreen.js
git commit -m "feat: add screen shake and juice effects for satisfying feedback"
```

### Task 6: Enhanced Sound Effects

**Files:**
- Modify: `src/utils/soundManager.js`

- [ ] **Step 1: Add new comedic/satisfying sounds**

```js
playComboUp() { /* ascending arpeggio, pitch increases with combo */ }
playComboBreak() { /* descending sad trombone */ }
playPerfectTreatment() { /* triumphant fanfare */ }
playPatientHappy() { /* cheerful jingle */ }
playPatientAngry() { /* dramatic sting */ }
playMoneyBig() { /* cash register + coin cascade */ }
playDramaticReveal() { /* dun dun DUNNN */ }
playCelebration() { /* confetti + applause-like pops */ }
```

- [ ] **Step 2: Commit**
```bash
git add src/utils/soundManager.js
git commit -m "feat: add comedic and satisfying sound effects"
```

---

## Chunk 3: "One More Day" Hooks & Random Events

### Task 7: End-of-Day Teaser System

**Files:**
- Modify: `src/components/ActionBar.js` (DaySummaryCard section)

- [ ] **Step 1: Add "tomorrow teaser" to end-of-day summary**

After showing the day summary stats, add a teaser for the next day to create curiosity:

```js
const TOMORROW_TEASERS = [
  'Un paciente VIP ha pedido cita para mañana...',
  'Mañana puede ser tu mejor día. ¿Estás preparado?',
  'Hay rumores de una inspección sanitaria...',
  'Tu rival ha abierto una clínica al lado. Mañana verás...',
  'Un paciente misterioso quiere verte mañana...',
  'Mañana es lunes... los lunes siempre vienen más pacientes con dolor de espalda 🤔',
  '¿Sabías que los martes pagan mejor? Mañana es martes... o no.',
  'Tu CA dice que mañana será "interesante"... no especificó por qué.',
];
```

Show one random teaser after the summary card, with a subtle glow animation.

- [ ] **Step 2: Commit**
```bash
git add src/components/ActionBar.js
git commit -m "feat: add tomorrow teaser at end of day for retention hook"
```

### Task 8: Random Clinic Events

**Files:**
- Create: `src/data/clinicEvents.js`
- Modify: `src/screens/ClinicViewScreen.js`

- [ ] **Step 1: Create clinicEvents.js with 12+ random events**

Events trigger randomly (15% chance per day) and affect gameplay:

```js
export const CLINIC_EVENTS = [
  {
    id: 'coffee_machine_broken',
    title: '☕ La cafetera se rompió',
    description: 'Tu CA está de mal humor. Los pacientes tardan más en entrar.',
    effect: { patientDelay: 1.3 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'local_news',
    title: '📰 Sales en el periódico local',
    description: '"El quiropráctico del barrio: ¿genio o loco?" +20% pacientes hoy.',
    effect: { patientBonus: 1.2, reputationBonus: 5 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'rival_opens',
    title: '😤 Tu rival abrió al lado',
    description: 'Dr. Crack-Man ha abierto una clínica junto a la tuya. -10% pacientes hoy.',
    effect: { patientBonus: 0.9 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'free_pizza',
    title: '🍕 Pizza gratis en la sala de espera',
    description: 'No sabes quién la dejó, pero los pacientes están más contentos. +$50 propinas.',
    effect: { moneyBonus: 50 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'influencer_visit',
    title: '📱 Un influencer te etiquetó',
    description: '@QuiroBro subió tu ajuste a TikTok. +30% pacientes hoy.',
    effect: { patientBonus: 1.3 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'power_outage',
    title: '⚡ Corte de luz',
    description: 'Solo puedes usar las manos. Herramientas eléctricas deshabilitadas.',
    effect: { disableElectricTools: true },
    duration: 'day',
    funny: true,
  },
  {
    id: 'cat_in_clinic',
    title: '🐱 Un gato entró a la clínica',
    description: 'Los pacientes lo aman. +10% satisfacción.',
    effect: { satisfactionBonus: 1.1 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'rain_day',
    title: '🌧️ Día lluvioso',
    description: 'Todo el mundo tiene dolor cervical hoy. +40% pacientes cervicales.',
    effect: { cervicalBoost: true },
    duration: 'day',
    funny: false,
  },
  {
    id: 'student_visit',
    title: '🎓 Visita de estudiantes de quiropráctica',
    description: 'Te observan mientras trabajas. ¿Presión? +2x XP hoy.',
    effect: { xpMultiplier: 2 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'monday_blues',
    title: '😩 Es lunes',
    description: 'Todos vienen con dolor lumbar. Típico lunes.',
    effect: { lumbarBoost: true },
    duration: 'day',
    funny: true,
  },
  {
    id: 'gossip',
    title: '🗣️ Chisme en la sala de espera',
    description: 'Un paciente dice que le hiciste crack "como en las películas". +5 reputación.',
    effect: { reputationBonus: 5 },
    duration: 'day',
    funny: true,
  },
  {
    id: 'health_trend',
    title: '🧘 Nuevo trend de bienestar',
    description: 'Sale un TikTok viral sobre quiropráctica. VIP patients +50% hoy.',
    effect: { vipBoost: 1.5 },
    duration: 'day',
    funny: true,
  },
];
```

- [ ] **Step 2: Show event notification at start of day in ClinicViewScreen**

When day starts, 15% chance to trigger random event. Show animated card with event title/description. Apply effects to day logic.

- [ ] **Step 3: Commit**
```bash
git add src/data/clinicEvents.js src/screens/ClinicViewScreen.js
git commit -m "feat: add 12 random funny clinic events for dynamic gameplay"
```

---

## Chunk 4: Achievement Humor & Mission Personality

### Task 9: Add Funny Achievement Descriptions

**Files:**
- Modify: `src/utils/i18n.js`

- [ ] **Step 1: Update achievement name/description strings with humor**

Replace generic achievement text with funny descriptions in ALL 6 languages. Focus on Spanish + English:

```js
// Spanish examples:
ach_first_patient_name: 'Primer Víctima... digo, Paciente',
ach_first_patient_desc: 'Has atendido a tu primer paciente. ¡No huyó!',
ach_ten_patients_name: 'Ya van 10',
ach_ten_patients_desc: 'Diez pacientes y contando. Tu espalda les agradece.',
ach_hundred_patients_name: 'Máquina de Cracks',
ach_hundred_patients_desc: '100 pacientes. Tu vecino ya sabe lo que haces por los ruidos.',
ach_millionaire_name: 'Dr. Dinero',
ach_millionaire_desc: '¡Un millón! Podrías jubilarte... pero crujir espaldas es adictivo.',
ach_perfect_day_name: 'Día Perfecto',
ach_perfect_day_desc: 'Sin errores todo el día. ¿Estás seguro de que eres tú?',
ach_streak_10_name: 'Racha Imparable',
ach_streak_10_desc: '10 tratamientos perfectos seguidos. Los pacientes hacen fila.',
ach_first_referral_name: 'Saber Decir No',
ach_first_referral_desc: 'Derivaste tu primer caso. A veces el mejor tratamiento es no tratar.',
ach_combo_master_name: 'Combo Master',
ach_combo_master_desc: 'Combo de 10+. ¡Esto no es un juego! Ah, espera, sí lo es.',
```

- [ ] **Step 2: Commit**
```bash
git add src/utils/i18n.js
git commit -m "feat: add funny achievement descriptions in all languages"
```

### Task 10: Add Funny Daily Mission Names

**Files:**
- Modify: `src/data/dailyMissions.js`
- Modify: `src/utils/i18n.js`

- [ ] **Step 1: Add personality to mission templates with funny flavor text**

```js
// In dailyMissions.js, add flavorText to each mission type:
treat_patients: {
  flavorText: ['Los pacientes no se tratan solos... aunque a veces lo intentan'],
},
earn_money: {
  flavorText: ['El alquiler no se paga solo', 'Tu cuenta bancaria llora de alegría'],
},
perfect_treatment: {
  flavorText: ['Cero errores. Como un cirujano... pero con más cracks'],
},
```

- [ ] **Step 2: Add corresponding i18n keys for mission flavor text**

- [ ] **Step 3: Commit**
```bash
git add src/data/dailyMissions.js src/utils/i18n.js
git commit -m "feat: add funny flavor text to daily missions"
```

---

## Chunk 5: CA (Clinic Assistant) Personality Boost

### Task 11: Enhance CA Dialogue with Snarky Comments

**Files:**
- Modify: `src/data/staff.js`

- [ ] **Step 1: Read current staff.js and add more CA dialogue**

Add situational CA comments that are snarky/funny:

```js
// After perfect treatment
CA_PERFECT: [
  '¡Increíble! Casi tan bueno como yo lo haría... casi.',
  'Wow, ¿has practicado con un maniquí? Porque eso fue perfecto.',
  'Toma nota: así se hace. Ah, espera, yo tomo las notas.',
],
// After failed treatment
CA_FAIL: [
  'Bueno... al menos no lo mataste. La barra estaba baja, pero la pasaste.',
  '¿Quieres que le devuelva el dinero o solo le damos un caramelo?',
  'Mi abuela trataría mejor... y ella ni es quiropráctica.',
],
// When combo is high
CA_COMBO: [
  '¡{combo}x combo! ¿Estás en llamas o necesito llamar a los bomberos?',
  'Racha de {combo}. A este ritmo me quedo sin exclamaciones.',
],
// Morning greetings (expanded)
CA_MORNING: [
  'Buenos días, jefe. Los pacientes ya huelen el café.',
  'Otro día, otra espalda. ¿Listo para crujir?',
  'He organizado los expedientes... es broma, están donde los dejaste.',
],
```

- [ ] **Step 2: Commit**
```bash
git add src/data/staff.js
git commit -m "feat: enhance CA with snarky personality and situational humor"
```

---

## Chunk 6: Visual Polish & Dynamic Feel

### Task 12: Animated Day Transition

**Files:**
- Create: `src/components/DayTransition.js`
- Modify: `src/screens/ClinicViewScreen.js`

- [ ] **Step 1: Create DayTransition component**

Full-screen overlay that shows when starting/ending a day:
- "DÍA {n}" with scale-in animation
- Random motivational/funny quote underneath
- Fade out after 1.5 seconds

```jsx
export default function DayTransition({ day, visible, onDone }) {
  // Animated.sequence: scale 0→1.2→1, fade in, hold 1s, fade out
  const QUOTES = [
    'A crujir se ha dicho',
    'Las vértebras no se alinean solas',
    'Otro día, otra subluxación',
    'Tu espalda. Mi pasión.',
    'Hoy nadie sale sin su crack',
  ];
  // ...
}
```

- [ ] **Step 2: Integrate into ClinicViewScreen on day start/end**

- [ ] **Step 3: Commit**
```bash
git add src/components/DayTransition.js src/screens/ClinicViewScreen.js
git commit -m "feat: add animated day transition with funny quotes"
```

### Task 13: Streak Counter Visual

**Files:**
- Modify: `src/components/ClinicHud.js`

- [ ] **Step 1: Add visual streak fire icon that grows with streak**

When streak > 3, show a fire emoji that gets bigger. At streak > 10, it becomes a special icon. Pulse animation on increment.

- [ ] **Step 2: Commit**
```bash
git add src/components/ClinicHud.js
git commit -m "feat: add visual streak fire indicator in HUD"
```

---

## Chunk 7: Final Polish & Testing

### Task 14: Build Verification & Lint

**Files:** All modified files

- [ ] **Step 1: Run ESLint with --max-warnings=0**
```bash
npx eslint src/ --max-warnings=0
```

- [ ] **Step 2: Run web build**
```bash
npx expo export --platform web
```

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit**
```bash
git add -A
git commit -m "fix: resolve lint and build issues from fun improvements"
```

### Task 15: Integration Test — Play Through Full Game Flow

- [ ] **Step 1: Start dev server and navigate all screens**
- [ ] **Step 2: Verify personality dialogue appears in consultation**
- [ ] **Step 3: Verify combo system works (treat multiple patients)**
- [ ] **Step 4: Verify random event triggers**
- [ ] **Step 5: Verify patient reviews appear**
- [ ] **Step 6: Verify day transition animation**
- [ ] **Step 7: Verify funny achievement text**
- [ ] **Step 8: Push all changes**
