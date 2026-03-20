# ChiroHero — Juego Definitivo: Design Spec
**Date:** 2026-03-20
**Status:** Approved
**Target platform:** Web/PWA (primary), Android + iOS (future)
**Monetization:** Paid, one-time purchase

---

## Context

ChiroHero is a chiropractic clinic management game built with Expo / React Native Web. It has 13 screens, 4 minigames, procedural 8-bit audio, i18n in 6 languages (ES/EN/PT/IT/FR/DE), and a full game-state system with AsyncStorage persistence. The codebase is on the `feature/minigames-graphics-fixes` branch, deployed as a PWA.

The goal of this spec is to take the game from "working prototype" to "sale-ready product" across 8 work blocks, ordered by priority.

---

## Block 1 — Critical: Fix i18n Encoding (746 broken characters)

### Problem
`src/utils/i18n.js` has a UTF-8 BOM header but its content was double-encoded: UTF-8 bytes were read as Latin-1 and re-saved as UTF-8. All accented characters in all 6 languages are corrupted:
- `á` → `Ã¡`, `é` → `Ã©`, `í` → `Ã­`, `ó` → `Ã³`, `ú` → `Ãº`
- `ñ` → `Ã±`, `¡` → `Â¡`, `¿` → `Â¿`, `Ó` → `Ã"`, `É` → `Ã‰`

### Solution
Write a one-time Node.js repair script (`scripts/fix-encoding.js`) that:
1. Reads `src/utils/i18n.js` as a raw Buffer: `const raw = fs.readFileSync(filePath)`
2. Strips the UTF-8 BOM if present (bytes `0xEF 0xBB 0xBF`)
3. Converts the Buffer to a JS string using `'latin1'` encoding: `const corrupted = raw.toString('latin1')`
   — This gives a string where each character's code point equals the original byte value
4. Re-encodes as proper UTF-8 bytes: `const fixedBuffer = Buffer.from(corrupted, 'latin1')`
   — These bytes are now the original pre-corruption UTF-8 sequences (e.g., `0xC3 0xA1` for `á`)
5. Writes the fixed bytes directly to disk: `fs.writeFileSync(filePath, fixedBuffer)`
   — Do NOT call `.toString('utf8')` before writing; write the Buffer directly to avoid re-encoding
6. Prints a diff count of characters changed

Run once, verify in-browser, delete script. Do not change any translation content — only fix encoding.

### Verification
After fix: `"Día"`, `"Señor"`, `"¡Correcto!"`, `"Éxito"` must render correctly in the browser in all 6 languages. Run `node -e "const s=require('fs').readFileSync('src/utils/i18n.js','utf8'); console.log(/Ã/.test(s) ? 'STILL BROKEN' : 'OK')"` to verify.

---

## Block 2 — Critical: Scroll & Layout Fixes

### Problem
Several screens block scrolling or clip content on mobile viewports (375×812). User-reported issues:
- Content disappears below the bottom of the screen
- Options/buttons are cut off and unreachable
- ScrollView containers don't respond to swipe on web

### Solution
Fix each affected screen:
- `ClinicViewScreen`: Wrap content in `ScrollView` with `contentContainerStyle={{ flexGrow: 1 }}`. Add `scrollEventThrottle={16}`.
- `ConsultationScreen`: Patient info card + action buttons must all be reachable. Use `ScrollView` as root, fixed footer for action buttons.
- `TreatmentScreen`: Tool row horizontal scroll + result section vertical scroll. Ensure nested ScrollViews have `nestedScrollEnabled`.
- `PathologyBookScreen`: Full page is already a ScrollView — diagnose and fix the specific element causing clip.
- Any other screen where layout audit reveals clipping.

For web specifically, add `Platform.OS === 'web'` conditional to set `style={{ overflow: 'auto' }}` on ScrollView containers that don't respond to mouse/trackpad scroll on web.

### Verification
All 13 screens must show all interactive elements at 375×812 without any element hidden behind the screen edge.

---

## Block 3 — Medium: Back Navigation on All Modal Screens

### Problem
`PathologyBookScreen`, `EventsScreen`, `AchievementsScreen`, `ShopScreen`, and other screens pushed onto the stack have no visible back/close button. Users can get stuck.

