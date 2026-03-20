# ChiroHero Visual Overhaul — "Prescribe and Pray" Style

**Date:** 2026-03-15
**Status:** Approved
**Approach:** Enfoque A — Cartoon calido con escritorio realista
**References:** Prescribe and Pray, Papers Please, Not Tonight, Black Border

---

## 1. Color Palette & Theme

Complete shift from cold space-blue to warm clinic-brown. Inspired by Prescribe and Pray's palette (#3f2832, #f7f3f2, #ffba35).

### New COLORS object

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#3f2832` | Main background (dark warm brown) |
| `bgDark` | `#2d1b24` | Darker areas, overlays |
| `bgLight` | `#5c3d4a` | Lighter background panels |
| `bgMedium` | `#4a2e3a` | Medium background |
| `desk` | `#6b4c3b` | Desk/wood surface |
| `deskLight` | `#8a6650` | Wood highlight |
| `deskDark` | `#4a3328` | Wood shadow |
| `primary` | `#ffba35` | Primary buttons, accents (golden) |
| `primaryLight` | `#ffd06a` | Primary hover/light |
| `primaryDark` | `#d4951a` | Primary shadow |
| `secondary` | `#8b4513` | Secondary accent (saddle brown — distinct from red) |
| `secondaryLight` | `#a0622d` | Secondary light |
| `accent` | `#4a9e5c` | Success/health green (alias: `green`, `healthy`) |
| `accentLight` | `#6bbd7a` | Green light |
| `accentDark` | `#357a44` | Green dark |
| `paper` | `#f7f3f2` | Document/paper background (alias: `white`) |
| `paperDark` | `#e8e0d8` | Paper shadow |
| `paperLight` | `#fefcfb` | Paper highlight |
| `ink` | `#2b1810` | Primary text on paper (alias: `dark`) |
| `inkLight` | `#5a4035` | Secondary text on paper |
| `gold` | `#e8a830` | Money, rewards |
| `goldLight` | `#f4c55a` | Gold highlight |
| `goldDark` | `#b8861e` | Gold shadow |
| `red` | `#c1374f` | Error, pain, danger (alias: `inflamed`) |
| `redLight` | `#e05068` | Red highlight |
| `redDark` | `#962a3e` | Red dark |
| `green` | `#4a9e5c` | Alias for `accent` |
| `greenLight` | `#6bbd7a` | Alias for `accentLight` |
| `greenDark` | `#357a44` | Alias for `accentDark` |
| `orange` | `#d4731a` | Warnings, medium severity |
| `orangeLight` | `#e8943a` | Orange light |
| `white` | `#f7f3f2` | Alias for `paper` |
| `gray` | `#9a8a80` | Muted text |
| `grayLight` | `#c4b8b0` | Borders |
| `grayDark` | `#6a5a50` | Disabled |
| `dark` | `#2b1810` | Alias for `ink` |
| `darkAlt` | `#3a2820` | Alternative dark |
| `black` | `#1a0e08` | Deepest dark |
| `border` | `#d7c8c4` | Default borders (taupe) |
| `wall` | `#d4c4b0` | Clinic wall background |
| `wallDark` | `#b8a898` | Clinic wall shadow |
| `floor` | `#6b4c3b` | Alias for `desk` (backward compat) |
| `floorLight` | `#8a6650` | Alias for `deskLight` |
| `furniture` | `#5a4030` | Furniture color |
| `furnitureDark` | `#4a3328` | Alias for `deskDark` |
| `skin` | `#ffdbac` | Default skin |
| `skinDark` | `#e8b88a` | Skin shadow |
| `skinLight` | `#ffe8cc` | Skin highlight |
| `bone` | `#f0ead6` | Bone color |
| `boneDark` | `#d4ceb8` | Bone shadow |
| `muscle` | `#c1440e` | Muscle tissue |
| `muscleLight` | `#e05530` | Muscle highlight |
| `healthy` | `#4a9e5c` | Alias for `accent` |
| `inflamed` | `#c1374f` | Alias for `red` |
| `diamond` | `#b9f2ff` | Rarity: diamond |
| `legendary` | `#ffd700` | Rarity: legendary |
| `epic` | `#a335ee` | Rarity: epic |
| `rare` | `#0070dd` | Rarity: rare |
| `uncommon` | `#1eff00` | Rarity: uncommon |

