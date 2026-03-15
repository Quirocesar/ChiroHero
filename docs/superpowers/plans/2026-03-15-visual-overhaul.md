# Visual Overhaul Implementation Plan — "Prescribe and Pray" Style

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ChiroHero from a cold space-blue pixel aesthetic to a warm brown/golden clinic desk style inspired by Prescribe and Pray.

**Architecture:** In-place visual updates to all 30 files that import `COLORS` from theme.js. Foundation layer (theme + shared components) updates first so all screens inherit warm colors immediately. Then core screens get layout redesigns, followed by secondary screens. ClinicViewScreen (1805 lines) gets decomposed into 4 sub-components.

**Tech Stack:** React Native (Expo 55), Animated API (useNativeDriver: true for transform/opacity), no image assets — all graphics built with Views.

**Spec:** `docs/superpowers/specs/2026-03-15-visual-overhaul-design.md`

---

## File Structure

### New files to create
| File | Responsibility |
|------|---------------|
| `src/components/Px.js` | Shared pixel-positioning helper (extracted from ClinicViewScreen) |
| `src/components/PatientPortrait.js` | 24x28 caricature bust portrait with expressions |
| `src/components/DeskWorkspace.js` | Wood desk surface, patient file, tools, stamp, decorative items |
| `src/components/PatientZone.js` | Clinic wall, patient portrait, speech bubble, badges |
| `src/components/ClinicHud.js` | Day, money, reputation, timer indicators |
| `src/components/ActionBar.js` | Main action buttons row |

### Files to modify (in order)
| # | File | Change type |
|---|------|------------|
| 1 | `src/utils/theme.js` | Complete palette replacement (77 tokens) |
| 2 | `src/components/PixelButton.js` | Remove pixel bevels/scanlines, add rounded soft style |
| 3 | `src/components/PixelCard.js` | Remove corners/bevel, add paper texture style |
| 4 | `src/components/PixelText.js` | Add `fontFamily` prop ('mono'/'ui') |
| 5 | `src/screens/MainMenuScreen.js` | Complete desk redesign, remove stars/particles |
| 6 | `src/components/PatientPortrait.js` | NEW — procedural caricature generation |
| 7 | `src/components/Px.js` | NEW — shared pixel helper |
| 8 | `src/components/DeskWorkspace.js` | NEW — desk sub-component |
| 9 | `src/components/PatientZone.js` | NEW — patient zone sub-component |
| 10 | `src/components/ClinicHud.js` | NEW — HUD sub-component |
| 11 | `src/components/ActionBar.js` | NEW — action bar sub-component |
| 12 | `src/screens/ClinicViewScreen.js` | Orchestrator rewrite using sub-components |
| 13 | `src/components/SpineView.js` | Examination table redesign |
| 14 | `src/screens/TreatmentScreen.js` | Updated wrapper for new SpineView |
| 15 | `src/components/EndOfDayReport.js` | Warm palette + letterhead |
| 16 | `src/components/SaveSelectModal.js` | Filing cabinet style |
| 17 | `src/components/ParticleSystem.js` | Warm color update |
| 18 | `src/screens/ShopScreen.js` | Catalog/desk style |
| 19 | `src/screens/ConsultationScreen.js` | Paper document style |
| 20 | `src/screens/GameModeSelector.js` | Desk file selection style |
| 21 | `src/screens/AchievementsScreen.js` | Trophy shelf on wall style |
| 22 | `src/screens/PathologyBookScreen.js` | Physical book on desk |
| 23 | `src/components/AppointmentRegistry.js` | Warm palette, keep CRT scanlines |
| 24 | `src/screens/IntroVideoScreen.js` | Warm palette, desk-themed intro |
| 25 | `src/screens/IntroductionStory.js` | Warm palette update |

---

## Chunk 1: Foundation (Tasks 1–4)

**Milestone gate:** After these 4 tasks, the entire app renders with warm brown palette. All 30 files that reference `COLORS` automatically get the new values. Individual component shapes still look "off" but colors are correct.

---

### Task 1: theme.js — Complete Palette Replacement

**Files:**
- Modify: `src/utils/theme.js` (entire file)

**Context:** This is the single most impactful change. All 30 files import `COLORS` from here. Changing the object values immediately cascades warm colors everywhere. The `lighten()` and `darken()` helper functions stay the same. `PIXEL_FONT`, `PIXEL_BORDER`, `PIXEL_SHADOW` get updated to warm tones.

- [ ] **Step 1: Replace the entire COLORS object**

Replace the current cold-blue COLORS object with the warm palette from the spec (Section 1). Every token listed in the spec table must be present. Key changes:
- `bg`: `#0d0d1a` → `#3f2832` (warm dark brown)
- `primary`: `#e94560` → `#ffba35` (golden)
- `secondary`: `#533483` → `#8b4513` (saddle brown)
- `accent`: `#00b4d8` → `#4a9e5c` (health green)
- `paper`: `#fdf6e3` → `#f7f3f2`
- `white`: `#edf2f4` → `#f7f3f2`
- `dark`: `#1e1e32` → `#2b1810`
- All other tokens per spec table

Add new tokens that don't exist yet:
- `desk`, `deskLight`, `deskDark`
- `wall`, `wallDark`
- `border`
- `bone`, `boneDark` (already exist, update values)
- Rarity tokens stay the same values

```javascript
// 8-bit Pixel Art Theme for ChiroHero - Warm Clinic Style (Prescribe & Pray)
export const COLORS = {
  // Backgrounds - Warm dark browns
  bg: '#3f2832',
  bgDark: '#2d1b24',
  bgLight: '#5c3d4a',
  bgMedium: '#4a2e3a',

  // Desk/wood surface
  desk: '#6b4c3b',
  deskLight: '#8a6650',
  deskDark: '#4a3328',

  // Primary palette - Golden
  primary: '#ffba35',
  primaryLight: '#ffd06a',
  primaryDark: '#d4951a',
  secondary: '#8b4513',
  secondaryLight: '#a0622d',
  accent: '#4a9e5c',
  accentLight: '#6bbd7a',
  accentDark: '#357a44',

  // Paper/documents
  paper: '#f7f3f2',
  paperDark: '#e8e0d8',
  paperLight: '#fefcfb',
  ink: '#2b1810',
  inkLight: '#5a4035',

  // Feedback
  gold: '#e8a830',
  goldLight: '#f4c55a',
  goldDark: '#b8861e',
  green: '#4a9e5c',
  greenLight: '#6bbd7a',
  greenDark: '#357a44',
  red: '#c1374f',
  redLight: '#e05068',
  redDark: '#962a3e',
  orange: '#d4731a',
  orangeLight: '#e8943a',

  // Neutrals
  white: '#f7f3f2',
  gray: '#9a8a80',
  grayLight: '#c4b8b0',
  grayDark: '#6a5a50',
  dark: '#2b1810',
  darkAlt: '#3a2820',
  black: '#1a0e08',
  border: '#d7c8c4',

  // Clinic environment
  wall: '#d4c4b0',
  wallDark: '#b8a898',
  floor: '#6b4c3b',
  floorLight: '#8a6650',
  furniture: '#5a4030',
  furnitureDark: '#4a3328',

  // Game specific - Medical
  skin: '#ffdbac',
  skinDark: '#e8b88a',
  skinLight: '#ffe8cc',
  bone: '#f0ead6',
  boneDark: '#d4ceb8',
  muscle: '#c1440e',
  muscleLight: '#e05530',
  healthy: '#4a9e5c',
  inflamed: '#c1374f',

  // Special/rare (diamondDark added beyond spec for consistency with other color triads)
  diamond: '#b9f2ff',
  diamondDark: '#7ac5cd',
  legendary: '#ffd700',
  epic: '#a335ee',
  rare: '#0070dd',
  uncommon: '#1eff00',
};
```

