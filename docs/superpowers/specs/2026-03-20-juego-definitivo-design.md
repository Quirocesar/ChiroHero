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

This affects every string in every language that contains a non-ASCII character. The game is impossible to sell with this bug.

### Solution
Write a one-time Node.js repair script (`scripts/fix-encoding.js`) that:
1. Reads `src/utils/i18n.js` as a raw Buffer
2. Strips the UTF-8 BOM (bytes `EF BB BF`)
3. Interprets the content as Latin-1 (`buffer.toString('latin1')`)
4. Re-encodes back to UTF-8 (`Buffer.from(str, 'latin1').toString('utf8')`)
5. Overwrites the file with clean UTF-8 (no BOM)
6. Prints a count of characters fixed

Run once, verify in-browser, delete script. Do not change any translation content — only fix encoding.

### Verification
After fix, `"Día"`, `"Señor"`, `"¡Correcto!"`, `"Éxito"` must render correctly in the browser in all 6 languages.

---

## Block 2 — Critical: Scroll & Layout Fixes

### Problem
Several screens block scrolling or clip content on mobile viewports (375×812). Reported issues:
- Content disappears below the bottom of the screen
- Options/buttons are cut off and unreachable
- ScrollView containers don't respond to swipe on web

### Solution
Audit every screen for:
1. Fixed-height containers that should use `flexGrow: 1` + `ScrollView`
2. `ScrollView` components missing `contentContainerStyle={{ flexGrow: 1 }}`
3. Web-specific scroll: add `style={{ overflowY: 'auto' }}` on web where needed
4. Absolute-positioned elements that push content off screen

Specific screens to fix based on user reports:
- `ClinicViewScreen` — main game hub, must scroll vertically
- `ConsultationScreen` — patient info can overflow
- `TreatmentScreen` — tool row + result section must be scrollable
- `PathologyBookScreen` — long book content
- Any other screen where content is clipped

### Verification
All 13 screens must show all interactive elements without scrolling past the bottom edge on a 375×812 viewport.

---

## Block 3 — Medium: Back Navigation on All Modal Screens

### Problem
`PathologyBookScreen`, `EventsScreen`, `AchievementsScreen`, `ShopScreen`, and other screens pushed onto the stack have no visible back/close button. Users can get stuck.

### Solution
Add a consistent header back button component (`BackHeader`) used across all screens that are navigated to from another screen. The button shows `←` or `✕` depending on context (slide-in vs modal). It calls `navigation.goBack()`.

Apply to: `PathologyBookScreen`, `EventsScreen`, `AchievementsScreen`, `ShopScreen`, `TutorialScreen`, `AerialViewScreen`, `IntroductionStory`.

The component:
```js
// src/components/BackHeader.js
// Props: title (string), onBack (fn, defaults to navigation.goBack)
// Style: fixed top bar with ← button left, title center
```

---

## Block 4 — Medium: Expanded Interactive Tutorial

### Problem
The current `TutorialScreen` shows static text slides. It does not explain what buttons do, what the game loop is, or how to interact with the clinic. New players are lost.

### Solution
Replace the static tutorial with a **step-by-step interactive guide** that overlays the real game screens. The tutorial:

1. **Step 1 — Main Menu**: Highlights the JUGAR button. Text: "Pulsa JUGAR para abrir tu clínica"
2. **Step 2 — Clinic View**: Highlights "ABRIR CONSULTA". Explains the HUD (dinero, reputación, pacientes)
3. **Step 3 — Choose Mode**: Explains the difference between Sala Abierta and Sala Cerrada
4. **Step 4 — Consultation**: Shows patient card. Explains SUBJETIVO/OBJETIVO/EVALUACIÓN/PLAN
5. **Step 5 — Treatment Choice**: Explains "Atender Automáticamente" vs "Tratar Manualmente"
6. **Step 6 — Minigame**: Walks through one palpation interaction
7. **Step 7 — Result**: Explains score, money earned, reputation change
8. **Step 8 — End of Day**: Shows day summary, explains next steps

Implementation: A `TutorialOverlay` component that renders a semi-transparent mask with a highlight cutout around the target element, an arrow, and a text bubble. Uses absolute positioning over the active screen. Progress stored in `gameState` (`tutorialStep`). Skip button always visible.

---

## Block 5 — Medium: Manual Treatment Button

### Problem
In `ConsultationScreen`, the only action is "Atender Automáticamente" — there is no way for the player to choose to do the treatment manually via the minigames.

### Solution
Add a second button **"Tratar Manualmente"** next to the auto-treat button. When pressed, it navigates to a **Treatment Mode Selection screen** (or inline modal) where the player picks which minigame to use:
- 🖐 Palpación (PalpationMiniGame)
- 🦴 Radiografía (XRayMiniGame)
- 🧠 Test Neurológico (NeuroTestMiniGame)
- 🏋 Ejercicios (ExerciseMiniGame)

The chosen minigame launches. On completion, the result feeds back into the scoring/economy engine the same way auto-treat does, but with a skill multiplier bonus (manual = up to 1.5× reward for perfect performance).

---

## Block 6 — New Feature: Sala Cerrada Mode (Front View)

### Visual Design
The player sees the patient **face-on**, standing at the door. An entrance animation plays: the patient walks toward camera and lies down on the treatment table. The camera is fixed, first-person-ish perspective.