### Solution
Create a new reusable component `src/components/BackHeader.js`:
- Props: `title` (string), `onBack` (function, defaults to `navigation.goBack()`)
- Layout: fixed top bar, `←` button on left, title centered, right side empty or optional action slot
- Style matches the game's pixel-art aesthetic (uses `COLORS`, `PixelText`, `PixelButton`)

Apply `BackHeader` to: `PathologyBookScreen`, `EventsScreen`, `AchievementsScreen`, `ShopScreen`, `TutorialScreen`, `AerialViewScreen`, `IntroductionStory`.

---

## Block 4 — New Screen: ClinicModeSelector

### Problem
`GameModeSelector.js` handles difficulty selection (arcade/challenge/relaxed). The new Sala Abierta / Sala Cerrada is a **clinic type** selection — a separate concept. There is currently no screen or flow step where the player chooses their clinic type.

### Solution
Insert a new screen `src/screens/ClinicModeSelectorScreen.js` into the navigation stack, positioned after `GameModeSelector` and before `ClinicView`.

**Navigation flow:**
```
GameModeSelector (difficulty) → ClinicModeSelectorScreen (clinic type) → ClinicView
```

**ClinicModeSelectorScreen layout:**
- Title: "ELIGE TU CLÍNICA"
- Two large cards side by side (or stacked on narrow screens):
  - **Sala Cerrada**: icon of one table, front-view illustration, bullet list of features (1 camilla, trabajo muscular, más herramientas, mayor ingreso por paciente)
  - **Sala Abierta**: icon of multiple tables, aerial-view illustration, bullet list (2-6 camillas, solo ajuste, mayor volumen, gestión simultánea)
- On selection, saves `clinicMode: 'salaCerrada' | 'salaAbierta'` to `gameState` and navigates to `ClinicView`

Register `ClinicModeSelectorScreen` in `App.js` navigator.

---

## Block 5 — Medium: Manual Treatment Button

### Problem
In `ConsultationScreen`, the only action is "Atender Automáticamente". There is no way for the player to choose manual treatment via minigames.

### Solution
Add a second button **"Tratar Manualmente"** to `ConsultationScreen` alongside the auto-treat button.

When pressed, show an **inline bottom-sheet modal** (not a new screen) inside `ConsultationScreen` that lists the available minigames as tappable cards:
- 🖐 Palpación
- 🦴 Radiografía
- 🧠 Test Neurológico
- 🏋 Ejercicios

On selection, dismiss the modal and navigate to the chosen minigame screen (existing: `PalpationMiniGame`, `XRayMiniGame`, `NeuroTestMiniGame`, `ExerciseMiniGame`) passing `patient` as a route param.

On minigame completion, the result returns to `TreatmentScreen` via the existing `palpationResult` / `xrayResult` / `neuroResult` param pattern, with a skill multiplier applied (perfect score = 1.5× reward vs auto-treat baseline).

The modal is a `View` absolutely positioned over the bottom half of `ConsultationScreen`, with a semi-transparent backdrop. Uses `Animated.timing` for slide-up animation.

---

## Block 6 — New Feature: Sala Cerrada (Front View)

### Architecture
This is a **new dedicated screen** `src/screens/SalaCerradaScreen.js`, not a modification of `TreatmentScreen`. `ClinicView` navigates to `SalaCerradaScreen` instead of the existing `Consultation → Treatment` flow when `clinicMode === 'salaCerrada'`.

### Visual Design
The player sees the patient face-on, standing at the door. Entrance animation:
1. Patient pixel sprite starts at top of screen (behind door)
2. `Animated.timing` translateY brings patient down to table position over 800ms
3. Patient sprite changes frame to "lying down" at destination

Camera is fixed, front-facing. One treatment table is always visible centered on screen.

### Gameplay Flow
1. Patient enters (animation)
2. Patient card appears (name, complaint, pathology — same data as ConsultationScreen)
3. Player sees a **tool bar** at the bottom with 6 tools:
   - Ajuste manual → launches existing `PalpationMiniGame` as inline overlay
   - Descontracturante → launches existing massage gun interaction
   - Ultrasonido → existing tool interaction
   - TENS electroterapia → existing tool interaction
   - Ejercicios rehabilitación → launches existing `ExerciseMiniGame`
   - Calor/frío → new: simple tap-and-hold interaction (2s hold = applied)