- [ ] **Step 2: Update PIXEL_BORDER and PIXEL_SHADOW**

```javascript
export const PIXEL_BORDER = {
  borderWidth: 2,
  borderColor: COLORS.border,
};

export const PIXEL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
};
```

- [ ] **Step 3: Verify the file is complete**

Run: `npx expo start --web --port 8082`
Open the app in browser. All screens should render with warm brown tones instead of blue. Colors will look different but nothing should crash. Check the console for any errors.

- [ ] **Step 4: Commit**

```bash
git add src/utils/theme.js
git commit -m "feat: replace cold-blue palette with warm clinic-brown (Prescribe & Pray style)"
```

---

### Task 2: PixelButton — Warm Soft Style

**Files:**
- Modify: `src/components/PixelButton.js` (full rewrite — 134 lines)

**Context:** Currently uses hard pixel bevels (4px border with different colors per edge), scanlines, and zero-radius shadows. Redesign to rounded corners, soft shadow, paper/label aesthetic. Keep the same props API: `title, onPress, color, textColor, style, disabled, small, icon, variant, size`.

- [ ] **Step 1: Rewrite PixelButton.js**

Remove: pixel bevel borders (different color per edge), `innerHighlight` View, `scanlines` View, zero-radius shadow.

Add: `borderRadius: 6`, uniform soft border, `shadowRadius: 4`, press animation via `Animated` scale.

```javascript
import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { COLORS, lighten, darken } from '../utils/theme';
import soundManager from '../utils/soundManager';

export default function PixelButton({
  title, onPress, color = COLORS.primary, textColor,
  style, disabled, small, icon, variant, size
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    soundManager.init();
    soundManager.playClick();
    onPress?.();
  };

  const btnColor = disabled ? COLORS.grayDark : color;
  const isLarge = size === 'large' || variant === 'primary';
  const isDanger = color === COLORS.red || color === COLORS.redDark;

  // Auto-determine text color if not provided
  const resolvedTextColor = textColor
    ? textColor
    : disabled
      ? COLORS.gray
      : (btnColor === COLORS.primary || btnColor === COLORS.gold)
        ? COLORS.ink
        : COLORS.paper;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: btnColor,
            borderColor: disabled ? COLORS.gray : darken(btnColor, 30),
          },
          isLarge && styles.large,
          small && styles.small,
          style,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <Text style={[
          styles.text,
          { color: resolvedTextColor },
          isLarge && styles.largeText,
          small && styles.smallText,
        ]}>
          {icon ? `${icon} ` : ''}{title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2.5,
    elevation: 5,
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: 4,
    elevation: 2,
  },
  text: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  largeText: {
    fontSize: 17,
    letterSpacing: 2,
  },
  smallText: {
    fontSize: 11,
    letterSpacing: 1,
  },
});
```

- [ ] **Step 2: Verify buttons render correctly**

Open app → MainMenuScreen. Buttons should show rounded corners, golden primary color, soft shadow. Check disabled state on any screen that has disabled buttons.

- [ ] **Step 3: Commit**

```bash
git add src/components/PixelButton.js
git commit -m "feat: redesign PixelButton with rounded corners and soft warm style"
```

---

### Task 3: PixelCard — Paper Card Style

**Files:**
- Modify: `src/components/PixelCard.js` (full rewrite — 69 lines)

**Context:** Currently has corner decorations, inner bevel, hard pixel shadow. Replace with paper texture, thin border, soft shadow, optional folded corner. Keep same props API: `children, style, color, borderColor, glow, headerColor, headerContent`.

- [ ] **Step 1: Rewrite PixelCard.js**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

export default function PixelCard({
  children, style,
  color = COLORS.paper,
  borderColor = COLORS.border,
  glow = false,
  headerColor,
  headerContent,
  foldedCorner = false,
}) {
  return (
    <View style={[
      styles.card,
      { backgroundColor: color, borderColor },
      glow && {
        shadowColor: COLORS.gold,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
      },
      style,
    ]}>
      {/* Optional header strip (file folder tab) */}
      {headerContent && (
        <View style={[
          styles.header,
          { backgroundColor: headerColor || COLORS.primary },
        ]}>
          {headerContent}
        </View>
      )}

      {children}

      {/* Optional folded corner decoration */}
      {foldedCorner && (
        <View style={styles.foldedCorner}>
          <View style={styles.foldTriangle} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    padding: 12,
    marginVertical: 5,
    borderRadius: 4,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  foldedCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    overflow: 'hidden',
  },
  foldTriangle: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    backgroundColor: COLORS.paperDark,
    transform: [{ rotate: '45deg' }],
  },
});
```

- [ ] **Step 2: Verify cards render correctly**

Check any screen using PixelCard (ClinicViewScreen uses it for patient info, TreatmentScreen uses it for techniques). Cards should appear as warm paper with thin borders and soft shadows.

- [ ] **Step 3: Commit**

```bash
git add src/components/PixelCard.js
git commit -m "feat: redesign PixelCard with paper texture and soft shadow style"
```

---

### Task 4: PixelText — Add fontFamily Prop

**Files:**
- Modify: `src/components/PixelText.js` (65 lines → ~80 lines)

**Context:** Currently always uses monospace. Add a `fontFamily` prop: `'mono'` (default, monospace — documents, data) or `'ui'` (system sans-serif — titles, UI labels). The `'ui'` variant gets a subtle shadow instead of the hard 2px pixel shadow.

- [ ] **Step 1: Update PixelText.js**

Add `fontFamily` prop. When `fontFamily === 'ui'`, use system default font (just omit fontFamily or use `System`), remove hard shadow, use subtle shadow. Keep everything else the same.

```javascript
import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../utils/theme';

const UI_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  default: 'sans-serif',
});

export default function PixelText({
  children, style,
  size = 'normal',
  color = COLORS.white,
  center,
  shadow = true,
  glow = false,
  outline = false,
  badge = false,
  badgeColor,
  fontFamily = 'mono',
}) {
  const isUI = fontFamily === 'ui';

  const textElement = (
    <Text
      style={[
        styles.base,
        isUI && styles.uiBase,
        sizes[size] || sizes.normal,
        { color },
        isUI && { fontFamily: UI_FONT },
        center && styles.center,
        shadow && !isUI && styles.shadow,
        shadow && isUI && styles.uiShadow,
        glow && { textShadowColor: color, textShadowRadius: 8 },
        outline && { textShadowColor: COLORS.dark, textShadowRadius: 3 },
        style,
      ]}
    >
      {children}
    </Text>
  );

  if (badge) {
    return (
      <View style={[styles.badge, {
        backgroundColor: badgeColor || color + '25',
        borderColor: color + '50',
      }]}>
        {textElement}
      </View>
    );
  }

  return textElement;
}