### Gameplay
- **1 treatment table** (not expandable)
- Full treatment sequence: Consultation → Manual minigame selection → Extended tool set
- **Extended chiropractic tools** available:
  - Ajuste manual (existing PalpationMiniGame)
  - Descontracturante / massage gun (existing tool, enhanced animation)
  - Ultrasonido terapéutico (existing)
  - TENS electroterapia (existing)
  - Ejercicios de rehabilitación (ExerciseMiniGame)
  - Aplicación de calor / frío (new simple interaction)
- Each tool used adds to a **Patient Experience bar** (bonus reputation + tip)
- Slower pace: 4-6 patients per session max
- Higher income per patient (+50% vs Sala Abierta)
- Patient satisfaction shown with face animation (😊→😄→🤩)

### Implementation
Adapt `TreatmentScreen` with a "Sala Cerrada" mode flag. Show additional tool slots. Add patient entrance animation using `Animated.Value` translateY from off-screen top to table position. Patient sprite is a front-facing pixel art figure.

---

## Block 7 — New Feature: Sala Abierta Mode (Aerial View)

### Visual Design
The player sees the clinic from **above** (top-down/aerial view). Multiple treatment tables visible simultaneously. Patients enter through a door at the top of the screen, walk (animated pixel figures) along a path to an available table, and lie down.

### Gameplay
- **Starts with 2 treatment tables**
- Player can unlock up to **6 tables** by spending in-game money (upgrade path in ShopScreen)
- Treatment is **adjustment-only** (quick): tap a patient on their table → treatment mini-popup appears → choose technique → result shown as floating text above the table
- Queue system: waiting patients shown in a waiting area at the top
- Faster pace: 8-15 patients per session
- Lower income per patient (-20% vs Sala Cerrada)
- Reputation grows faster via volume

### Implementation
Adapt `AerialViewScreen` (already exists as a map view). Add:
- Animated patient figures (pixel art, top-down walking sprites using frame-by-frame Animated.Value)
- Patient path routing (simple: walk from door to nearest free table)
- Table state machine: `empty` → `arriving` → `occupied` → `in_treatment` → `leaving`
- Quick-treatment popup (replaces full ConsultationScreen flow for speed)
- Unlock system for tables (stored in `gameState`, purchasable in `ShopScreen`)

---

## Block 8 — PWA & Web Deployment

### Manifest improvements (`public/manifest.json`)
- `categories`: `["games", "education"]`
- `screenshots`: at least 2 (desktop + mobile)
- `description`: full marketing copy in Spanish
- `lang`: `"es"`
- `iarc_rating_id`: for age rating

### app.json improvements
- `expo.web.bundler`: `"metro"`
- Proper `description` for web SEO
- `theme_color` and `background_color` already set

### Deployment
- Target: **Netlify** (connects to GitHub repo, auto-deploys on push to `feature/minigames-graphics-fixes`)
- Build command: `npm run build:pwa`
- Publish directory: `dist/`
- URL: `chirohero.netlify.app` (or custom domain if available)
- HTTPS: automatic via Netlify

### Service Worker
Verify `public/sw.js` caches all game assets for offline play. Add cache busting version string that increments on each deploy.

---

## Non-Goals (Out of Scope for This Spec)
- Monetization/payment integration (the game is sold via external platform, e.g. itch.io link)
- Analytics or crash reporting
- Native Android/iOS build (future spec)
- Cloud save sync
- Multiplayer

---

## Implementation Order

Execute blocks in this order to minimize risk and maximize testability:

1. Block 1 — Encoding fix (immediate value, 0 risk)
2. Block 2 — Scroll & layout (stability foundation)
3. Block 3 — Back navigation (quick wins, 1-2h)
4. Block 5 — Manual treatment button (hooks into existing minigame system)
5. Block 4 — Tutorial expansion (depends on knowing final game flow)
6. Block 6 — Sala Cerrada (builds on existing TreatmentScreen)
7. Block 7 — Sala Abierta (builds on existing AerialViewScreen)
8. Block 8 — PWA & Deploy (final step, after all features stable)

---

## Files Affected

| File | Change Type |
|---|---|
| `src/utils/i18n.js` | Bug fix (encoding) |
| `scripts/fix-encoding.js` | New (one-time repair script, deleted after use) |
| `src/utils/soundManager.js` | Remove console.log |
| `src/components/BackHeader.js` | New component |
| `src/screens/PathologyBookScreen.js` | Add BackHeader, fix scroll |
| `src/screens/EventsScreen.js` | Add BackHeader |
| `src/screens/AchievementsScreen.js` | Add BackHeader |
| `src/screens/ShopScreen.js` | Add BackHeader, fix scroll |
| `src/screens/TutorialScreen.js` | Full rewrite — interactive overlay |
| `src/components/TutorialOverlay.js` | New component |
| `src/screens/ConsultationScreen.js` | Add "Tratar Manualmente" button |
| `src/screens/TreatmentScreen.js` | Sala Cerrada mode + extended tools |
| `src/screens/AerialViewScreen.js` | Sala Abierta mode + patient animation |
| `src/screens/GameModeSelector.js` | Connect mode choice to game flow |
| `src/utils/gameState.js` | Add: clinicMode, tableCount, tutorialStep |
| `public/manifest.json` | PWA metadata improvements |
| `netlify.toml` | New — Netlify deploy config |