4. Each tool used increments a **Patient Experience bar** (0–100%, shown as pixel progress bar)
5. Player taps "Finalizar tratamiento" when satisfied
6. Score = base score × (1 + experienceBar/100 × 0.5) → max 1.5× bonus
7. Result screen shows earnings, reputation change, experience bar, patient face emoji

### Data
- `tableCount`: always 1 (not upgradable)
- `incomeMultiplier`: 1.5 vs Sala Abierta baseline
- `maxPatientsPerSession`: 4–6
- Patient satisfaction bonus: reputation +2 per 25% experience bar filled

---

## Block 7 — New Feature: Sala Abierta (Aerial View)

### Architecture
**Rewrite** `src/screens/AerialViewScreen.js` as the Sala Abierta gameplay screen. The existing file is a static overview map and is architecturally incompatible with real-time patient routing. A full rewrite is required. The existing file's visual assets (room layout, color palette) can be reused as reference.

### Visual Design
Top-down aerial view of the clinic. Visible elements:
- Entry door at the top edge
- 2–6 treatment tables arranged in a grid
- Waiting area (chairs) near the door
- Each table has a status indicator (empty / occupied / in-treatment)

Patient figures: simple top-down pixel sprites (a 4×4 colored square with a head dot). Walking animation: 4-frame cycle, 150ms per frame using `Animated.Value` looping between frames.

### Patient Routing
Each patient follows a simple path:
1. Spawn at door (off-screen top)
2. Walk to nearest `empty` table (Manhattan distance to table center)
3. Arrive → table state changes to `occupied`, patient sprite changes to "lying" frame
4. Wait for player to tap the table → quick-treatment popup appears