const sizes = {
  tiny: { fontSize: 10, lineHeight: 14 },
  small: { fontSize: 12, lineHeight: 16 },
  normal: { fontSize: 14, lineHeight: 20 },
  medium: { fontSize: 18, lineHeight: 24 },
  large: { fontSize: 24, lineHeight: 30 },
  xlarge: { fontSize: 32, lineHeight: 38 },
  title: { fontSize: 40, lineHeight: 46 },
  giant: { fontSize: 56, lineHeight: 62 },
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  uiBase: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  center: {
    textAlign: 'center',
  },
  shadow: {
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  uiShadow: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderRadius: 3,
  },
});
```

- [ ] **Step 2: Verify text renders correctly**

Open app → any screen. Existing text should look the same (all uses default to `'mono'`). No visual change expected yet — this just adds the capability for future use.

- [ ] **Step 3: Commit**

```bash
git add src/components/PixelText.js
git commit -m "feat: add fontFamily prop to PixelText ('mono'/'ui' variants)"
```

---

## Chunk 2: Core Screens — MainMenuScreen (Task 5)

**Context:** The main menu is the first screen users see. Currently has 50 animated stars, 14 floating particles, and a spine vertebrae decoration — all in a cold blue space theme. Replace entirely with a warm desk surface, clinic letterhead, and stacked file tabs.

---

### Task 5: MainMenuScreen — Complete Desk Redesign

**Files:**
- Modify: `src/screens/MainMenuScreen.js` (full rewrite — 969 lines → ~500 lines)

**Context:** This screen currently generates 50 stars and 14 particles at module level, causing performance issues. The new design replaces all of that with a static wood desk surface, an animated letterhead document, a seal stamp, and stacked file tabs. Much simpler, much fewer Views.

Read the current file fully before editing: `src/screens/MainMenuScreen.js`

- [ ] **Step 1: Remove old constants and generators**

Delete `STAR_COUNT`, `PARTICLE_COUNT`, `VERTEBRAE_COUNT`, `generateStars()`, `generateParticles()` functions and all their related rendering code (StarField, ParticleField, SpineDecoration components if they exist inline).

- [ ] **Step 2: Add desk surface background**

Replace the deep space `bg` background with a full-screen desk surface:
- Main background: `COLORS.desk` (#6b4c3b)
- 5-8 thin horizontal Views for wood grain lines (varying opacity, height 1-2px, `COLORS.deskDark + '30'`)
- Keep it simple — just background + subtle grain

```javascript
// Wood grain lines (subtle texture)
const WoodGrain = React.memo(() => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {[15, 28, 42, 58, 72, 85].map((top, i) => (
      <View key={i} style={{
        position: 'absolute',
        left: 0, right: 0,
        top: `${top}%`,
        height: i % 2 === 0 ? 2 : 1,
        backgroundColor: COLORS.deskDark + (i % 2 === 0 ? '25' : '15'),
      }} />
    ))}
  </View>
));
```

- [ ] **Step 3: Create letterhead document component**

Center of screen: a paper card (View) representing the clinic letterhead:
- Background: `COLORS.paper`
- Border: `COLORS.border`, 1.5px, borderRadius: 4
- Contains: "CHIRO HERO" title (large, `COLORS.ink`, fontFamily 'ui'), subtitle "Licensed Chiropractor" (small, `COLORS.inkLight`, fontFamily 'mono')
- Seal stamp below text: circular View (50x50, borderRadius: 25, border: 3px dashed `COLORS.gold`, background: `COLORS.gold + '15'`), "★" in center
- Soft shadow

```javascript
const Letterhead = ({ titleAnim, sealAnim }) => (
  <Animated.View style={[styles.letterhead, { opacity: titleAnim }]}>
    <View style={styles.letterheadInner}>
      {/* Decorative top line */}
      <View style={styles.letterheadLine} />
      <PixelText size="title" color={COLORS.ink} center shadow={false} fontFamily="ui">
        CHIRO HERO
      </PixelText>
      <PixelText size="small" color={COLORS.inkLight} center shadow={false}>
        Licensed Chiropractor
      </PixelText>
      <View style={styles.letterheadLine} />
      {/* Seal stamp */}
      <Animated.View style={[styles.seal, {
        transform: [{ scale: sealAnim }],
      }]}>
        <PixelText size="medium" color={COLORS.gold} center shadow={false}>★</PixelText>
      </Animated.View>
    </View>
  </Animated.View>
);
```

- [ ] **Step 4: Create file tab buttons**

Below the letterhead, stacked file tabs for secondary navigation:
- Each tab: horizontal View, background varies (one warm color per tab), slight rotation (1-2deg) for organic feel
- Tabs: Tutorial, Manual/Pathology Book, Achievements, Language, Sound settings
- Use PixelButton or custom TouchableOpacity styled as paper tabs

- [ ] **Step 5: Create entrance animation sequence**

Using Animated API with useNativeDriver: true for all transform/opacity:
1. Desk background fades in (opacity 0→1, 200ms)
2. Letterhead slides down (translateY: -50→0, 400ms, spring bounce)
3. "CHIRO HERO" types out (or fades in word by word — simpler with opacity)
4. Seal stamps with scale bounce (0→1.3→1, 300ms, delay 800ms)
5. PLAY button slides up from bottom (translateY: 80→0, spring, delay 1000ms)
6. File tabs fan in staggered (opacity 0→1 + translateX: -30→0, stagger 100ms, delay 1200ms)

- [ ] **Step 6: Add decorative desk items**

Small static Views positioned with percentage-based positioning:
- Coffee mug: top-right (~85%, 8%) — brown rect + inner white, 2 animated steam Views
- Pen: bottom-left (~8%, 82%) — diagonal dark rect (transform rotate 30deg)
- Post-its: top-left (~5%, 12%) — 2 small colored squares (~20x20), slight rotation
- Keep these minimal (< 20 total Views for all decorations)

- [ ] **Step 7: Keep all existing navigation logic intact**

Preserve: `handlePlay`, `handleSaveSelect`, `handleLanguageChange`, `handleMusicToggle`, all state management, `SaveSelectModal` rendering, navigation callbacks. Only the visual rendering changes.

- [ ] **Step 8: Verify MainMenuScreen**

Open app. Should see:
- Warm brown wood desk background
- Paper letterhead with "CHIRO HERO" centered
- Golden seal stamp
- Golden PLAY button
- File tabs for navigation
- Subtle desk decorations
- Entrance animation plays on load
- All buttons navigate correctly

- [ ] **Step 9: Commit**

```bash
git add src/screens/MainMenuScreen.js
git commit -m "feat: redesign MainMenuScreen as warm desk with letterhead and file tabs"
```

---

## Chunk 3: Core Screens — PatientPortrait & Px Helper (Tasks 6–7)

---

### Task 6: PatientPortrait — New Caricature Component

**Files:**
- Create: `src/components/PatientPortrait.js` (~350 lines)

**Context:** New component — doesn't replace PixelAvatar (which is kept for walking scenes in AerialViewScreen). PatientPortrait renders a 24x28 grid as a large caricature bust (~120x140px). Uses procedural generation from a seed (patient name hash). Maximum 180 Views, static parts wrapped in useMemo.

Read the spec Section 3 for full coordinate reference and parameter lists.

- [ ] **Step 1: Create the base component structure**

```javascript
import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';

