# ChiroHero Mini-Games Design Spec

## Overview
Add 4 new mini-games to deepen gameplay within the existing consultation/treatment flow. Each mini-game is 10-20 seconds, optional (except neuro tests on red-flag patients), and rewards skillful play with bonuses.

## New Consultation Flow
```
Patient arrives → [SOAP Report]
  → [Optional: PALPATION mini-game]
  → [Optional: X-RAY mini-game (if upgrade purchased)]
  → [Auto: NEURO TESTS (if red-flag candidate, ~30%)]
  → Decision: Treat or Refer
  → [TREATMENT (existing SpineView)]
  → [Optional: EXERCISE PRESCRIPTION mini-game]
  → Rewards
```

---

## Mini-Game 1: Palpation (PalpationMiniGame.js)

**Trigger:** Button "PALPAR" on ConsultationScreen, always available, optional.

**UI:** Reuses SpineView body outline (skin-toned back silhouette). No vertebrae/muscle markers visible initially. A "sensitivity meter" bar on the side.

**Mechanics:**
- Player drags finger/cursor across the back surface
- Hidden problem zones (from the patient's condition) exist at specific coordinates
- As the touch point nears a problem: sensitivity meter rises, visual heat gradient appears (blue→yellow→red), subtle screen vibration animation
- Player taps to "mark" where they think a problem is
- 3 marking attempts allowed, 15-second timer
- Hit detection: within 15% radius of actual problem = success
- Each found problem: that problem starts "revealed" (glowing) in SpineView treatment

**Output:** `palpationResult: { found: number, total: number, bonus: 0-0.15 }`
- bonus = found/total * 0.15 (max 15% precision bonus on treatment)

**Data needs:** Uses existing condition.zones + ZONES/MUSCLE_POINTS from SpineView.

---

## Mini-Game 2: X-Ray Diagnosis (XRayMiniGame.js)

**Trigger:** Button "RAYOS-X" on ConsultationScreen. Requires shop upgrade "xray" (new item, cost: 2000).

**UI:** Dark background, pixelated spine X-ray image built with the Px-style pixel blocks. Inverted colors (dark bg, light bone). Anomalies rendered as subtle visual differences.

**Anomaly types (pixel art):**
- `misalignment`: vertebra offset 2-3px from centerline
- `disc_narrowing`: gap between two vertebrae reduced
- `osteophyte`: small bone spur pixels extending from vertebra edge
- `curvature`: slight S-curve in spine alignment (scoliosis hint)

**Mechanics:**
- 2-4 anomalies placed based on patient condition zones
- Player taps anomalies within 20 seconds
- 3 max wrong taps before lockout
- Each correct find: +10% damage bonus in treatment
- All found: "Perfect Diagnosis" → +$50 bonus

**Output:** `xrayResult: { found: number, total: number, bonus: 0-0.40, perfectDiagnosis: bool }`

**Data needs:** New anomaly definitions per condition zone. Map condition.zones → anomaly placements.

---

## Mini-Game 3: Neurological Tests (NeuroTestMiniGame.js)

**Trigger:** Automatic on patients with potential red flags (~30% of patients). Appears before Treat/Refer decision.

**UI:** Three sequential test screens, each with the patient's body region and interactive elements.

**Test 1 - Reflexes (5 seconds):**
- Shows leg/arm outline with reflex points (knee, ankle, bicep, tricep)
- Game "taps" a reflex point with hammer animation
- Three response options appear: "Normal", "Absent", "Exaggerated"
- Player picks the correct response (determined by condition)
- Correct answers: condition is normal → safe to treat; absent/exaggerated → suggests pathology

**Test 2 - Sensitivity/Dermatomes (5 seconds):**
- Shows body with a dermatome highlighted
- Question: "Does the patient feel sensation here?"
- Two options: "Yes (Normal)" / "No (Deficit)"
- Answer determined by condition (red flags = deficit present)

**Test 3 - Muscle Strength (5 seconds):**
- "Golf swing" style power meter that oscillates
- Player taps to stop the bar
- Landing zone represents correct muscle grade (0-5 scale)
- Target zone size based on difficulty (wider at low skill, narrower at high)

**Output:** `neuroResult: { testsCorrect: number, totalTests: 3, recommendation: 'safe'|'caution'|'refer' }`
- 3/3 correct → accurate recommendation
- <3 correct → ambiguous result, player must decide with incomplete info
- If recommendation='refer' and player treats → -20 reputation, patient complaint
- If recommendation='safe' and player refers → -$100 (unnecessary referral) but no rep loss

**Data needs:** Map conditions to expected reflex/sensation/strength results. Red flag conditions have abnormal results.

---

## Mini-Game 4: Exercise Prescription (ExerciseMiniGame.js)

**Trigger:** Button "PRESCRIBIR EJERCICIOS" after successful treatment. Optional.

**UI:** Patient pixel avatar (full body) on left. 6 exercise cards on right in a 2x3 grid. A "prescription pad" area at bottom with 3 slots.

**Exercise database (new data file: exercises.js):**
- Per zone, 4-6 correct exercises and 4-6 incorrect/irrelevant ones
- Cervical: chin tucks, neck stretches, isometric neck strengthening, upper trap stretch | wrong: squats, hamstring stretch
- Thoracic: cat-cow, thoracic rotation, foam roller extension, scapular squeezes | wrong: wrist curls, calf raises
- Lumbar: bird-dog, bridges, dead bug, pelvic tilts, press-up extensions | wrong: sit-ups (contraindicated), neck rolls
- Sacral/gluteal: piriformis stretch, hip flexor stretch, clam shells, glute bridges | wrong: heavy deadlifts, jumping

**Mechanics:**
- 6 cards shown: 3 correct for the patient's condition zone, 3 incorrect
- Player selects 3 cards to "prescribe" (tap to add to prescription pad)
- Can deselect and re-choose before confirming
- No strict timer (but day timer still ticking)
- Each correct exercise: +satisfaction bonus, +$10
- Each wrong exercise: -satisfaction (minor)
- All 3 correct: "Perfect Prescription" → +20% satisfaction, +$30

**Output:** `exerciseResult: { correct: number, total: 3, bonus: 0-30, satisfactionMult: 1.0-1.2 }`

---

## Integration Points

### ConsultationScreen.js changes:
- Add phase state: 'soap' → 'palpation' → 'xray' → 'neuro' → 'decision' → existing flow
- Add buttons for optional mini-games
- Pass results to TreatmentScreen

### TreatmentScreen.js changes:
- Accept `palpationResult` and `xrayResult` as props
- Pass `palpationBonus` to SpineView (pre-reveal problems)
- Apply `xrayBonus` as damage multiplier
- After treatment complete, show exercise mini-game option
- Accumulate all bonuses into final reward calculation

### SpineView.js changes:
- Accept `revealedProblems` prop (array of problem IDs from palpation)
- Revealed problems start with a glow effect instead of hidden

### Shop/upgrades.js changes:
- Add `xray` tool: { id: 'xray', name: 'Rayos-X', cost: 2000, description: '...', effect: 'Unlock X-Ray diagnosis mini-game' }

### Data files:
- New: `src/data/exercises.js` — exercise database per zone
- New: `src/data/neuroTests.js` — expected results per condition type
- New: `src/data/xrayAnomalies.js` — anomaly definitions per zone

### New components:
- `src/components/PalpationMiniGame.js`
- `src/components/XRayMiniGame.js`
- `src/components/NeuroTestMiniGame.js`
- `src/components/ExerciseMiniGame.js`

### i18n additions:
- All new UI text needs translation keys in all 6 languages