**Intentional aliases:** Several tokens share hex values for semantic clarity:
- `accent` = `green` = `healthy` = `#4a9e5c`
- `paper` = `white` = `#f7f3f2`
- `ink` = `dark` = `#2b1810`
- `red` = `inflamed` = `#c1374f`
- `desk` = `floor` = `#6b4c3b`

### Typography
- **UI titles/headers:** System sans-serif (Platform.OS default), bold, larger sizes
- **Documents/medical data:** Monospace (current), for bureaucratic/clinical feel
- **Dialogue/body text:** System sans-serif, regular weight
- **Component naming:** Keep `PixelText`, `PixelButton`, `PixelCard` names (in-place update, NOT rename). The component API evolves but the import names stay the same to avoid breaking 15+ files.
- Add `fontFamily` prop to PixelText: `'mono'` (monospace, default) or `'ui'` (system sans-serif)

---

## 2. ClinicViewScreen — Desk-Based Layout

Replace the side-view clinic room with a first-person desk workspace.

**HARD REQUIREMENT:** Split ClinicViewScreen (1800+ lines) into sub-components:
- `DeskWorkspace.js` — Wood surface, decorative items, patient file, tools, stamp
- `PatientZone.js` — Wall background, patient portrait, speech bubble, badges
- `ClinicHud.js` — Day, money, reputation, timer
- `ActionBar.js` — Main action buttons
- `ClinicViewScreen.js` — Orchestrator, state management, ties sub-components together

### Screen Structure (mobile portrait, flex-based)

All zone heights use flex ratios, not fixed pixels. Reference device: 375x812 (iPhone 14).

```
+----------------------------------+
|  HUD BAR (flex: 0, ~60px)       |
|  [Day 5]  [$450]  [*3.2]  [2:30]|
+----------------------------------+
|                                  |
|  PATIENT ZONE (flex: 2)         |
|  Wall background (diploma, clock,|
|  spine poster)                   |
|  [Large patient portrait]        |
|  "My back hurts when I sneeze!"  |
|                                  |
+----------------------------------+
|                                  |
|  DESK WORKSPACE (flex: 5)       |
|  Wood texture surface            |
|  - Patient file (paper card)     |
|  - Tools on right edge           |
|  - Reference book (openable)     |
|  - Stamp (APPROVE/DENY)          |
|  - Decorative items              |
|    (coffee mug, pen, post-its)   |
|                                  |
+----------------------------------+
|  ACTION BAR (flex: 0, ~80px)    |
|  [Examine] [Diagnose] [Treat]   |
+----------------------------------+
```

### HUD Bar
- Background: dark wood strip (`deskDark`)
- Indicators styled as post-its or sticky labels
- Day number in a small calendar icon
- Money with coin icon
- Reputation with star
- Timer as wall-clock style