const GRID_W = 24;
const GRID_H = 28;
const SKIN_TONES = ['#ffe8cc', '#ffdbac', '#e8b88a', '#c49870', '#8d6e4a', '#5a3e28'];
const HAIR_COLORS = ['#2b1810', '#5a3e28', '#8b4513', '#d4731a', '#e8a830', '#c1374f', '#4a2e3a', '#9a8a80'];
const SHIRT_COLORS = [
  COLORS.primary, COLORS.accent, COLORS.red, COLORS.secondary,
  '#4a6fa5', '#6b4c3b', '#5c3d4a', '#357a44',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed, index) {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

export default function PatientPortrait({
  name = 'Patient',
  expression = 'neutral',
  size = 120,
  style,
}) {
  const px = size / GRID_W;
  const seed = hashString(name);

  // Derive traits from seed
  const skinTone = SKIN_TONES[seed % SKIN_TONES.length];
  const hairColor = HAIR_COLORS[(seed >> 3) % HAIR_COLORS.length];
  const shirtColor = SHIRT_COLORS[(seed >> 6) % SHIRT_COLORS.length];
  const faceShape = seed % 6; // 0-5
  const noseType = (seed >> 4) % 5;
  const eyeType = (seed >> 7) % 4;
  const hairStyle = (seed >> 9) % 8;
  const facialHair = (seed >> 11) % 4;
  const accessory = (seed >> 13) % 4;

  const portrait = useMemo(() => {
    const pixels = [];
    let viewCount = 0;

    const addPx = (x, y, w, h, color, key) => {
      if (viewCount >= 180) return; // Budget cap
      viewCount++;
      pixels.push(
        <View key={key} style={{
          position: 'absolute',
          left: x * px,
          top: y * px,
          width: (w || 1) * px,
          height: (h || 1) * px,
          backgroundColor: color,
        }} />
      );
    };

    // --- HAIR (rows 0-3) ---
    buildHair(addPx, hairStyle, hairColor, GRID_W);

    // --- FACE (rows 4-16) ---
    buildFace(addPx, faceShape, skinTone, GRID_W);

    // --- EYES (rows 6-7) ---
    buildEyes(addPx, eyeType, expression, GRID_W);

    // --- NOSE (rows 8-9) ---
    buildNose(addPx, noseType, skinTone, GRID_W);

    // --- MOUTH (rows 12-13) ---
    buildMouth(addPx, expression, GRID_W);

    // --- FACIAL HAIR ---
    if (facialHair > 0) {
      buildFacialHair(addPx, facialHair, hairColor, GRID_W);
    }

    // --- ACCESSORIES ---
    if (accessory > 0) {
      buildAccessory(addPx, accessory, GRID_W);
    }

    // --- NECK (rows 17-18) ---
    addPx(9, 17, 6, 2, skinTone, 'neck');

    // --- SHOULDERS (rows 19-27) ---
    buildShoulders(addPx, shirtColor, GRID_W);

    return pixels;
  }, [name, expression]);

  const height = (GRID_H / GRID_W) * size;

  return (
    <View style={[{ width: size, height }, style]}>
      {portrait}
    </View>
  );
}
```

- [ ] **Step 2: Implement builder functions**

Write each builder function below the component. These generate pixel arrays for each face part:

**`buildHair(addPx, style, color, gridW)`** — 8 hair styles using rectangles. Example for style 0 (short):
```javascript
function buildHair(addPx, style, color, gridW) {
  switch (style) {
    case 0: // Short
      addPx(5, 0, 14, 1, color, 'hair-top');
      addPx(4, 1, 16, 2, color, 'hair-mid');
      addPx(4, 3, 16, 1, color, 'hair-fringe');
      break;
    case 1: // Tall
      addPx(6, 0, 12, 1, color, 'hair-top0');
      addPx(5, 1, 14, 1, color, 'hair-top1');
      addPx(4, 2, 16, 2, color, 'hair-mid');
      addPx(4, 4, 16, 1, color, 'hair-fringe');
      break;
    // ... cases 2-7 (bald, mohawk, side-swept, curly, long, ponytail)
  }
}
```

**`buildFace(addPx, shape, skin, gridW)`** — 6 face shapes. Round = wide oval (cols 4-19, rows 4-16). Square = rectangle (cols 5-18). Each shape defines different jaw width.

**`buildEyes(addPx, type, expression, gridW)`** — Varies by expression. Neutral: 2x2 dark dots. Pain: X pattern. Happy: arc. Etc.

**`buildNose(addPx, type, skin, gridW)`** — 5 nose types at center (cols 9-14). Big round = 4x3 block with darker skin tone.

**`buildMouth(addPx, expression, gridW)`** — Varies by expression. Neutral: straight line. Pain: wide oval. Happy: curve.

**`buildFacialHair(addPx, type, color, gridW)`** — Mustache, beard, goatee overlays below nose/chin.

**`buildAccessory(addPx, type, gridW)`** — Glasses (border around eye area), bandage (forehead strip), hat (top rows).

**`buildShoulders(addPx, color, gridW)`** — Collar at row 19-20, wider shoulder blocks rows 21-27.

Each builder should use 15-30 Views max. Total across all builders ≤ 180.

- [ ] **Step 3: Add breathing idle animation**

```javascript
// In the component, wrap the portrait in an Animated.View with subtle scale loop:
const breathAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(breathAnim, { toValue: 1.01, duration: 1000, useNativeDriver: true }),
      Animated.timing(breathAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])
  ).start();
}, []);

// Wrap portrait in:
<Animated.View style={[{ width: size, height, transform: [{ scaleY: breathAnim }] }, style]}>
  {portrait}
</Animated.View>
```

- [ ] **Step 4: Verify PatientPortrait renders**

Temporarily import PatientPortrait into MainMenuScreen or any screen and render it with a test name:
```javascript
<PatientPortrait name="Test Patient" expression="neutral" size={120} />
```

Verify: a caricature bust appears with head, eyes, nose, mouth, hair, shoulders. Different names produce different appearances.

Remove the test import after verification.

- [ ] **Step 5: Commit**

```bash
git add src/components/PatientPortrait.js
git commit -m "feat: add PatientPortrait component (24x28 caricature bust with procedural generation)"
```

---

### Task 7: Px Shared Helper

**Files:**
- Create: `src/components/Px.js` (~15 lines)
- Modify: `src/screens/ClinicViewScreen.js` (replace inline Px definition with import)

**Context:** ClinicViewScreen defines `Px` locally. Extract it so DeskWorkspace, PatientZone, and other new components can share it.

- [ ] **Step 1: Create Px.js**

```javascript
import React from 'react';
import { View } from 'react-native';

export default function Px({ x, y, w, h, color, style }) {
  return (
    <View style={[{
      position: 'absolute',
      left: x,
      top: y,
      width: w || 4,
      height: h || 4,
      backgroundColor: color,
    }, style]} />
  );
}
```

- [ ] **Step 2: Commit Px.js standalone**

Note: Do NOT modify ClinicViewScreen.js yet — it will be rewritten entirely in Task 12, which will import Px.js at that time. The local `Px` definition in ClinicViewScreen continues to work until then.

```bash
git add src/components/Px.js
git commit -m "feat: create shared Px helper component for pixel-positioned Views"
```

---

## Chunk 4: Core Screens — ClinicViewScreen Decomposition (Tasks 8–12)

**Context:** ClinicViewScreen is 1805 lines and does everything: HUD, patient display, desk items, action buttons, modals, state management. Decompose into 4 sub-components (DeskWorkspace, PatientZone, ClinicHud, ActionBar) + orchestrator. This is the biggest and most delicate change.

**Strategy:** Create each sub-component first (Tasks 8-11) with the new visual style, then rewrite ClinicViewScreen as orchestrator (Task 12) that imports them. The orchestrator keeps all state management, passes data down via props.

**IMPORTANT:** Before starting Task 8, read the full ClinicViewScreen.js to understand all state variables, functions, and rendering sections. The sub-components need to receive the right props.

---

### Task 8: DeskWorkspace Sub-component

**Files:**
- Create: `src/components/DeskWorkspace.js` (~200 lines)

**Context:** The desk workspace is the main area (flex: 5) showing the wood surface with patient file, tools, stamp, and decorative items. Receives patient data as props to display the current patient's file card.

- [ ] **Step 1: Create DeskWorkspace.js**

Read ClinicViewScreen.js fully first to understand what patient data is available.

The component receives props:
- `patient` — current patient object (or null)
- `onExamine` — callback when player taps examine
- `onStamp` — callback for approve/deny stamp action
- `showFile` — boolean, whether to show patient file
- `fileSlideAnim` — Animated.Value for file entrance

Structure:
```javascript
import React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PixelCard from './PixelCard';
import Px from './Px';