### Quick-Treatment Popup
A small modal anchored above the tapped table containing:
- Patient name and complaint (1 line each)
- 3 technique buttons (randomly selected from available techniques for the patient's pathology)
- Player taps one technique → brief animation (star burst over table, 500ms) → floating text shows `+$XX` and `+rep`
- Table returns to `empty` state, patient walks off screen

Success/failure: if the chosen technique matches the correct technique for the pathology, +15% to earnings. Wrong technique: standard earning, -0.5 reputation. No failure is catastrophic (this is the fast-paced mode).

### Table Unlock System
- Starts with 2 tables
- Tables 3–6 purchasable in `ShopScreen` at increasing costs (stored in `gameState.unlockedTables`)
- `ShopScreen` shows a "CAMILLAS" category with unlock cards

### Table State Machine
Each table has state: `empty` → `arriving` → `occupied` → `in_treatment` → `leaving` → `empty`
- `arriving`: patient walking animation in progress
- `occupied`: patient lying, waiting for tap
- `in_treatment`: popup open
- `leaving`: patient walking out animation

---

## Block 8 — Interactive Tutorial

### Scope
The tutorial is implemented **after** Blocks 4–7 so it can accurately teach the final game flow. It covers both clinic modes.

### Implementation Strategy
The tutorial uses a `TutorialOverlay` component that renders over the active screen. To avoid brittle ref-passing, target elements are identified by **named measurement zones**: each tutorial target element wraps itself in a `TutorialTarget` component that registers its layout via `onLayout` into a shared `TutorialContext`. The overlay reads these layout measurements to position the highlight cutout.

```js
// src/components/TutorialTarget.js
// Props: id (string) — registers layout to TutorialContext on mount
// Usage: <TutorialTarget id="playButton"><PixelButton .../></TutorialTarget>

// src/components/TutorialOverlay.js
// Reads TutorialContext for target layouts
// Renders: full-screen semi-transparent mask + rectangular cutout + arrow + text bubble
// Cutout: implemented as 4 View rectangles surrounding the target (top/bottom/left/right)
```

### Tutorial Steps (8 steps)
1. Main Menu → highlight JUGAR button
2. Clinic View → highlight "ABRIR CONSULTA", explain HUD (money, reputation, patients)
3. ClinicModeSelectorScreen → explain Sala Abierta vs Sala Cerrada difference
4. Consultation → explain patient card (SOAP sections)
5. Treatment choice → explain auto vs manual buttons
6. One minigame interaction → guided first palpation
7. Result screen → explain earnings and reputation
8. End of Day → explain day summary and next-day flow

Progress stored in `gameState.tutorialStep` (0–8, where 8 = completed). Skip button always visible. Tutorial auto-starts on first new game.

---

## Block 9 — PWA & Web Deployment

### Manifest (`public/manifest.json`)
Add/update:
- `"categories": ["games", "education"]`
- `"lang": "es"`
- `"description"`: full marketing copy in Spanish (2–3 sentences)
- `"screenshots"`: at least 2 entries (mobile 375×812, desktop 1280×720)

### Service Worker (`public/sw.js`)
- Add a `CACHE_VERSION` constant at the top of `sw.js`
- Add a build script (`scripts/bump-sw-version.js`) that reads the current version, increments it, and writes it back to `sw.js`
- Add `"prebuild:pwa": "node scripts/bump-sw-version.js"` to `package.json` scripts so it runs automatically before every PWA build
- This guarantees cache busting on every deploy without manual intervention

### Netlify Deployment
Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build:pwa"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Connect GitHub repo to Netlify. Auto-deploy triggers on push to `feature/minigames-graphics-fixes`. Final URL: `chirohero.netlify.app`.

---

## Non-Goals (Out of Scope for This Spec)
- Monetization/payment integration
- Analytics or crash reporting
- Native Android/iOS build (future spec)
- Cloud save sync
- Multiplayer

---

## Implementation Order

| Order | Block | Rationale |
|---|---|---|
| 1 | Block 1 — Encoding fix | Immediate value, zero risk, fixes all text |
| 2 | Block 2 — Scroll & layout | Stability foundation for all subsequent testing |
| 3 | Block 3 — Back navigation | Quick wins, 1-2 hours, standalone |
| 4 | Block 4 — ClinicModeSelector screen | Required before Sala Abierta/Cerrada can be accessed |
| 5 | Block 5 — Manual treatment button | Hooks into existing minigame system |
| 6 | Block 6 — Sala Cerrada | Builds on existing ConsultationScreen data structures |
| 7 | Block 7 — Sala Abierta | Most complex, isolated rewrite |
| 8 | Block 8 — Tutorial | Finalized after all game flows are complete |
| 9 | Block 9 — PWA & Deploy | Final step after all features are stable |

---

## Files Affected

| File | Change Type | Block |
|---|---|---|
| `src/utils/i18n.js` | Bug fix (encoding) | 1 |
| `scripts/fix-encoding.js` | New (one-time repair, deleted after use) | 1 |
| `src/utils/soundManager.js` | Remove `console.log` | 1 |
| `src/components/BackHeader.js` | New component | 3 |
| `src/screens/PathologyBookScreen.js` | Add BackHeader + scroll fix | 2, 3 |
| `src/screens/EventsScreen.js` | Add BackHeader | 3 |
| `src/screens/AchievementsScreen.js` | Add BackHeader | 3 |
| `src/screens/ShopScreen.js` | Add BackHeader + table unlock UI | 3, 7 |
| `src/screens/ClinicViewScreen.js` | Scroll fix + route to ClinicModeSelector | 2, 4 |
| `src/screens/ConsultationScreen.js` | Scroll fix + "Tratar Manualmente" button | 2, 5 |
| `src/screens/TreatmentScreen.js` | Scroll fix | 2 |
| `src/screens/ClinicModeSelectorScreen.js` | New screen | 4 |
| `src/screens/SalaCerradaScreen.js` | New screen | 6 |
| `src/screens/AerialViewScreen.js` | Full rewrite → Sala Abierta gameplay | 7 |
| `src/screens/TutorialScreen.js` | Integrate TutorialOverlay | 8 |
| `src/screens/IntroductionStory.js` | Add BackHeader | 3 |
| `src/components/TutorialOverlay.js` | New component | 8 |
| `src/components/TutorialTarget.js` | New component | 8 |
| `src/utils/TutorialContext.js` | New context | 8 |
| `src/utils/gameState.js` | Add: clinicMode, unlockedTables, tutorialStep | 4, 7, 8 |
| `App.js` | Add ClinicModeSelectorScreen, SalaCerradaScreen routes | 4, 6 |
| `public/manifest.json` | PWA metadata | 9 |
| `public/sw.js` | Add CACHE_VERSION constant | 9 |
| `scripts/bump-sw-version.js` | New build script | 9 |
| `netlify.toml` | New deployment config | 9 |
| `package.json` | Add `prebuild:pwa` script | 9 |