### Patient Zone
- Background: clinic wall (`wall` #d4c4b0) with:
  - Framed diploma (decorative, built with Views)
  - Spine anatomy poster (simplified vertebrae drawing)
  - Wall clock (functional, shows game time)
- Patient portrait: new PatientPortrait component (see Section 3), centered, ~120px wide
- Speech bubble below/beside portrait with typewriter effect
- Badges: VIP (gold), URGENT (red), RETURNING (green) as sticky labels

### Desk Workspace
- Background: wood surface with grain lines (5-8 thin Views at varying opacity — kept minimal for performance)
- Patient file appears as a paper card sliding onto desk
- Tools rack on right edge (3-4 tool icons in a vertical strip)
- Reference book in bottom-left (tap to open/close)
- Rubber stamp in bottom-right (animated stamp action)
- Decorative objects positioned using percentage-based positioning:
  - Coffee mug: top-right (~85%, 5%), steam animation
  - Pen: bottom-left (~10%, 80%), diagonal via transform rotate
  - Post-its: top-left (~5%, 5%), 2 small colored squares
  - Paperclips: scattered near edges

### Action Bar
- Background: slightly darker wood
- 3-4 main action buttons in golden style
- Buttons have paper/label aesthetic with slight rotation (~1-2deg) for organic feel

---

## 3. PatientPortrait Component

Replace PixelAvatar (16x16 full-body) with large caricature bust portraits. PixelAvatar is kept for backward compatibility (walking animations in aerial view, etc.).

### Specifications
- **Grid:** 24x28 pixel units (vs current 16x20)
- **Pixel unit:** `size / 24` (at render size 120px → px = 5)
- **Render size:** ~120x140px on screen
- **Content:** Head (rows 0-16) + neck/shoulders (rows 17-27)
- **Style:** Caricature — oversized heads, big round noses, expressive features
- **Max View count budget:** ~180 Views per portrait (enforce with useMemo)

### Coordinate Reference (round face shape, neutral expression)

```
Row 0-2:   Hair top (varies by style)
Row 3:     Hair/forehead transition
Row 4-5:   Forehead (skin)
Row 6-7:   Eyes zone (cols 5-8 left eye, cols 12-15 right eye)
Row 8-9:   Nose zone (cols 9-12, LARGE — 4 units wide)
Row 10-11: Cheeks (skin, blush area)
Row 12-13: Mouth zone (cols 7-14)
Row 14-15: Chin / jaw
Row 16:    Chin bottom / neck transition
Row 17-18: Neck (narrower, skin color)
Row 19-20: Collar / shirt top
Row 21-27: Shoulders (shirt color, wider)
```

### Procedural Generation Parameters
- **Face shapes** (6): round, square, long, triangular, oval, wide — differ in jaw width/chin shape
- **Noses** (5): big round (4x3), pointy (2x4), small (2x2), bulbous (5x3), upturned (3x3)
- **Eyes** (4 base): round (2x2), narrow (3x1), wide (3x2), droopy (2x2 offset)
- **Hair** (8+): short, tall, bald, mohawk, side-swept, curly, long, ponytail
- **Facial hair** (4): none, mustache (below nose), beard (jaw area), goatee (chin)
- **Accessories** (4): none, glasses (border around eyes), bandage (forehead strip), hat (top rows)
- **Skin tones** (6): `#ffe8cc`, `#ffdbac`, `#e8b88a`, `#c49870`, `#8d6e4a`, `#5a3e28`
- **Shirt/collar:** Color from name hash (8 colors, same as current)

### Expression System (6 expressions)
- `neutral` — dot eyes (2x2), straight mouth line
- `pain` — X eyes (diagonal pixels), wide open mouth (4x3 oval), sweat drops (2 blue dots near temple)
- `happy` — U closed eyes (arc), huge smile (6-wide curve)
- `worried` — raised inner brows (offset pixels), wavy mouth, wide eyes (3x2)
- `relieved` — half-closed eyes (bottom half only), gentle smile (4-wide curve)
- `angry` — angled brows (diagonal line), tight frown, red tint pixels on cheeks

### Animation
- Idle: subtle breathing (scale 1.0 → 1.01, 2s loop) — useNativeDriver: true
- Expression change: quick squash-stretch (scaleY 0.9→1.05→1.0, 200ms) — useNativeDriver: true
- Enter/exit: translateX slide with spring bounce — useNativeDriver: true

---

## 4. MainMenuScreen — Desk Menu

Replace space background with desk surface. No particles, no stars, no spine decoration.

### Layout
```
+----------------------------------+
|  DESK SURFACE (full screen)      |
|  Wood texture background         |
|                                  |
|  [Clinic letterhead document]    |
|   "CHIRO HERO"                   |
|   "Licensed Chiropractor"        |
|   [Official seal stamp]          |
|                                  |
|  [====== PLAY ======] (golden)   |
|                                  |
|  Stacked file tabs:              |
|  [Tutorial] [Manual] [Logros]    |
|                                  |
|  Decorative desk items:          |
|  Coffee mug, stethoscope, pen,   |
|  small plant, post-it notes      |
|                                  |
|  [Language selector row]         |
|  [Music toggle]                  |
|  [Version / disclaimer]          |
+----------------------------------+
```

### Entrance Animation
- Wood desk fades in (200ms)
- Letterhead document slides down onto desk with paper-drop bounce (400ms)
- "CHIRO HERO" text types out (typewriter effect, 600ms)
- Seal stamps down with scale bounce (300ms, delay 800ms)
- Play button slides in from bottom (spring, delay 1000ms)
- File tabs fan out from a stack (stagger 100ms each, delay 1200ms)
- Desk items appear with small pop (stagger, delay 1500ms)

### Decorative Desk Items (built with Views)
- **Coffee mug:** Brown rectangle + white interior oval, steam = 2 animated wavy Views (translateY loop)
- **Pen:** Diagonal rectangle (transform rotate 30deg), dark color with metallic tip pixel
- **Plant:** Small pot (terracotta rectangle) with 3-4 green triangle/oval leaf shapes
- **Post-its:** 2-3 small colored squares (~20x20px), slightly rotated, with tiny scribble line Views
- **Stethoscope:** Simplified — U-shape with circle at bottom (4-5 Views)
- **Paperclips:** 2-3 small S-shaped rectangles (2 Views each)

---

## 5. Treatment Minigame (SpineView/TreatmentScreen)

Replace abstract spine dots with examination table scene.

### Scene Layout
```
+----------------------------------+
|  [Clock]              [Combo]    |
|                                  |
|  +---EXAMINATION TABLE--------+ |
|  | Pillow                      | |
|  |                             | |
|  | Patient silhouette          | |
|  | (face down on table)        | |
|  |                             | |
|  | Cervical zone    [TOOLS]    | |
|  | Thoracic zone    | Hand  |  | |
|  | Lumbar zone      | Activ |  | |
|  | Sacral zone      | Drop  |  | |
|  |                             | |
|  +-----------------------------+ |
|                                  |
|  [Pain thermometer]  [Progress]  |
+----------------------------------+
```

### Visual Elements
- **Examination table:** Rounded rectangle (borderRadius: 8), beige/cream (#f0e6d3), with subtle padding texture, pillow at top
- **Patient body:** Simplified back view silhouette using skin tone colors. Vertebral column drawn as subtle dotted line down center (series of small Views)
- **Treatment zones:** Rectangular areas overlaid on the back, glowing red when subluxated (pulsing opacity animation), turning green when fixed
- **Tools rack:** Vertical strip on right side with 3-4 tool icons. Selected tool highlighted with golden border
- **Pain thermometer:** Vertical bar on left, fill View with height animation (red=high, green=low). Note: height animation cannot use useNativeDriver — use scaleY on a fixed-height view instead
- **Combo counter:** Post-it style note in corner, handwritten-style number
- **Timer:** Small wall clock in upper corner

### Treatment Feedback
- Correct technique: green ripple (fixed-size View with scale + opacity animation, useNativeDriver: true), zone transitions to green, small star particles
- Wrong technique: red flash overlay (opacity animation), patient body tenses (slight scaleY), pain thermometer jumps
- Perfect treatment (0 mistakes): confetti burst (existing ParticleSystem), golden "PERFECT" stamp slams down (scale bounce)
- Zone fixed: radiating lines effect (4 small Views rotating outward from center point)

### Animations
- Patient breathing: subtle Y-axis scale oscillation (1.0 ↔ 1.008, 3s cycle)
- Inflamed zones: pulsing opacity (0.7 ↔ 1.0) + slight scale (1.0 ↔ 1.05)
- Tool selection: selected tool lifts up (translateY: -4) with shadow increase
- Treatment ripple: fixed-size circle View, scale 0→2 + opacity 0.6→0, useNativeDriver: true

---

## 6. Component Redesign

**Strategy:** In-place updates to existing components. NO renames. PixelButton stays PixelButton, PixelCard stays PixelCard. The visual style changes but the API and import names are preserved.

### Buttons (PixelButton — visual update)
- **Remove:** Hard pixel bevels, scanlines, hard shadows (shadowRadius: 0)
- **Add:** Rounded corners (borderRadius: 6), soft shadow (radius: 4, opacity: 0.25), paper/label texture
- **Primary:** Golden (#ffba35) background, dark brown (#2b1810) text, slight border (#d4951a)
- **Secondary:** Paper white (#f7f3f2) background, ink (#2b1810) text, taupe border (#d7c8c4)
- **Danger:** Muted red (#c1374f) background, white text
- **Disabled:** Gray (#9a8a80) background, lighter gray text
- **Press effect:** Scale down to 0.97 + darken background slightly
- **Sizes:** Keep small/medium/large but with softer proportions

### Cards (PixelCard — visual update)
- **Remove:** Corner decorations, hard pixel shadow, inner bevel
- **Add:** Paper texture background (#f7f3f2), thin border (#d7c8c4, 1.5px), soft shadow (2px offset, 4px radius), optional folded corner effect (small triangle in top-right)
- **Header variant:** Top strip with colored background (like a file folder tab)
- **Glow variant:** Subtle warm glow instead of neon glow

### Text (PixelText — add fontFamily)
- **Add `fontFamily` prop:** `'mono'` for monospace (default, documents, data), `'ui'` for system sans-serif (titles, UI labels)
- **Remove hard text shadow** for `'ui'` variant — use subtle shadow or none
- **Keep hard text shadow** for `'mono'` variant for the clinical/typewriter feel
- **New sizes adjusted:** Slightly larger base sizes for readability on warm backgrounds

### EndOfDayReport
- Keep paper style, enhance with new warm colors
- Use new paper colors (#f7f3f2)
- Add clinic letterhead at top (small logo area)
- Newspaper section: tape strips holding it to the report (small diagonal rectangles at corners)
- Stamp uses new warm red/green instead of neon

### SaveSelectModal
- Restyle to look like a **filing cabinet** — each slot is a drawer
- Active slots show file folder tabs with info
- Empty slots are dark empty drawers
- Delete button is a small red "X" stamp

### ParticleSystem
- Update colors to warm palette (gold, orange, warm green instead of neon)
- Keep existing particle types and mechanics
- Confetti colors: `[primary, secondary, gold, accent, red]` (warm tones)

---

## 7. Screens To Update (Priority Order)

### Milestone 1: Foundation (steps 1-4)
After completion: all shared components updated, app renders with warm palette. Screens look "off" but functional.

1. **theme.js** — New color palette (all screens affected)
2. **PixelButton.js** — New warm button style
3. **PixelCard.js** — Paper card style
4. **PixelText.js** — Add font family support

### Milestone 2: Core Screens (steps 5-9)
After completion: main menu and core gameplay loop fully restyled.

5. **MainMenuScreen.js** — Complete desk redesign (first screen users see)
6. **PatientPortrait.js** — NEW component (additive, doesn't break existing)
7. **ClinicViewScreen.js** — Desk workspace layout + decomposition into sub-components (biggest change)
8. **SpineView.js** — Examination table treatment scene
9. **TreatmentScreen.js** — Updated wrapper for new SpineView

### Milestone 3: Secondary Screens (steps 10-17)
After completion: full visual consistency across entire game.

10. **EndOfDayReport.js** — Warm palette update + letterhead
11. **SaveSelectModal.js** — Filing cabinet style
12. **ParticleSystem.js** — Warm color update
13. **ShopScreen.js** — Catalog/desk style
14. **ConsultationScreen.js** — Paper document style
15. **GameModeSelector.js** — Desk file selection style
16. **AchievementsScreen.js** — Trophy shelf on wall style
17. **PathologyBookScreen.js** — Physical book on desk
18. **AppointmentRegistry.js** — Keep CRT style, swap neon palette to warm COLORS tokens, keep scanline effects
19. **IntroVideoScreen.js** — Warm palette, desk-themed intro
20. **IntroductionStory.js** — Warm palette update

---

## 8. Technical Constraints

- **No image assets** — All graphics built with React Native Views (current approach, maintained)
- **No new dependencies** — Use existing Animated API. react-native-reanimated is available in package.json and MAY be used if it simplifies complex animations (squash-stretch, ripple), but is not required.
- **Cross-platform** — Must work on iOS, Android, and Web (Expo)
- **useNativeDriver** — Use for transform and opacity animations. For layout animations (width, height, borderRadius), use scaleX/scaleY workarounds or accept JS-driven animation.
- **Performance** — PatientPortrait: max ~180 Views, wrapped in useMemo for static parts. Wood grain: max 8 Views. Decorative items: positioned with percentage values.
- **Backward compatibility** — PixelAvatar kept for walking scenes. All component names preserved (no renames). Color token aliases ensure old token names still work.
- **ClinicViewScreen decomposition** — HARD REQUIREMENT. Split into DeskWorkspace, PatientZone, ClinicHud, ActionBar sub-components.
- **Px helper** — Create shared `Px` component in `src/components/Px.js` instead of redefining in every screen.
- **Transition strategy** — After theme.js update (step 1), all screens will use warm palette immediately via COLORS references. Individual screen updates refine layout/composition.

---

## 9. Sounds & Splash

- **Sounds:** Existing procedural Web Audio sounds carry over. No new audio files needed. Visual "crack" effect substitutes for sound when audio is unavailable.
- **Splash screen:** Update `splash-icon.png` background color to match `bg` (#3f2832) after visual overhaul is complete. This is a manual asset update, not code.
- **App icon:** Consider updating to warm palette after full overhaul (separate task, not in this spec).