export default function DeskWorkspace({ patient, showFile, fileSlideAnim, onExamine, onStamp }) {
  return (
    <View style={styles.container}>
      {/* Wood surface background */}
      <View style={styles.woodSurface}>
        <WoodGrain />
      </View>

      {/* Patient file (slides onto desk) */}
      {patient && showFile && (
        <Animated.View style={[styles.patientFile, {
          transform: [{ translateY: fileSlideAnim }],
        }]}>
          <PixelCard color={COLORS.paper} borderColor={COLORS.border}>
            {/* Patient name and details */}
            <PixelText size="small" color={COLORS.ink} shadow={false}>
              📋 {patient.name}
            </PixelText>
            <PixelText size="tiny" color={COLORS.inkLight} shadow={false}>
              {patient.complaint}
            </PixelText>
          </PixelCard>
        </Animated.View>
      )}

      {/* Tools rack (right edge) */}
      <View style={styles.toolsRack}>
        {['🤲', '🎯', '⬇️', '🔧'].map((tool, i) => (
          <View key={i} style={styles.toolIcon}>
            <PixelText size="medium" shadow={false}>{tool}</PixelText>
          </View>
        ))}
      </View>

      {/* Decorative items */}
      <CoffeeMug />
      <DeskPen />
      <PostIts />
    </View>
  );
}

// Wood grain lines
const WoodGrain = React.memo(() => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {[12, 25, 40, 55, 70, 83].map((top, i) => (
      <View key={i} style={{
        position: 'absolute', left: 0, right: 0,
        top: `${top}%`,
        height: i % 2 === 0 ? 2 : 1,
        backgroundColor: COLORS.deskDark + (i % 2 === 0 ? '20' : '12'),
      }} />
    ))}
  </View>
));

// Coffee mug (top-right)
const CoffeeMug = React.memo(() => (
  <View style={styles.coffeeMug}>
    {/* Mug body */}
    <View style={styles.mugBody}>
      <View style={styles.mugInner} />
    </View>
    {/* Handle */}
    <View style={styles.mugHandle} />
  </View>
));

// Pen (bottom-left diagonal)
const DeskPen = React.memo(() => (
  <View style={styles.pen} />
));

// Post-it notes (top-left)
const PostIts = React.memo(() => (
  <View style={styles.postIts}>
    <View style={[styles.postIt, { backgroundColor: COLORS.primary + '90', transform: [{ rotate: '-3deg' }] }]} />
    <View style={[styles.postIt, { backgroundColor: COLORS.accentLight + '90', transform: [{ rotate: '2deg' }], left: 12 }]} />
  </View>
));
```

Add styles for all sub-elements: wood surface, patient file positioning, tools rack, coffee mug, pen, post-its.

- [ ] **Step 2: Commit**

```bash
git add src/components/DeskWorkspace.js
git commit -m "feat: create DeskWorkspace sub-component with wood surface and desk items"
```

---

### Task 9: PatientZone Sub-component

**Files:**
- Create: `src/components/PatientZone.js` (~180 lines)

**Context:** Upper area (flex: 2) showing clinic wall, patient portrait, speech bubble, and status badges. Uses the new PatientPortrait component.

- [ ] **Step 1: Create PatientZone.js**

```javascript
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';
import PatientPortrait from './PatientPortrait';

export default function PatientZone({ patient, dialogue, badges }) {
  const slideAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (patient) {
      slideAnim.setValue(200);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [patient?.name]);

  return (
    <View style={styles.container}>
      {/* Clinic wall background */}
      <View style={styles.wall}>
        {/* Diploma frame */}
        <View style={styles.diploma}>
          <View style={styles.diplomaInner}>
            <PixelText size="tiny" color={COLORS.ink} shadow={false} center>
              📜 DIPLOMA
            </PixelText>
          </View>
        </View>

        {/* Spine poster */}
        <View style={styles.spinePoster}>
          <View style={styles.posterLine} />
          <View style={styles.posterLine} />
          <View style={styles.posterLine} />
        </View>
      </View>

      {/* Patient portrait + speech bubble */}
      {patient && (
        <Animated.View style={[styles.patientArea, {
          transform: [{ translateX: slideAnim }],
        }]}>
          <PatientPortrait
            name={patient.name}
            expression={patient.expression || 'neutral'}
            size={120}
          />

          {/* Status badges */}
          {badges && badges.length > 0 && (
            <View style={styles.badges}>
              {badges.map((badge, i) => (
                <View key={i} style={[styles.badge, {
                  backgroundColor: badge.color + '20',
                  borderColor: badge.color,
                }]}>
                  <PixelText size="tiny" color={badge.color} shadow={false}>
                    {badge.label}
                  </PixelText>
                </View>
              ))}
            </View>
          )}

          {/* Speech bubble */}
          {dialogue && (
            <View style={styles.speechBubble}>
              <PixelText size="small" color={COLORS.ink} shadow={false}>
                "{dialogue}"
              </PixelText>
              <View style={styles.speechTail} />
            </View>
          )}
        </Animated.View>
      )}

      {/* Waiting state */}
      {!patient && (
        <View style={styles.emptyState}>
          <PixelText size="small" color={COLORS.gray} center>
            🚪 Waiting for patient...
          </PixelText>
        </View>
      )}
    </View>
  );
}
```

Add styles: wall background (`COLORS.wall`), diploma frame (small paper rect), spine poster (3 vertical lines), patient area centering, speech bubble (paper background, small triangle tail), badges row.

- [ ] **Step 2: Commit**

```bash
git add src/components/PatientZone.js
git commit -m "feat: create PatientZone sub-component with wall, portrait, and speech bubble"
```

---

### Task 10: ClinicHud Sub-component

**Files:**
- Create: `src/components/ClinicHud.js` (~120 lines)

**Context:** Top HUD bar (flex: 0, ~60px) showing day number, money, reputation, and timer. Styled as sticky labels / post-it indicators on a dark wood strip.

- [ ] **Step 1: Create ClinicHud.js**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from './PixelText';

export default function ClinicHud({ day, money, reputation, timer, season }) {
  return (
    <View style={styles.container}>
      {/* Day indicator */}
      <View style={[styles.indicator, styles.dayIndicator]}>
        <PixelText size="tiny" color={COLORS.ink} shadow={false}>📅</PixelText>
        <PixelText size="small" color={COLORS.ink} shadow={false}>
          Day {day}
        </PixelText>
      </View>

      {/* Money */}
      <View style={[styles.indicator, styles.moneyIndicator]}>
        <PixelText size="tiny" color={COLORS.goldDark} shadow={false}>💰</PixelText>
        <PixelText size="small" color={COLORS.goldDark} shadow={false}>
          ${money}
        </PixelText>
      </View>

      {/* Reputation */}
      <View style={[styles.indicator, styles.repIndicator]}>
        <PixelText size="tiny" color={COLORS.primary} shadow={false}>⭐</PixelText>
        <PixelText size="small" color={COLORS.primary} shadow={false}>
          {reputation}
        </PixelText>
      </View>

      {/* Timer */}
      {timer && (
        <View style={[styles.indicator, styles.timerIndicator]}>
          <PixelText size="tiny" color={COLORS.ink} shadow={false}>🕐</PixelText>
          <PixelText size="small" color={COLORS.ink} shadow={false}>
            {timer}
          </PixelText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.deskDark,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.deskDark + '80',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
  },
  dayIndicator: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moneyIndicator: {
    backgroundColor: COLORS.gold + '20',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
  },
  repIndicator: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  timerIndicator: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ClinicHud.js
git commit -m "feat: create ClinicHud sub-component with sticky-label indicators"
```

---

### Task 11: ActionBar Sub-component

**Files:**
- Create: `src/components/ActionBar.js` (~100 lines)

**Context:** Bottom action bar (flex: 0, ~80px) with 3-4 main action buttons. Uses PixelButton with golden primary style. Buttons have slight rotation for organic feel.

- [ ] **Step 1: Create ActionBar.js**

```javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelButton from './PixelButton';
import { t } from '../utils/i18n';

export default function ActionBar({
  onExamine, onDiagnose, onTreat, onEndDay,
  canExamine, canDiagnose, canTreat, canEndDay,
  patientPresent,
}) {
  if (!patientPresent) {
    return (
      <View style={styles.container}>
        <View style={[styles.buttonWrapper, { transform: [{ rotate: '-0.5deg' }] }]}>
          <PixelButton
            title={t('nextPatient') || 'NEXT PATIENT'}
            icon="🚪"
            color={COLORS.primary}
            onPress={onExamine}
            disabled={!canExamine}
          />
        </View>
        {canEndDay && (
          <View style={[styles.buttonWrapper, { transform: [{ rotate: '0.5deg' }] }]}>
            <PixelButton
              title={t('endDay') || 'END DAY'}
              icon="🌙"
              color={COLORS.secondary}
              onPress={onEndDay}
              small
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.buttonWrapper, { transform: [{ rotate: '-1deg' }] }]}>
        <PixelButton
          title={t('examine') || 'EXAMINE'}
          icon="🔍"
          color={COLORS.primary}
          onPress={onExamine}
          disabled={!canExamine}
          small
        />
      </View>
      <View style={[styles.buttonWrapper, { transform: [{ rotate: '0.5deg' }] }]}>
        <PixelButton
          title={t('diagnose') || 'DIAGNOSE'}
          icon="📋"
          color={COLORS.accent}
          onPress={onDiagnose}
          disabled={!canDiagnose}
          small
        />
      </View>
      <View style={[styles.buttonWrapper, { transform: [{ rotate: '-0.5deg' }] }]}>
        <PixelButton
          title={t('treat') || 'TREAT'}
          icon="🤲"
          color={COLORS.gold}
          onPress={onTreat}
          disabled={!canTreat}
          small
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.deskDark,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.desk,
  },
  buttonWrapper: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ActionBar.js
git commit -m "feat: create ActionBar sub-component with organic-feel action buttons"
```

---

### Task 12: ClinicViewScreen — Orchestrator Rewrite

**Files:**
- Modify: `src/screens/ClinicViewScreen.js` (major rewrite — 1805 lines → ~800 lines)

**Context:** This is the most complex task. ClinicViewScreen currently contains ALL rendering + state management. The rewrite keeps all state management (patient flow, day timer, achievements, modals) in the orchestrator and delegates rendering to the 4 sub-components via props.

**CRITICAL:** Read the entire current ClinicViewScreen.js before starting. Identify every state variable, every handler function, and every modal/overlay. Nothing must be lost.

- [ ] **Step 1: Catalog all state and handlers**

Read `src/screens/ClinicViewScreen.js` completely. Here is the reference catalog of key state and handlers to preserve:

**State variables (all useState):**
- `state` (gameState.state), `patients`, `currentPatientIndex`
- `dayStarted`, `dayEnded`, `dayEarnings`, `previousEarnings`, `displayEarnings`
- `caMessage` (chiropractic assistant dialogue)
- `moneyParticlesActive`, `showParticles`
- `showBookingsModal`, `pendingBookings`
- `showInspection`, `showAchievement`, `currentAchievement`, `pendingAchievements`
- `showDailyMissions`, `showRegistry`, `showEndOfDayReport`, `dayReport`
- `dayTimeRemaining`, `dayTimerRef` (useRef)
- `reputationInfo`, `streakInfo`, `seasonInfo`
- `timeOfDay`, `patientExpression`
- Animation values: `walkAnim`, `animatedEarnings`, `sunAnim`, `moonAnim`, `clockAnim`, `pulseAnim`, `starAnim`

**Key handler functions (all useCallback):**
- `animatePatientEntry()` — slide patient in
- `startDay()` — initialize day, generate patients, start timer
- `handlePatientComplete(result)` — process treatment result, update earnings/reputation
- `endDay()` — stop timer, calculate report, show EndOfDayReport
- `nextDay()` — advance to next day, save, reset
- `handleAcceptBooking(booking)` — accept patient booking
- `handleRejectBooking(booking)` — reject patient booking

**Modal components rendered:**
- `BookingsModal` (showBookingsModal, pendingBookings)
- `HealthInspectionModal` (showInspection)
- `AppointmentRegistry` (showRegistry)
- `EndOfDayReport` (showEndOfDayReport, dayReport)
- `AchievementNotification` (showAchievement, currentAchievement)
- `ParticleSystem` (moneyParticlesActive)
- `DailyMissionsWidget` (showDailyMissions)

**Imports to keep:** gameState, soundManager, generatePatient, generatePremiumPatient, getCADialogue, generateBookings, t (i18n), checkAchievements, unlockAchievement, getReputationTitle, getCurrentRank, getSeasonNumber, getStreakBonus, SEASON_LENGTH_DAYS

**Imports to remove:** PixelAvatar (replaced by PatientPortrait in PatientZone)

**Inline components to remove:** Px, PlankRow, WEATHER_COLORS, getTimeOfDay, WeatherSky, WalkingPatient, WallClock — all rendering is now in sub-components

- [ ] **Step 2: Remove all inline rendering code**

Delete: `WeatherSky`, `PlankRow`, local `Px`, all room/wall/floor rendering Views, all HUD rendering Views, all patient display rendering, all action button rendering.

Keep: All state variables, all handlers, all modal components, all imports for modals.

- [ ] **Step 3: Add sub-component imports and layout**

```javascript
import ClinicHud from '../components/ClinicHud';
import PatientZone from '../components/PatientZone';
import DeskWorkspace from '../components/DeskWorkspace';
import ActionBar from '../components/ActionBar';
```

Replace the rendering section with:

```javascript
return (
  <View style={styles.container}>
    <ClinicHud
      day={currentDay}
      money={money}
      reputation={reputation}
      timer={formatTimer(timeRemaining)}
      season={currentSeason}
    />

    <PatientZone
      patient={currentPatient}
      dialogue={currentDialogue}
      badges={getPatientBadges(currentPatient)}
    />

    <DeskWorkspace
      patient={currentPatient}
      showFile={showPatientFile}
      fileSlideAnim={fileSlideAnim}
      onExamine={handleExamine}
      onStamp={handleStamp}
    />

    <ActionBar
      onExamine={handleNextPatient}
      onDiagnose={handleDiagnose}
      onTreat={handleTreat}
      onEndDay={handleEndDay}
      canExamine={canExamine}
      canDiagnose={canDiagnose}
      canTreat={canTreat}
      canEndDay={canEndDay}
      patientPresent={!!currentPatient}
    />

    {/* Modals (keep all existing modals) */}
    <BookingsModal ... />
    <HealthInspectionModal ... />
    <AppointmentRegistry ... />
    <EndOfDayReport ... />
    <AchievementNotification ... />
    <ParticleSystem ... />
    <DailyMissionsWidget ... />
  </View>
);
```

- [ ] **Step 4: Update styles to flex-based layout**

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.desk,
  },
});
```

The sub-components handle their own internal styles. ClinicViewScreen just stacks them vertically.

- [ ] **Step 5: Wire up all props correctly**

Ensure every prop passed to sub-components matches the state/handler names in the orchestrator. Test each flow:
1. Next patient → PatientZone shows portrait + speech, DeskWorkspace shows file
2. Examine → updates state, ActionBar enables Diagnose
3. Diagnose → shows diagnosis info, ActionBar enables Treat
4. Treat → navigates to TreatmentScreen
5. End day → triggers EndOfDayReport modal
6. All modals open/close correctly

- [ ] **Step 6: Verify complete gameplay loop**

Open app → start game → go through:
1. Day starts, HUD shows correct info
2. Accept patient, portrait appears with speech
3. Examine → Diagnose → Treat flow works
4. Treatment screen opens and returns
5. End day report shows
6. Next day starts
7. All modals (bookings, health inspection, achievements) work

- [ ] **Step 7: Commit**

```bash
git add src/screens/ClinicViewScreen.js
git commit -m "refactor: decompose ClinicViewScreen into sub-components (DeskWorkspace, PatientZone, ClinicHud, ActionBar)"
```

---

## Chunk 5: Core Screens — Treatment (Tasks 13–14)

---

### Task 13: SpineView — Examination Table Redesign

**Files:**
- Modify: `src/components/SpineView.js` (visual redesign — 921 lines)

**Context:** Currently renders abstract spine dots on a dark background. Redesign to show an examination table scene with patient lying face-down, visible spine zones, and treatment tools rack. Keep the same functional API (touchable zones, accuracy calculation, callbacks).

Read `src/components/SpineView.js` fully before editing.

- [ ] **Step 1: Replace the background**

Current: dark background with abstract spine column.
New: Cream/beige examination table (borderRadius: 8, #f0e6d3) with pillow at top.

```javascript
// Examination table
<View style={styles.examTable}>
  {/* Pillow */}
  <View style={styles.pillow} />

  {/* Patient back silhouette (simplified skin-tone shape) */}
  <View style={styles.patientBack}>
    {/* Center spine line */}
    <View style={styles.spineLine} />

    {/* Treatment zones overlaid */}
    {renderZones()}
  </View>
</View>
```

- [ ] **Step 2: Restyle treatment zones**

Current: circular dots with pulsing glow.
New: Rectangular zones overlaid on the patient back silhouette. Inflamed = pulsing red opacity (0.7↔1.0 + slight scale 1.0↔1.05). Fixed = green with checkmark.

Keep the same zone IDs and coordinates — just change the visual representation from dots to rectangles.

- [ ] **Step 3: Add tools rack on right side**

Vertical strip on right edge showing available tools. Selected tool has golden border and translateY: -4 lift.

```javascript
<View style={styles.toolsRack}>
  {tools.map((tool, i) => (
    <TouchableOpacity
      key={tool.id}
      style={[
        styles.toolItem,
        selectedTool === tool.id && styles.toolSelected,
      ]}
      onPress={() => onSelectTool(tool.id)}
    >
      <PixelText size="medium" shadow={false}>{tool.icon}</PixelText>
    </TouchableOpacity>
  ))}
</View>
```

- [ ] **Step 4: Update feedback animations**

- Correct technique: green ripple (View with scale 0→2 + opacity 0.6→0, useNativeDriver: true)
- Wrong technique: red flash overlay (opacity animation)
- Zone fixed: radiating lines (4 small Views rotating outward)
- Keep existing ParticleSystem integration for perfect treatment

- [ ] **Step 5: Add pain thermometer**

Left side vertical bar:
```javascript
<View style={styles.painThermometer}>
  <View style={styles.thermometerTrack}>
    <Animated.View style={[styles.thermometerFill, {
      transform: [{ scaleY: painLevel }], // 0-1, animated
    }]} />
  </View>
  <PixelText size="tiny" color={COLORS.red} shadow={false}>PAIN</PixelText>
</View>
```

Note: Use scaleY (useNativeDriver: true) instead of height animation.

- [ ] **Step 6: Verify treatment minigame works**

Start a treatment. Check:
- Examination table with patient silhouette visible
- Spine zones are touchable and respond correctly
- Tools rack shows tools
- Pain thermometer animates
- Correct/wrong feedback animations play
- Score tracking still works

- [ ] **Step 7: Commit**

```bash
git add src/components/SpineView.js
git commit -m "feat: redesign SpineView as examination table scene with tools rack and pain thermometer"
```

---

### Task 14: TreatmentScreen — Updated Wrapper

**Files:**
- Modify: `src/screens/TreatmentScreen.js` (visual update — 1026 lines)

**Context:** Wrapper around SpineView that shows patient info, technique selection, timer, and results. Update visual style to match warm palette — no layout restructuring needed since SpineView handles the scene.

- [ ] **Step 1: Update background and container styles**

Replace dark background with desk/clinic background:
```javascript
container: {
  flex: 1,
  backgroundColor: COLORS.bgDark,
}
```

- [ ] **Step 2: Update patient info card at top**

Use warm PixelCard style with PatientPortrait instead of PixelAvatar:

```javascript
import PatientPortrait from '../components/PatientPortrait';

// Replace PixelAvatar usage:
<PatientPortrait name={patient.name} expression="pain" size={60} />
```

- [ ] **Step 3: Update technique selection panel**

Restyle technique cards to paper/label aesthetic using new PixelCard defaults. Selected technique gets golden border.

- [ ] **Step 4: Update results overlay**

Results screen: paper card style, warm colors for scores, golden "PERFECT" stamp if applicable.

- [ ] **Step 5: Verify full treatment flow**

Navigate to treatment → select technique → complete treatment → see results → return to clinic. Everything should work with new visuals.

- [ ] **Step 6: Commit**

```bash
git add src/screens/TreatmentScreen.js
git commit -m "feat: update TreatmentScreen with warm palette and PatientPortrait"
```

---

## Chunk 6: Secondary Screens (Tasks 15–25)

**Context:** These are simpler visual updates — mostly replacing colors and adjusting borders/shadows to match the warm palette. No major structural changes.

---

### Task 15: EndOfDayReport — Warm Palette Update

**Files:**
- Modify: `src/components/EndOfDayReport.js` (477 lines)

- [ ] **Step 1: Add clinic letterhead at top**

Inside the `paper` View, before the header, add a small letterhead area:
```javascript
<View style={styles.letterhead}>
  <PixelText size="tiny" color={COLORS.inkLight} shadow={false} center>
    🏥 CHIRO HERO CLINIC
  </PixelText>
  <View style={styles.letterheadLine} />
</View>
```

- [ ] **Step 2: Update paper background color**

Change hardcoded `'#f5f0e1'` to `COLORS.paper` (#f7f3f2). Change `'#f0ead6'`/`'#f5f0e1'` in torn teeth to `COLORS.paper`/`COLORS.paperDark`.

- [ ] **Step 3: Update stamp colors**

Replace any remaining neon colors: green stamp border → `COLORS.accent`, red stamp border → `COLORS.red`.

- [ ] **Step 4: Add tape strips to newspaper section**

Small diagonal rectangles at corners of the newspaper section:
```javascript
<View style={styles.tapeStrip} /> {/* top-left */}
<View style={[styles.tapeStrip, styles.tapeRight]} /> {/* top-right */}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/EndOfDayReport.js
git commit -m "feat: update EndOfDayReport with warm palette and clinic letterhead"
```

---

### Task 16: SaveSelectModal — Filing Cabinet Style

**Files:**
- Modify: `src/components/SaveSelectModal.js` (314 lines)

- [ ] **Step 1: Restyle modal to filing cabinet**

Replace current modal background/border with warm tones:
- Modal background: `COLORS.bgMedium` → `COLORS.deskDark`
- Border: `COLORS.primary` → `COLORS.desk`
- Remove corner decorations
- Add borderRadius: 6

- [ ] **Step 2: Restyle slots as drawers**

Active slots: file folder style (paper background, colored tab on left edge, rounded corners)
Empty slots: dark empty drawer (dark background, dashed border, `— EMPTY —` text)

- [ ] **Step 3: Update delete button**

Small red "X" stamp style: `COLORS.red` background, borderRadius: 4, "✕" text.

- [ ] **Step 4: Update header**

Remove diamond decorations. Simple "💾 SAVE FILES" with golden color on dark background.

- [ ] **Step 5: Commit**

```bash
git add src/components/SaveSelectModal.js
git commit -m "feat: restyle SaveSelectModal as filing cabinet with drawer-style slots"
```

---

### Task 17: ParticleSystem — Warm Colors

**Files:**
- Modify: `src/components/ParticleSystem.js` (382 lines)

- [ ] **Step 1: Update confetti colors array**

```javascript
// In PARTICLE_CONFIGS.confetti:
colors: [COLORS.primary, COLORS.gold, COLORS.accent, COLORS.red, COLORS.secondary],
```

This single change updates all confetti from neon to warm tones. Other particle types reference `COLORS.gold`, `COLORS.green`, `COLORS.red` which are already updated via theme.js.

- [ ] **Step 2: Update LevelUpOverlay border/background**

In `levelUpBackground` style:
```javascript
backgroundColor: COLORS.dark + 'EE', // already uses COLORS.dark, will auto-update
borderColor: COLORS.gold, // already references COLORS.gold
```

Verify these look correct with the new warm palette values.

- [ ] **Step 3: Commit**

```bash
git add src/components/ParticleSystem.js
git commit -m "feat: update ParticleSystem confetti to warm palette colors"
```

---

### Task 18: ShopScreen — Catalog Style

**Files:**
- Modify: `src/screens/ShopScreen.js` (621 lines)

- [ ] **Step 1: Update background and container**

Background: `COLORS.desk`. Top header: dark wood strip.

- [ ] **Step 2: Update shop item cards**

Use PixelCard defaults (paper background, border). Category tabs styled as file folder tabs. Upgrade items show paper card style with price tag.

- [ ] **Step 3: Update buy button and price displays**

Golden primary color for buy buttons. Price in `COLORS.gold` with coin icon.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ShopScreen.js
git commit -m "feat: restyle ShopScreen with catalog desk aesthetic"
```

---

### Task 19: ConsultationScreen — Paper Document Style

**Files:**
- Modify: `src/screens/ConsultationScreen.js` (318 lines)

- [ ] **Step 1: Update to paper document layout**

Background: `COLORS.bgDark`. Main content area: paper card style (COLORS.paper). Medical history as typed document with monospace text.

- [ ] **Step 2: Use PatientPortrait**

Replace PixelAvatar with PatientPortrait in the consultation view.

- [ ] **Step 3: Commit**

```bash
git add src/screens/ConsultationScreen.js
git commit -m "feat: restyle ConsultationScreen as paper document"
```

---

### Task 20: GameModeSelector — File Selection Style

**Files:**
- Modify: `src/screens/GameModeSelector.js` (462 lines)

- [ ] **Step 1: Desk background**

Background: `COLORS.desk`. Mode options as stacked file folders on desk.

- [ ] **Step 2: Mode cards as file folders**

Each mode option: paper card with colored tab (different color per mode), folder-tab shape header, brief description in monospace.

- [ ] **Step 3: Commit**

```bash
git add src/screens/GameModeSelector.js
git commit -m "feat: restyle GameModeSelector as file folder selection on desk"
```

---

### Task 21: AchievementsScreen — Trophy Shelf Style

**Files:**
- Modify: `src/screens/AchievementsScreen.js` (347 lines)

- [ ] **Step 1: Wall background with shelf**

Background: `COLORS.wall`. Achievement categories as wooden shelves (horizontal dark wood strips).

- [ ] **Step 2: Achievement items as trophies/plaques**

Unlocked: golden frame on wall. Locked: silhouette with "?" on dark plaque.

- [ ] **Step 3: Commit**

```bash
git add src/screens/AchievementsScreen.js
git commit -m "feat: restyle AchievementsScreen as trophy shelf on clinic wall"
```

---

### Task 22: PathologyBookScreen — Physical Book Style

**Files:**
- Modify: `src/screens/PathologyBookScreen.js` (287 lines)

- [ ] **Step 1: Book container**

Background: `COLORS.desk`. Book = large paper rectangle with leather-brown border (`COLORS.secondary`). Pages with cream background.

- [ ] **Step 2: Page content styling**

Medical content in monospace (clinical feel). Page numbers in corner. Tab bookmarks on right edge.

- [ ] **Step 3: Commit**

```bash
git add src/screens/PathologyBookScreen.js
git commit -m "feat: restyle PathologyBookScreen as physical book on desk"
```

---

### Task 23: AppointmentRegistry — Warm CRT Style

**Files:**
- Modify: `src/components/AppointmentRegistry.js` (302 lines)

**Context:** Per spec, this component KEEPS its CRT scanline aesthetic but swaps neon palette to warm COLORS tokens.

- [ ] **Step 1: Replace hardcoded neon colors**

Find any hardcoded hex values and replace with COLORS tokens. Keep scanline effects and CRT styling.

- [ ] **Step 2: Commit**

```bash
git add src/components/AppointmentRegistry.js
git commit -m "feat: update AppointmentRegistry colors to warm palette (keep CRT style)"
```

---

### Task 24: IntroVideoScreen — Warm Intro

**Files:**
- Modify: `src/screens/IntroVideoScreen.js` (250 lines)

- [ ] **Step 1: Update background and particle colors**

Replace dark space background with warm dark (`COLORS.bgDark`). Update any particle/animation colors to warm palette.

- [ ] **Step 2: Commit**

```bash
git add src/screens/IntroVideoScreen.js
git commit -m "feat: update IntroVideoScreen with warm palette"
```

---

### Task 25: IntroductionStory — Warm Palette

**Files:**
- Modify: `src/screens/IntroductionStory.js` (356 lines)

- [ ] **Step 1: Update backgrounds and text colors**

Replace any cold blues with warm browns. Update story frame backgrounds to `COLORS.bgDark`/`COLORS.desk`.

- [ ] **Step 2: Commit**

```bash
git add src/screens/IntroductionStory.js
git commit -m "feat: update IntroductionStory with warm palette"
```

---

## Remaining Minor Files

These files reference COLORS but only need the automatic palette cascade from Task 1. Check each briefly after all major tasks are done to ensure no hardcoded colors remain:

- `src/components/AchievementNotification.js` (132 lines)
- `src/components/BookingsModal.js` (194 lines)
- `src/components/DailyMissionsWidget.js` (280 lines)
- `src/components/FloatingText.js` (59 lines)
- `src/components/HealthInspectionModal.js` (108 lines)
- `src/components/MiniGames.js` (775 lines)
- `src/components/RewardsPopup.js` (342 lines)
- `src/components/SOAPReport.js` (261 lines)
- `src/components/PixelAvatar.js` (408 lines — kept as-is per spec)
- `src/screens/AerialViewScreen.js` (356 lines)
- `src/screens/EventsScreen.js` (252 lines)
- `src/screens/TutorialScreen.js` (312 lines)

---

## Final Verification Checklist

After all tasks are complete:

- [ ] **Visual consistency check:** Navigate through every screen. No cold blue colors should remain. All backgrounds, borders, shadows should feel warm.
- [ ] **Gameplay flow check:** Complete a full game loop: menu → save select → clinic → examine → diagnose → treat → end day → shop → next day.
- [ ] **Performance check:** No lag on main screens. PatientPortrait renders < 180 Views. No excessive re-renders.
- [ ] **Cross-platform check:** Test on web (expo start --web). Verify on mobile simulator if available.
- [ ] **Console error check:** Zero console errors or warnings.
