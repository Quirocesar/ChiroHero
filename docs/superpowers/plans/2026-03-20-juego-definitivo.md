# ChiroHero — Juego Definitivo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ChiroHero from working prototype to sale-ready PWA game with fixed encoding, full scroll, back navigation, manual treatment, two clinic modes (Sala Cerrada front-view + Sala Abierta aerial), interactive tutorial, and Netlify deployment.

**Architecture:** 9 blocks executed in priority order. Blocks 1-3 are isolated bug fixes. Blocks 4-7 introduce the two new clinic modes via new screens inserted into the existing React Navigation stack. Block 8 adds a tutorial overlay system using TutorialContext. Block 9 deploys to Netlify.

**Tech Stack:** Expo SDK 55, React Native Web, React Navigation Stack, AsyncStorage, Web Audio API (procedural 8-bit sound), i18n (6 languages), Netlify CDN.

**Spec:** `docs/superpowers/specs/2026-03-20-juego-definitivo-design.md`

**Critical API notes (read before implementing):**
- `gameState.set()` takes a **plain object**: `gameState.set({ key: value })` — NOT `gameState.set('key', value)`
- `gameState.get('key')` returns the value for that key from `gameState.state`
- State defaults live in `src/state/saveState.js` → `DEFAULT_STATE` (not in gameState.js)
- `clinicMode` already exists in `DEFAULT_STATE` as `null` with comment `'open' | 'closed'` — update this field, do not add a new one
- Minigames (Palpation, XRay, Neuro) are **inline components** in ConsultationScreen switched via `setPhase()` — they are NOT navigable screens; do not use `navigation.navigate` to launch them

---

## File Map

| File | Status | Purpose |
|---|---|---|
| `scripts/fix-encoding.js` | Create (delete after use) | One-time i18n encoding repair |
| `src/utils/i18n.js` | Result of running script | Fixed 746 corrupted characters |
| `src/utils/soundManager.js` | Modify | Remove console.log |
| `src/state/saveState.js` | Modify | Add clinicMode values + tutorialStep + unlockedTables to DEFAULT_STATE |
| `src/utils/TutorialContext.js` | Create | Shared context for tutorial target layouts |
| `src/components/BackHeader.js` | Create | Reusable back navigation header |
| `src/components/TutorialTarget.js` | Create | Wraps elements to register layout for tutorial |
| `src/components/TutorialOverlay.js` | Create | Semi-transparent mask + highlight + text bubble |
| `src/screens/ClinicModeSelectorScreen.js` | Create | Choose Sala Abierta or Sala Cerrada |
| `src/screens/SalaCerradaScreen.js` | Create | Front-view clinic gameplay |
| `src/screens/AerialViewScreen.js` | Rewrite | Sala Abierta aerial-view gameplay |
| `src/screens/PathologyBookScreen.js` | Modify | Add BackHeader + scroll fix |
| `src/screens/EventsScreen.js` | Modify | Add BackHeader |
| `src/screens/AchievementsScreen.js` | Modify | Add BackHeader |
| `src/screens/ShopScreen.js` | Modify | Add BackHeader + table unlock UI |
| `src/screens/TutorialScreen.js` | Modify | Add BackHeader + integrate TutorialOverlay |
| `src/screens/ClinicViewScreen.js` | Modify | Scroll fix + route to ClinicModeSelector |
| `src/screens/ConsultationScreen.js` | Modify | Scroll fix + "Tratar Manualmente" modal |
| `src/screens/TreatmentScreen.js` | Modify | Scroll fix |
| `src/screens/IntroductionStory.js` | Modify | Add BackHeader |
| `src/screens/GameModeSelector.js` | Modify | Navigate to ClinicModeSelectorScreen |
| `App.js` | Modify | Register ClinicModeSelectorScreen + SalaCerradaScreen |
| `public/manifest.json` | Modify | PWA metadata |
| `public/sw.js` | Modify | Add CACHE_VERSION constant |
| `scripts/bump-sw-version.js` | Create | Auto-increment CACHE_VERSION on build |
| `netlify.toml` | Create | Netlify deploy config |
| `package.json` | Modify | Add prebuild:pwa script |

---

## Chunk 1: Bugs & Polish (Blocks 1-3)

### Task 1: Fix i18n Encoding (746 broken characters)

**Files:**
- Create: `scripts/fix-encoding.js`
- Modify: `src/utils/i18n.js` (result of running the script)

- [ ] **Step 1.1: Create repair script**

Create `scripts/fix-encoding.js`:

```js
#!/usr/bin/env node
// One-time repair script for i18n.js double-encoding bug.
// Run: node scripts/fix-encoding.js
// Delete this file after verifying the fix in-browser.

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/utils/i18n.js');
const raw = fs.readFileSync(filePath);

// Strip UTF-8 BOM (EF BB BF) if present
const hasBOM = raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF;
const content = hasBOM ? raw.slice(3) : raw;

// The file was saved with double-encoding:
//   original UTF-8 bytes → misread as Latin-1 → re-saved as UTF-8
// Fix: interpret current bytes as Latin-1 code points (toString('latin1')),
//      then write those code points back as raw bytes (Buffer.from(..., 'latin1')).
//      This round-trip restores the original correct UTF-8 byte sequences.
const corrupted = content.toString('latin1'); // ← must be 'latin1', NOT 'utf8'
const fixedBuffer = Buffer.from(corrupted, 'latin1'); // writes the original bytes

// Diagnostic count (approximate — catches main patterns)
const before = (corrupted.match(/Ã./g) || []).length + (corrupted.match(/Â./g) || []).length;
fs.writeFileSync(filePath, fixedBuffer); // write Buffer directly — no toString()

const after = fs.readFileSync(filePath, 'utf8');
const remaining = (after.match(/Ã./g) || []).length;

console.log(`Fixed: ~${before} corruption patterns → ${remaining} remaining`);
if (remaining === 0) {
  console.log('Encoding fully repaired. Verify in browser, then delete this script.');
} else {
  console.log('Some patterns remain — check manually.');
}
```

- [ ] **Step 1.2: Run the repair script**

```bash
cd "E:\Juego Movil App\ChiroHero"
node scripts/fix-encoding.js
```

Expected: `Fixed: ~750 corruption patterns → 0 remaining`

- [ ] **Step 1.3: Verify fix in browser**

Open the game preview. In the main menu the version text must show `"Aprende quiropráctica jugando"` (with correct á). Switch language to ES/PT/IT/FR/DE and confirm accented characters render correctly throughout.

Additional verification command:
```bash
node -e "const s=require('fs').readFileSync('src/utils/i18n.js','utf8'); console.log(/Ã./.test(s)?'BROKEN':'OK')"
```
Expected output: `OK`

- [ ] **Step 1.4: Delete the repair script**

```bash
rm scripts/fix-encoding.js
git add src/utils/i18n.js
git commit -m "fix: repair 746 double-encoded characters in i18n.js (all 6 languages)"
```

---

### Task 2: Remove console.log from soundManager

**Files:**
- Modify: `src/utils/soundManager.js` line 26

- [ ] **Step 2.1: Remove the log**

In `src/utils/soundManager.js`, find (around line 26):
```js
    } catch (e) {
      console.log('Web Audio not available');
    }
```
Replace with:
```js
    } catch (e) {
      // Web Audio API not available — sound disabled silently
    }
```

- [ ] **Step 2.2: Commit**

```bash
git add src/utils/soundManager.js
git commit -m "chore: remove console.log from soundManager (production cleanup)"
```

---

### Task 3: Create BackHeader Component

**Files:**
- Create: `src/components/BackHeader.js`

- [ ] **Step 3.1: Create the component**

Create `src/components/BackHeader.js`:

```js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PixelText from './PixelText';
import { COLORS } from '../utils/theme';

/**
 * Reusable top header with a back arrow button.
 * Props:
 *   title  — optional string shown centered
 *   onBack — optional function, defaults to navigation.goBack()
 *
 * Uses TouchableOpacity (not PixelButton) so it renders as a minimal
 * icon without the 3D pixel button border.
 */
export default function BackHeader({ title, onBack }) {
  const navigation = useNavigation();
  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <PixelText size="large" color={COLORS.accent}>←</PixelText>
      </TouchableOpacity>

      {/* Title MUST be in a View (not directly on PixelText) for flex:1 to work */}
      <View style={styles.titleWrapper}>
        {title ? (
          <PixelText size="small" color={COLORS.white} center>
            {title}
          </PixelText>
        ) : null}
      </View>

      {/* Right spacer balances the left back button */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 10,
    backgroundColor: COLORS.deskDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  backBtn: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  spacer: {
    minWidth: 40,
  },
});
```

- [ ] **Step 3.2: Add BackHeader to PathologyBookScreen**

In `src/screens/PathologyBookScreen.js`:
1. Add at top: `import BackHeader from '../components/BackHeader';`
2. Find the root container (the outermost `<View style={styles.container}>` or root `<ScrollView>`). Add `<BackHeader title="MANUAL DE PATOLOGÍAS" />` as the very **first child** of that element, before any scroll content.

- [ ] **Step 3.3: Add BackHeader to EventsScreen**

In `src/screens/EventsScreen.js`:
1. Add: `import BackHeader from '../components/BackHeader';`
2. Add `<BackHeader title="EVENTOS" />` as first child of the root View.

- [ ] **Step 3.4: Add BackHeader to AchievementsScreen**

In `src/screens/AchievementsScreen.js`:
1. Add: `import BackHeader from '../components/BackHeader';`
2. Add `<BackHeader title="LOGROS" />` as first child of the root View.

- [ ] **Step 3.5: Add BackHeader to ShopScreen**

In `src/screens/ShopScreen.js`:
1. Add: `import BackHeader from '../components/BackHeader';`
2. Add `<BackHeader title="TIENDA" />` as first child of the root View.

- [ ] **Step 3.6: Add BackHeader to TutorialScreen**

In `src/screens/TutorialScreen.js`:
1. Add: `import BackHeader from '../components/BackHeader';`
2. Add `<BackHeader title="TUTORIAL" />` as first child of the root View.

- [ ] **Step 3.7: Add BackHeader to IntroductionStory**

In `src/screens/IntroductionStory.js`:
1. Add: `import BackHeader from '../components/BackHeader';`
2. Add `<BackHeader />` as first child of the root `<View style={styles.container}>` (before the Animated.View).

- [ ] **Step 3.8: Verify all back buttons**

Open game preview. Navigate to each screen. Confirm `←` appears top-left and goBack() works.

- [ ] **Step 3.9: Commit**

```bash
git add src/components/BackHeader.js src/screens/PathologyBookScreen.js src/screens/EventsScreen.js src/screens/AchievementsScreen.js src/screens/ShopScreen.js src/screens/TutorialScreen.js src/screens/IntroductionStory.js
git commit -m "feat: add BackHeader component + back navigation to 7 screens"
```

---

### Task 4: Scroll & Layout Fixes

**Files:**
- Modify: `src/screens/ClinicViewScreen.js`
- Modify: `src/screens/ConsultationScreen.js`
- Modify: `src/screens/TreatmentScreen.js`
- Modify: `src/screens/PathologyBookScreen.js`

**How to find the right container:** Open each file, locate the outermost scrollable View or ScrollView that wraps the main page content. If content is in a plain `View` with `flex: 1`, that View is what clips the content — it needs to become (or be wrapped by) a `ScrollView`.

- [ ] **Step 4.1: Fix ClinicViewScreen scroll**

In `src/screens/ClinicViewScreen.js`:
1. Find the main page `ScrollView` (search for `<ScrollView` — there may be several). Ensure the outermost one that wraps all page content has:
   ```jsx
   <ScrollView
     style={{ flex: 1 }}
     contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
     showsVerticalScrollIndicator={false}
     scrollEventThrottle={16}
   >
   ```
2. Remove any `overflow: 'hidden'` on direct children that might clip content.
3. On web, if the ScrollView still doesn't respond to mouse scroll, wrap it with `Platform.OS === 'web' ? { overflow: 'auto' } : {}` on its `style` prop.

- [ ] **Step 4.2: Fix ConsultationScreen scroll**

In `src/screens/ConsultationScreen.js`:
1. Find the root `<ScrollView>` (confirmed to exist). Ensure it has:
   ```jsx
   contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
   ```
2. The modal overlay added in Task 7 will be a **sibling** of this ScrollView (not a child), so do not close the ScrollView before the buttons — just ensure all content including buttons are inside the ScrollView's content.

- [ ] **Step 4.3: Fix TreatmentScreen scroll**

In `src/screens/TreatmentScreen.js`:
1. Ensure root `ScrollView` has `contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}`
2. For nested horizontal ScrollViews (tool rows): add `nestedScrollEnabled={true}` on each
3. If any child `View` has a fixed `height:` value that is clipping content, change it to `minHeight:`

- [ ] **Step 4.4: Fix PathologyBookScreen scroll**

In `src/screens/PathologyBookScreen.js`:
1. Add `contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}` to root ScrollView
2. Since BackHeader was added in Task 3, verify scroll content sits below the header and is not clipped

- [ ] **Step 4.5: Test scroll**

Open preview at 375×812. Navigate to each fixed screen. Scroll to bottom. Confirm all content and buttons are reachable.

- [ ] **Step 4.6: Commit**

```bash
git add src/screens/ClinicViewScreen.js src/screens/ConsultationScreen.js src/screens/TreatmentScreen.js src/screens/PathologyBookScreen.js
git commit -m "fix: scroll layout on 4 screens — flexGrow, paddingBottom, nestedScrollEnabled"
```

---

## Chunk 2: Clinic Modes Infrastructure (Blocks 4-5)

### Task 5: Add new state fields to DEFAULT_STATE

**Files:**
- Modify: `src/state/saveState.js`

- [ ] **Step 5.1: Update saveState.js DEFAULT_STATE**

In `src/state/saveState.js`, find the `DEFAULT_STATE` export (starts around line 12). Make these two changes:

**Change 1 — Update existing `clinicMode` values** (line exists, comment says `'open' | 'closed'`):
```js
// BEFORE:
clinicMode: null, // 'open' | 'closed'

// AFTER:
clinicMode: 'salaCerrada', // 'salaCerrada' | 'salaAbierta'
```

**Change 2 — Add two new fields** (add after `clinicMode` line):
```js
unlockedTables: 2,       // Sala Abierta: number of active tables (2-6)
tutorialStep: 0,         // 0=not started, 1-8=in progress, 9=completed
```

Do NOT modify `hasCompletedTutorial` — it stays for backwards compat.

- [ ] **Step 5.2: Commit**

```bash
git add src/state/saveState.js
git commit -m "feat: add clinicMode default, unlockedTables, tutorialStep to DEFAULT_STATE"
```

---

### Task 6: ClinicModeSelector Screen

**Files:**
- Create: `src/screens/ClinicModeSelectorScreen.js`
- Modify: `src/screens/GameModeSelector.js`
- Modify: `App.js`

- [ ] **Step 6.1: Create ClinicModeSelectorScreen**

Create `src/screens/ClinicModeSelectorScreen.js`:

```js
import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width } = Dimensions.get('window');

const MODES = [
  {
    id: 'salaCerrada',
    icon: '🏥',
    label: 'SALA CERRADA',
    subtitle: 'Atención personalizada',
    color: COLORS.accent,
    features: [
      '1 camilla, máxima atención',
      'Ajuste + trabajo muscular',
      'Ultrasonido, TENS, ejercicios',
      'Mayor ingreso por paciente',
      'Vista de frente al paciente',
    ],
  },
  {
    id: 'salaAbierta',
    icon: '🏢',
    label: 'SALA ABIERTA',
    subtitle: 'Clínica de alto volumen',
    color: COLORS.primary,
    features: [
      '2 camillas (ampliable a 6)',
      'Solo ajuste quiropráctico',
      'Vista aérea de la clínica',
      'Pacientes entran caminando',
      'Gestión simultánea',
    ],
  },
];

export default function ClinicModeSelectorScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const scaleAnims = useRef(MODES.map(() => new Animated.Value(1))).current;

  const handleSelect = (modeId, index) => {
    soundManager.playClick();
    setSelected(modeId);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1.0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleConfirm = () => {
    if (!selected) return;
    // gameState.set() takes a plain object — NOT (key, value)
    gameState.set({ clinicMode: selected });
    soundManager.playSuccess();
    navigation.navigate('ClinicView');
  };

  return (
    <View style={styles.container}>
      <BackHeader title="ELIGE TU CLÍNICA" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PixelText size="small" color={COLORS.gray} center style={{ marginBottom: 20 }}>
          El tipo de clínica define tu estilo de juego
        </PixelText>

        {MODES.map((mode, index) => {
          const isSelected = selected === mode.id;
          return (
            <Animated.View
              key={mode.id}
              style={{ transform: [{ scale: scaleAnims[index] }], marginBottom: 16 }}
            >
              <TouchableOpacity
                onPress={() => handleSelect(mode.id, index)}
                style={[
                  styles.card,
                  { borderColor: isSelected ? mode.color : COLORS.border + '40' },
                  isSelected && { backgroundColor: mode.color + '18' },
                ]}
              >
                <View style={styles.cardHeader}>
                  <PixelText size="large">{mode.icon}</PixelText>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <PixelText size="medium" color={mode.color}>{mode.label}</PixelText>
                    <PixelText size="tiny" color={COLORS.gray}>{mode.subtitle}</PixelText>
                  </View>
                  {isSelected && (
                    <PixelText size="medium" color={mode.color}>✓</PixelText>
                  )}
                </View>
                <View style={styles.features}>
                  {mode.features.map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <PixelText size="tiny" color={mode.color}>▸ </PixelText>
                      <PixelText size="tiny" color={COLORS.grayLight}>{f}</PixelText>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <PixelButton
          title="COMENZAR"
          icon="🚀"
          color={selected ? COLORS.primary : COLORS.grayDark}
          onPress={handleConfirm}
          disabled={!selected}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.deskDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  features: { gap: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
```

- [ ] **Step 6.2: Register ClinicModeSelectorScreen in App.js**

In `App.js`:
1. Add import: `import ClinicModeSelectorScreen from './src/screens/ClinicModeSelectorScreen';`
2. Inside `<Stack.Navigator>`, add this screen after the `GameModeSelector` entry:

```jsx
<Stack.Screen
  name="ClinicModeSelector"
  component={ClinicModeSelectorScreen}
  options={{
    cardStyleInterpolator: forSlideFromRight,
    transitionSpec: {
      open: { animation: 'timing', config: { duration: 300 } },
      close: { animation: 'timing', config: { duration: 250 } },
    },
  }}
/>
```

- [ ] **Step 6.3: Update GameModeSelector to navigate to ClinicModeSelector**

In `src/screens/GameModeSelector.js`, find the `handleConfirm` function. Locate the line:
```js
navigation.navigate('ClinicView')
```
Replace it with:
```js
navigation.navigate('ClinicModeSelector')
```
That is the **only change needed** — the existing `gameState.set({ gameMode: ..., playerName: ... })` call above it already handles saving the game mode.

- [ ] **Step 6.4: Verify the new flow**

Open preview → start new game → choose difficulty → COMENZAR → ClinicModeSelectorScreen appears → choose Sala Cerrada → COMENZAR → ClinicView opens.

- [ ] **Step 6.5: Commit**

```bash
git add src/screens/ClinicModeSelectorScreen.js App.js src/screens/GameModeSelector.js
git commit -m "feat: add ClinicModeSelectorScreen (Sala Cerrada / Sala Abierta choice)"
```

---

### Task 7: Manual Treatment Button in ConsultationScreen

**Files:**
- Modify: `src/screens/ConsultationScreen.js`

**Important:** Minigames (Palpation, XRay, Neuro) are inline components in ConsultationScreen controlled by `setPhase()`. They are NOT navigable screens. The "Tratar Manualmente" modal must use `setPhase()` to launch them — NOT `navigation.navigate()`.

- [ ] **Step 7.1: Add modal state**

In `src/screens/ConsultationScreen.js`, inside the component body, add:
```js
const [showManualModal, setShowManualModal] = useState(false);
```

- [ ] **Step 7.2: Add "Tratar Manualmente" button**

In the decision phase JSX (near the existing `treatPatient` button around line 390), add a new button immediately after `<PixelButton title={t('treatPatient')} ... />`:

```jsx
<PixelButton
  title="TRATAR MANUALMENTE"
  icon="🖐"
  color={COLORS.accent}
  onPress={() => {
    soundManager.playClick();
    setShowManualModal(true);
  }}
/>
```

- [ ] **Step 7.3: Restructure ConsultationScreen root to support the modal overlay**

The modal must be a **sibling** of the ScrollView (not inside it) so it can cover the full screen. Change the root render from:

```jsx
return (
  <ScrollView style={styles.container} ...>
    ...content...
  </ScrollView>
);
```

To:
```jsx
return (
  <View style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      ...content...
    </ScrollView>

    {/* Modal overlay — SIBLING of ScrollView, NOT inside it */}
    {showManualModal && (
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          ...modal content (see Step 7.4)...
        </View>
      </View>
    )}
  </View>
);
```

`styles.container` must have `flex: 1` (it likely already does).

- [ ] **Step 7.4: Add modal content**

The modal sheet content (inside `<View style={styles.modalSheet}>`):

```jsx
<PixelText size="medium" color={COLORS.white} center style={{ marginBottom: 16 }}>
  ELEGIR MINIJUEGO
</PixelText>

{[
  { icon: '🖐', label: 'Palpación Espinal', phase: 'palpation' },
  { icon: '🦴', label: 'Radiografía', phase: 'xray', requiresTool: true },
  { icon: '🧠', label: 'Test Neurológico', phase: 'neuro' },
].map((opt) => {
  const locked = opt.requiresTool && !hasXray;
  return (
    <TouchableOpacity
      key={opt.phase}
      style={[styles.miniGameOption, locked && { opacity: 0.4 }]}
      onPress={() => {
        if (locked) return;
        setShowManualModal(false);
        soundManager.playClick();
        setPhase(opt.phase); // use existing phase switching — NOT navigation.navigate
      }}
      disabled={locked}
    >
      <PixelText size="large">{opt.icon}</PixelText>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <PixelText size="small" color={locked ? COLORS.gray : COLORS.white}>
          {opt.label}
        </PixelText>
        {locked && (
          <PixelText size="tiny" color={COLORS.gray}>🔒 Requiere equipo de RX</PixelText>
        )}
      </View>
    </TouchableOpacity>
  );
})}

<PixelButton
  title="CANCELAR"
  color={COLORS.secondary}
  onPress={() => setShowManualModal(false)}
  small
/>
```

- [ ] **Step 7.5: Add missing import and styles**

Add `TouchableOpacity` to the React Native import if not already present.

Add these styles to `StyleSheet.create({...})` in ConsultationScreen:

```js
modalBackdrop: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'flex-end',
},
modalSheet: {
  backgroundColor: COLORS.deskDark,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  borderTopWidth: 2,
  borderColor: COLORS.accent + '60',
  padding: 20,
  paddingBottom: 36,
  gap: 8,
},
miniGameOption: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: COLORS.bgDark,
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: COLORS.border + '30',
},
```

- [ ] **Step 7.6: Verify**

Open preview → get to ConsultationScreen → confirm "TRATAR MANUALMENTE" button appears → tap it → modal slides up from bottom → choosing Palpación closes modal and switches to palpation phase → CANCELAR closes modal without changing phase.

- [ ] **Step 7.7: Commit**

```bash
git add src/screens/ConsultationScreen.js
git commit -m "feat: add Tratar Manualmente bottom-sheet modal in ConsultationScreen"
```

---

## Chunk 3: Sala Cerrada & Sala Abierta (Blocks 6-7)

### Task 8: Sala Cerrada Screen (Front View)

**Files:**
- Create: `src/screens/SalaCerradaScreen.js`
- Modify: `src/screens/ClinicViewScreen.js` (route from ClinicView when mode is salaCerrada)
- Modify: `App.js`

**Architecture note:** SalaCerradaScreen is a self-contained patient treatment session. It replaces the Consultation → Treatment flow when `clinicMode === 'salaCerrada'`. ClinicView passes a `patient` object as a route param.

- [ ] **Step 8.1: Create SalaCerradaScreen**

Create `src/screens/SalaCerradaScreen.js`:

```js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width, height } = Dimensions.get('window');

const TOOLS = [
  { id: 'ajuste',         icon: '🤲', label: 'Ajuste',       xp: 25 },
  { id: 'descontractura', icon: '💆', label: 'Músculo',      xp: 20 },
  { id: 'ultrasonido',    icon: '🔊', label: 'Ultrasonido',  xp: 15 },
  { id: 'tens',           icon: '⚡', label: 'TENS',         xp: 15 },
  { id: 'ejercicios',     icon: '🏋', label: 'Ejercicios',   xp: 20 },
  { id: 'calor',          icon: '🔥', label: 'Calor/Frío',   xp: 10 },
];

export default function SalaCerradaScreen({ navigation, route }) {
  const patient = route.params?.patient || {
    name: 'Paciente Demo',
    complaint: 'Dolor lumbar irradiado',
  };

  const patientY = useRef(new Animated.Value(-height * 0.35)).current;
  const [experience, setExperience] = useState(0);
  const [usedTools, setUsedTools] = useState(new Set());
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    soundManager.init();
    soundManager.playPatientEnter();
    Animated.timing(patientY, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  const face = experience >= 75 ? '🤩'
    : experience >= 50 ? '😄'
    : experience >= 25 ? '🙂'
    : '😐';

  const useTool = useCallback((tool) => {
    if (usedTools.has(tool.id) || finished) return;
    soundManager.playClick();
    const next = new Set(usedTools);
    next.add(tool.id);
    setUsedTools(next);
    setExperience(prev => Math.min(100, prev + tool.xp));
  }, [usedTools, finished]);

  const handleFinish = useCallback(() => {
    const base = 80;
    const bonus = Math.floor(experience / 100 * base * 0.5);
    const total = base + bonus;
    const rep = Math.floor(experience / 25);

    // gameState.set() takes a plain object
    gameState.set({ money: (gameState.get('money') || 0) + total });
    gameState.set({ reputation: Math.min(100, (gameState.get('reputation') || 50) + rep) });

    soundManager.playMoney();
    setResult({ earnings: total, rep });
    setFinished(true);
  }, [experience]);

  if (result) {
    return (
      <View style={styles.container}>
        <BackHeader title="RESULTADO" onBack={() => navigation.navigate('ClinicView')} />
        <View style={styles.resultView}>
          <PixelText size="large" center>{face}</PixelText>
          <PixelText size="medium" color={COLORS.gold} center style={{ marginTop: 12 }}>
            +${result.earnings}
          </PixelText>
          <PixelText size="small" color={COLORS.accent} center>
            +{result.rep} reputación
          </PixelText>
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBar, { width: `${experience}%` }]} />
          </View>
          <PixelText size="tiny" color={COLORS.gray} center>
            Experiencia del paciente: {experience}%
          </PixelText>
          <PixelButton
            title="SIGUIENTE PACIENTE"
            icon="➡"
            color={COLORS.primary}
            onPress={() => navigation.navigate('ClinicView')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title="SALA CERRADA" onBack={() => navigation.navigate('ClinicView')} />

      <Animated.View style={[styles.patientArea, { transform: [{ translateY: patientY }] }]}>
        <PixelText size="large" center>{face}</PixelText>
        <PixelText size="small" color={COLORS.white} center>{patient.name}</PixelText>
        <PixelText size="tiny" color={COLORS.gray} center>{patient.complaint}</PixelText>
      </Animated.View>

      <View style={styles.xpSection}>
        <PixelText size="tiny" color={COLORS.grayLight}>Experiencia del paciente</PixelText>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${experience}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.toolGrid}>
        {TOOLS.map(tool => {
          const used = usedTools.has(tool.id);
          return (
            <TouchableOpacity
              key={tool.id}
              style={[styles.toolBtn, used && styles.toolUsed]}
              onPress={() => useTool(tool)}
              disabled={used}
            >
              <PixelText size="large">{tool.icon}</PixelText>
              <PixelText size="tiny" color={used ? COLORS.gray : COLORS.white} center>
                {tool.label}
              </PixelText>
              <PixelText size="tiny" color={used ? COLORS.gray : COLORS.accent} center>
                {used ? '✓' : `+${tool.xp}xp`}
              </PixelText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PixelButton
          title="FINALIZAR TRATAMIENTO"
          icon="✅"
          color={COLORS.green}
          onPress={handleFinish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  patientArea: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.bgDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
    gap: 4,
  },
  xpSection: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  xpBarContainer: {
    height: 10,
    backgroundColor: COLORS.bgDark,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    overflow: 'hidden',
  },
  xpBar: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 5 },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    justifyContent: 'center',
  },
  toolBtn: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.deskDark,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '60',
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  toolUsed: { borderColor: COLORS.grayDark, backgroundColor: COLORS.bgDark },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.deskDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '30',
  },
  resultView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
});
```

- [ ] **Step 8.2: Register SalaCerradaScreen in App.js**

In `App.js`:
1. Add import: `import SalaCerradaScreen from './src/screens/SalaCerradaScreen';`
2. Add screen to navigator after the `ClinicModeSelector` entry:

```jsx
<Stack.Screen
  name="SalaCerrada"
  component={SalaCerradaScreen}
  options={{
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
    transitionSpec: {
      open: { animation: 'spring', config: { stiffness: 100, damping: 15 } },
      close: { animation: 'timing', config: { duration: 300 } },
    },
  }}
/>
```

- [ ] **Step 8.3: Route ClinicView to SalaCerrada when mode is salaCerrada**

In `src/screens/ClinicViewScreen.js`, find the `navigatePatientFlow` function (around line 1088). Inside it, find where the code calls `navigation.navigate('Consultation', ...)`. Add a clinic mode check:

```js
const clinicMode = gameState.get('clinicMode') || 'salaCerrada';

if (clinicMode === 'salaCerrada') {
  navigation.navigate('SalaCerrada', { patient: patientToOpen });
} else {
  // salaAbierta: AerialView handles patient flow (Task 9)
  navigation.navigate('AerialView');
}
```

- [ ] **Step 8.4: Verify Sala Cerrada end-to-end**

Start new game → choose difficulty → choose Sala Cerrada → ClinicView → start day → patient arrives → navigates to SalaCerradaScreen → patient walks down from top → 6 tools visible → use tools fills XP bar → Finalizar shows result with earnings and reputation.

- [ ] **Step 8.5: Commit**

```bash
git add src/screens/SalaCerradaScreen.js App.js src/screens/ClinicViewScreen.js
git commit -m "feat: add SalaCerradaScreen — front-view clinic with patient entrance + 6 tools"
```

---

### Task 9: Sala Abierta — Aerial View Rewrite

**Files:**
- Rewrite: `src/screens/AerialViewScreen.js`
- Modify: `src/screens/ShopScreen.js` (table unlock)

- [ ] **Step 9.1: Rewrite AerialViewScreen**

Replace the **entire content** of `src/screens/AerialViewScreen.js` with:

```js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { COLORS } from '../utils/theme';
import PixelText from '../components/PixelText';
import PixelButton from '../components/PixelButton';
import BackHeader from '../components/BackHeader';
import gameState from '../utils/gameState';
import soundManager from '../utils/soundManager';

const { width, height } = Dimensions.get('window');
const TABLE_W = 80;
const TABLE_H = 50;
const MAX_TABLES = 6;

// Fixed list of techniques and conditions
const ALL_TECHNIQUES = ['Ajuste C1', 'Mobilización', 'HVT Lumbar', 'Tracción', 'HVLA'];
const CONDITIONS = ['Lumbalgia', 'Cervicalgia', 'Dorsalgia', 'Ciática', 'Contractura'];

function getTablePositions(count) {
  const cols = count <= 3 ? count : Math.ceil(count / 2);
  const spacing = { x: (width - 32) / cols, y: 90 };
  return Array.from({ length: count }, (_, i) => ({
    x: 16 + (i % cols) * spacing.x + spacing.x / 2 - TABLE_W / 2,
    y: 80 + Math.floor(i / cols) * spacing.y,
  }));
}

function generatePatient(id) {
  const correctTechnique = ALL_TECHNIQUES[Math.floor(Math.random() * ALL_TECHNIQUES.length)];
  // Build 3 options: always include the correct one
  const others = ALL_TECHNIQUES.filter(t => t !== correctTechnique);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [correctTechnique, ...shuffled].sort(() => Math.random() - 0.5);
  return {
    id,
    name: `Paciente ${id}`,
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    correctTechnique,
    options, // exactly 3, always includes the correct one
  };
}

export default function AerialViewScreen({ navigation }) {
  const unlockedTables = Math.min(gameState.get('unlockedTables') || 2, MAX_TABLES);
  const positions = getTablePositions(unlockedTables);

  // Each table: { id, x, y, state, patient, patientY (Animated.Value) }
  const [tables, setTables] = useState(() =>
    positions.map((pos, i) => ({
      id: i,
      ...pos,
      state: 'empty',
      patient: null,
      patientY: new Animated.Value(-60),
    }))
  );
  const [selectedTable, setSelectedTable] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const patientCounter = useRef(0);
  const spawnTimer = useRef(null);

  useEffect(() => {
    soundManager.init();
    soundManager.playClinicMusic();
    scheduleSpawn();
    return () => {
      clearTimeout(spawnTimer.current);
      soundManager.stopMusic();
    };
  }, []);

  const scheduleSpawn = () => {
    spawnTimer.current = setTimeout(() => {
      trySpawnPatient();
      scheduleSpawn();
    }, 3000 + Math.random() * 4000);
  };

  const trySpawnPatient = useCallback(() => {
    setTables(prev => {
      const emptyIdx = prev.findIndex(t => t.state === 'empty');
      if (emptyIdx === -1) return prev;

      patientCounter.current += 1;
      const patient = generatePatient(patientCounter.current);
      const tableId = prev[emptyIdx].id;

      // Reset and animate patient Y
      prev[emptyIdx].patientY.setValue(-60);
      Animated.timing(prev[emptyIdx].patientY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // Guard: only set 'occupied' if still 'arriving' (not already treated/leaving)
        setTables(curr => curr.map(t =>
          t.id === tableId && t.state === 'arriving'
            ? { ...t, state: 'occupied' }
            : t
        ));
      });

      soundManager.playPatientEnter();
      return prev.map((t, i) =>
        i === emptyIdx ? { ...t, state: 'arriving', patient } : t
      );
    });
  }, []);

  const handleTableTap = useCallback((table) => {
    if (table.state !== 'occupied') return;
    soundManager.playClick();
    setSelectedTable(table);
    setTables(prev => prev.map(t =>
      t.id === table.id ? { ...t, state: 'in_treatment' } : t
    ));
  }, []);

  const handleTreatment = useCallback((table, technique) => {
    soundManager.playCrack();
    const isCorrect = technique === table.patient.correctTechnique;
    const earned = isCorrect ? 70 : 55;
    const rep = isCorrect ? 2 : -0.5;

    setEarnings(prev => prev + earned);
    // gameState.set() takes a plain object
    gameState.set({ money: (gameState.get('money') || 0) + earned });
    gameState.set({
      reputation: Math.max(0, Math.min(100, (gameState.get('reputation') || 50) + rep)),
    });
    soundManager.playMoney();
    setSelectedTable(null);

    // Animate patient leaving
    setTables(prev => prev.map(t => {
      if (t.id !== table.id) return t;
      Animated.timing(t.patientY, {
        toValue: -80,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        setTables(curr => curr.map(tb =>
          tb.id === table.id ? { ...tb, state: 'empty', patient: null } : tb
        ));
      });
      return { ...t, state: 'leaving' };
    }));
  }, []);

  const handleCancelTreatment = useCallback(() => {
    if (!selectedTable) return;
    const tableId = selectedTable.id;
    setSelectedTable(null);
    setTables(prev => prev.map(t =>
      t.id === tableId && t.state === 'in_treatment'
        ? { ...t, state: 'occupied' }
        : t
    ));
  }, [selectedTable]);

  return (
    <View style={styles.container}>
      <BackHeader title="SALA ABIERTA" onBack={() => navigation.navigate('ClinicView')} />

      <View style={styles.hud}>
        <PixelText size="small" color={COLORS.gold}>💰 +${earnings}</PixelText>
        <PixelText size="tiny" color={COLORS.gray}>
          {tables.filter(t => t.state !== 'empty').length}/{unlockedTables} activas
        </PixelText>
      </View>

      <View style={styles.floor}>
        <View style={styles.door}>
          <PixelText size="tiny" color={COLORS.gray}>🚪 ENTRADA</PixelText>
        </View>

        {tables.map(table => (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.table,
              { left: table.x, top: table.y },
              table.state === 'occupied' && styles.tableOccupied,
              table.state === 'in_treatment' && styles.tableInTreatment,
              table.state === 'arriving' && styles.tableArriving,
            ]}
            onPress={() => handleTableTap(table)}
            activeOpacity={table.state === 'occupied' ? 0.7 : 1}
          >
            <PixelText size="tiny" color={COLORS.grayLight} center>🛏</PixelText>
            {table.patient && (
              <Animated.View
                style={[styles.patientSprite, { transform: [{ translateY: table.patientY }] }]}
              >
                <PixelText size="small" center>🧑</PixelText>
              </Animated.View>
            )}
            {table.state === 'occupied' && (
              <View style={styles.tapHint}>
                <PixelText size="tiny" color={COLORS.primary}>👆</PixelText>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.waitingArea}>
          <PixelText size="tiny" color={COLORS.gray}>ESPERA</PixelText>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[...Array(3)].map((_, i) => <PixelText key={i} size="small">🪑</PixelText>)}
          </View>
        </View>
      </View>

      {/* Treatment popup — outside floor View, covers full screen */}
      <Modal
        visible={!!selectedTable}
        transparent
        animationType="slide"
        onRequestClose={handleCancelTreatment}
      >
        <View style={styles.popupBackdrop}>
          <View style={styles.popup}>
            {selectedTable && (
              <>
                <PixelText size="small" color={COLORS.white} center>
                  {selectedTable.patient?.name}
                </PixelText>
                <PixelText size="tiny" color={COLORS.gray} center>
                  {selectedTable.patient?.condition}
                </PixelText>
                <PixelText size="tiny" color={COLORS.grayLight} center style={{ marginTop: 8 }}>
                  Elegir técnica:
                </PixelText>
                {/* options always contains the correctTechnique — see generatePatient() */}
                {selectedTable.patient.options.map(tech => (
                  <TouchableOpacity
                    key={tech}
                    style={styles.techniqueBtn}
                    onPress={() => handleTreatment(selectedTable, tech)}
                  >
                    <PixelText size="small" color={COLORS.white}>{tech}</PixelText>
                  </TouchableOpacity>
                ))}
                <PixelButton
                  title="CANCELAR"
                  color={COLORS.secondary}
                  onPress={handleCancelTreatment}
                  small
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.deskDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  floor: { flex: 1, position: 'relative' },
  door: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    left: width / 2 - 50,
    backgroundColor: COLORS.bgDark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
  },
  table: {
    position: 'absolute',
    width: TABLE_W,
    height: TABLE_H,
    backgroundColor: COLORS.desk,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.deskLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableOccupied: { borderColor: COLORS.primary },
  tableInTreatment: { borderColor: COLORS.accent },
  tableArriving: { borderColor: COLORS.gold },
  patientSprite: { position: 'absolute', top: -20 },
  tapHint: { position: 'absolute', bottom: -16 },
  waitingArea: {
    position: 'absolute',
    right: 8,
    top: 40,
    backgroundColor: COLORS.bgMedium,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border + '30',
    alignItems: 'center',
    gap: 4,
  },
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  popup: {
    backgroundColor: COLORS.deskDark,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary + '60',
    padding: 20,
    paddingBottom: 36,
    gap: 8,
  },
  techniqueBtn: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    alignItems: 'center',
  },
});
```

- [ ] **Step 9.2: Add table unlock to ShopScreen**

In `src/screens/ShopScreen.js`, add a conditional section visible only when `clinicMode === 'salaAbierta'`. Place it near the top of the shop content:

```jsx
{gameState.get('clinicMode') === 'salaAbierta' && (
  <View style={styles.section}>
    <PixelText size="medium" color={COLORS.gold}>🛏 CAMILLAS</PixelText>
    {[
      { table: 3, cost: 500 },
      { table: 4, cost: 1200 },
      { table: 5, cost: 2500 },
      { table: 6, cost: 5000 },
    ].map(({ table, cost }) => {
      const unlocked = (gameState.get('unlockedTables') || 2) >= table;
      const canAfford = (gameState.get('money') || 0) >= cost;
      return (
        <View key={table} style={styles.upgradeRow}>
          <PixelText size="small" color={unlocked ? COLORS.accent : COLORS.white}>
            {unlocked ? '✓' : '🔒'} Camilla {table}
          </PixelText>
          {!unlocked && (
            <PixelButton
              title={`$${cost}`}
              color={canAfford ? COLORS.primary : COLORS.grayDark}
              disabled={!canAfford}
              onPress={() => {
                if (!canAfford) return;
                gameState.set({ money: gameState.get('money') - cost });
                gameState.set({ unlockedTables: table });
                soundManager.playMoney();
              }}
              small
            />
          )}
        </View>
      );
    })}
  </View>
)}
```

Add `upgradeRow` and `section` to the ShopScreen StyleSheet if not present:
```js
section: { marginBottom: 20 },
upgradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
```

- [ ] **Step 9.3: Verify Sala Abierta end-to-end**

New game → choose difficulty → choose Sala Abierta → ClinicView → navigate to AerialView. Verify: 2 tables shown, patients spawn and walk to tables after ~3-7s, tapping an occupied table opens popup, all 3 technique options shown (one is always correct), choosing one shows earnings and patient leaves.

- [ ] **Step 9.4: Commit**

```bash
git add src/screens/AerialViewScreen.js src/screens/ShopScreen.js
git commit -m "feat: rewrite AerialViewScreen as Sala Abierta with patient routing, popup treatment"
```

---

## Chunk 4: Tutorial & PWA Deploy (Blocks 8-9)

### Task 10: Tutorial Context and Components

**Files:**
- Create: `src/utils/TutorialContext.js`
- Create: `src/components/TutorialTarget.js`
- Create: `src/components/TutorialOverlay.js`
- Modify: `App.js`

- [ ] **Step 10.1: Create TutorialContext**

Create `src/utils/TutorialContext.js`:

```js
import React, { createContext, useContext, useRef, useCallback } from 'react';

const TutorialContext = createContext({
  registerTarget: () => {},
  getTarget: () => null,
});

export function TutorialProvider({ children }) {
  const targets = useRef({});

  const registerTarget = useCallback((id, layout) => {
    targets.current[id] = layout;
  }, []);

  const getTarget = useCallback((id) => {
    return targets.current[id] || null;
  }, []);

  return (
    <TutorialContext.Provider value={{ registerTarget, getTarget }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}
```

- [ ] **Step 10.2: Wrap App in TutorialProvider**

In `App.js`:
1. Add import: `import { TutorialProvider } from './src/utils/TutorialContext';`
2. Wrap the entire return value in `<TutorialProvider>`:

```jsx
return (
  <TutorialProvider>
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        ...
      </NavigationContainer>
    </>
  </TutorialProvider>
);
```

- [ ] **Step 10.3: Create TutorialTarget**

Create `src/components/TutorialTarget.js`:

```js
import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useTutorial } from '../utils/TutorialContext';

/**
 * Wrap any element with TutorialTarget to register its screen position
 * for the tutorial highlight system.
 *
 * Props:
 *   id    — unique string key (e.g. 'playButton')
 *   style — optional style passed to the wrapper View
 */
export default function TutorialTarget({ id, children, style }) {
  const { registerTarget } = useTutorial();
  const viewRef = useRef(null);

  const handleLayout = useCallback(() => {
    if (viewRef.current?.measure) {
      viewRef.current.measure((x, y, w, h, pageX, pageY) => {
        registerTarget(id, { x: pageX, y: pageY, width: w, height: h });
      });
    }
  }, [id, registerTarget]);

  return (
    <View ref={viewRef} onLayout={handleLayout} style={style}>
      {children}
    </View>
  );
}
```

- [ ] **Step 10.4: Create TutorialOverlay**

Create `src/components/TutorialOverlay.js`:

```js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import PixelText from './PixelText';
import PixelButton from './PixelButton';
import { COLORS } from '../utils/theme';
import { useTutorial } from '../utils/TutorialContext';

const { width: SW, height: SH } = Dimensions.get('window');
const PADDING = 8;

/**
 * Props:
 *   step   — { id, targetId, title, text } or null
 *   onNext — advance to next step
 *   onSkip — exit tutorial entirely
 */
export default function TutorialOverlay({ step, onNext, onSkip }) {
  const { getTarget } = useTutorial();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // fadeAnim is a stable ref value; include it in deps to satisfy lint (--max-warnings=0)
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step?.id, fadeAnim]);

  if (!step) return null;

  const target = step.targetId ? getTarget(step.targetId) : null;
  const tx = target ? target.x - PADDING : 0;
  const ty = target ? target.y - PADDING : 0;
  const tw = target ? target.width + PADDING * 2 : SW;
  const th = target ? target.height + PADDING * 2 : 0;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {target ? (
        <>
          {/* 4 mask rectangles surrounding the target */}
          <View style={[styles.mask, { top: 0, left: 0, right: 0, height: Math.max(0, ty) }]} />
          <View style={[styles.mask, { top: ty + th, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.mask, { top: ty, left: 0, width: Math.max(0, tx), height: th }]} />
          <View style={[styles.mask, { top: ty, left: tx + tw, right: 0, height: th }]} />
          {/* Highlight border around target */}
          <View style={[styles.highlight, { top: ty, left: tx, width: tw, height: th }]} />
        </>
      ) : (
        // Full-screen mask for non-targeted steps
        <View style={[styles.mask, StyleSheet.absoluteFill]} />
      )}

      {/* Instruction bubble — always at bottom */}
      <View style={styles.bubble}>
        <PixelText size="small" color={COLORS.gold} style={{ marginBottom: 4 }}>
          {step.title}
        </PixelText>
        <PixelText size="tiny" color={COLORS.white} style={{ marginBottom: 12 }}>
          {step.text}
        </PixelText>
        <View style={styles.bubbleActions}>
          <TouchableOpacity onPress={onSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <PixelText size="tiny" color={COLORS.gray}>Saltar tutorial</PixelText>
          </TouchableOpacity>
          <PixelButton title="SIGUIENTE →" color={COLORS.primary} onPress={onNext} small />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 1000 },
  mask: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.72)' },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  bubble: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: COLORS.deskDark,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '80',
    padding: 16,
  },
  bubbleActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
```

- [ ] **Step 10.5: Commit**

```bash
git add src/utils/TutorialContext.js src/components/TutorialTarget.js src/components/TutorialOverlay.js App.js
git commit -m "feat: add TutorialContext, TutorialTarget, TutorialOverlay for interactive tutorial"
```

---

### Task 11: Interactive Tutorial Integration

**Files:**
- Modify: `src/screens/TutorialScreen.js`
- Modify: `src/screens/MainMenuScreen.js`
- Modify: `src/screens/ClinicViewScreen.js`
- Modify: `src/screens/ConsultationScreen.js`
- Modify: `src/screens/GameModeSelector.js`

- [ ] **Step 11.1: Add TUTORIAL_STEPS and overlay to TutorialScreen**

In `src/screens/TutorialScreen.js`, replace or augment the existing static steps with this data and overlay integration:

```js
import TutorialOverlay from '../components/TutorialOverlay';
import gameState from '../utils/gameState';

const TUTORIAL_STEPS = [
  {
    id: 'step1',
    targetId: 'playButton',
    title: '¡Bienvenido a ChiroHero!',
    text: 'Pulsa JUGAR para abrir tu clínica quiropráctica y empezar a atender pacientes.',
  },
  {
    id: 'step2',
    targetId: 'openClinicBtn',
    title: 'Abre tu clínica',
    text: 'Toca ABRIR CONSULTA para comenzar el día. La sala de espera se llenará de pacientes.',
  },
  {
    id: 'step3',
    targetId: null,
    title: 'Elige tu estilo',
    text: 'Sala Cerrada: atención personalizada, más herramientas, más ingresos por paciente. Sala Abierta: más volumen, vista aérea, hasta 6 camillas.',
  },
  {
    id: 'step4',
    targetId: 'soapCard',
    title: 'Informe SOAP del paciente',
    text: 'Lee la ficha: Subjetivo (motivo), Objetivo (exploración), Evaluación (diagnóstico), Plan (tratamiento).',
  },
  {
    id: 'step5',
    targetId: 'treatBtn',
    title: 'Tratar al paciente',
    text: 'ATENDER AUTOMÁTICAMENTE es rápido. TRATAR MANUALMENTE activa un minijuego y te da hasta 1.5× de recompensa.',
  },
  {
    id: 'step6',
    targetId: null,
    title: 'Minijuego: Palpación',
    text: 'Toca las zonas dolorosas en el mapa de columna. Cada zona correcta suma puntos. ¡La precisión importa!',
  },
  {
    id: 'step7',
    targetId: null,
    title: 'Resultado',
    text: 'Al terminar ves tus ganancias y cambio de reputación. Más reputación = más pacientes mañana.',
  },
  {
    id: 'step8',
    targetId: null,
    title: '¡Listo para empezar!',
    text: 'Atiende pacientes, gana dinero, mejora tu clínica en la Tienda, y desbloquea logros. ¡Mucho éxito, Doctor!',
  },
];
```

Inside the component, manage step state:
```js
const [stepIndex, setStepIndex] = useState(0);

const handleNext = () => {
  if (stepIndex < TUTORIAL_STEPS.length - 1) {
    setStepIndex(prev => prev + 1);
  } else {
    // Tutorial complete
    gameState.set({ tutorialStep: 9, hasCompletedTutorial: true });
    navigation.navigate('ClinicModeSelector');
  }
};

const handleSkip = () => {
  gameState.set({ tutorialStep: 9, hasCompletedTutorial: true });
  navigation.navigate('ClinicModeSelector');
};
```

Add `<TutorialOverlay step={TUTORIAL_STEPS[stepIndex]} onNext={handleNext} onSkip={handleSkip} />` as the last child of the root View (so it overlays all content).

- [ ] **Step 11.2: Wrap key elements with TutorialTarget**

**In `src/screens/MainMenuScreen.js`:**
1. Add import: `import TutorialTarget from '../components/TutorialTarget';`
2. Wrap the JUGAR button:
   ```jsx
   <TutorialTarget id="playButton">
     <PixelButton title={t('play')} ... />
   </TutorialTarget>
   ```

**In `src/screens/ClinicViewScreen.js`:**
1. Add import: `import TutorialTarget from '../components/TutorialTarget';`
2. Wrap the "ABRIR CONSULTA" button (or its parent):
   ```jsx
   <TutorialTarget id="openClinicBtn">
     <PixelButton title={t('openClinic')} onPress={startDay} ... />
   </TutorialTarget>
   ```

**In `src/screens/ConsultationScreen.js`:**
1. Add import: `import TutorialTarget from '../components/TutorialTarget';`
2. Wrap the SOAP card:
   ```jsx
   <TutorialTarget id="soapCard">
     <SOAPReport ... />
   </TutorialTarget>
   ```
3. Wrap the "treatPatient" button:
   ```jsx
   <TutorialTarget id="treatBtn">
     <PixelButton title={t('treatPatient')} ... />
   </TutorialTarget>
   ```

- [ ] **Step 11.3: Auto-start tutorial on first new game**

In `src/screens/GameModeSelector.js`, in `handleConfirm` (just before `navigation.navigate('ClinicModeSelector')`), add:

```js
const tutorialStep = gameState.get('tutorialStep') || 0;
if (tutorialStep === 0) {
  navigation.navigate('TutorialScreen'); // tutorial will navigate to ClinicModeSelector on finish
} else {
  navigation.navigate('ClinicModeSelector');
}
```

- [ ] **Step 11.4: Verify tutorial flow**

New game (first time) → GameModeSelector → COMENZAR → TutorialScreen opens → 8 steps with overlays → last step → navigates to ClinicModeSelector → game starts.
Second playthrough: TutorialScreen is skipped, goes directly to ClinicModeSelector.

- [ ] **Step 11.5: Commit**

```bash
git add src/screens/TutorialScreen.js src/screens/MainMenuScreen.js src/screens/ClinicViewScreen.js src/screens/ConsultationScreen.js src/screens/GameModeSelector.js
git commit -m "feat: interactive 8-step tutorial with highlight overlays on real game screens"
```

---

### Task 12: PWA Metadata & Netlify Deploy

**Files:**
- Modify: `public/manifest.json`
- Modify: `public/sw.js` ← **do this BEFORE adding prebuild:pwa script**
- Create: `scripts/bump-sw-version.js`
- Create: `netlify.toml`
- Modify: `package.json`

⚠️ **Order matters:** Step 12.2 (add CACHE_VERSION to sw.js) MUST be done before Step 12.4 (add prebuild:pwa), otherwise the first `npm run build:pwa` will fail because the version string won't exist yet.

- [ ] **Step 12.1: Update manifest.json**

Replace the contents of `public/manifest.json` with:

```json
{
  "name": "ChiroHero - Clínica Quiropráctica",
  "short_name": "ChiroHero",
  "description": "Gestiona tu propia clínica quiropráctica. Atiende pacientes, diagnostica patologías, aplica técnicas manuales y haz crecer tu reputación. ¡El simulador de quiropráctica más completo!",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0d1a",
  "theme_color": "#1a1a2e",
  "orientation": "portrait",
  "lang": "es",
  "categories": ["games", "education"],
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "screenshots": [
    {
      "src": "screenshot-mobile.png",
      "sizes": "375x812",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Menú principal en móvil"
    },
    {
      "src": "screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Vista de clínica en escritorio"
    }
  ]
}
```

- [ ] **Step 12.2: Add CACHE_VERSION to sw.js (do this BEFORE Step 12.4)**

Open `public/sw.js`. At the **very top** of the file, before any existing code, add:

```js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `chirohero-${CACHE_VERSION}`;
```

Then replace any existing hardcoded `caches.open('chirohero-...')` calls with `caches.open(CACHE_NAME)`.

- [ ] **Step 12.3: Create bump-sw-version.js**

Create `scripts/bump-sw-version.js`:

```js
#!/usr/bin/env node
// Auto-increments CACHE_VERSION in public/sw.js before each PWA build.
// Called automatically via the prebuild:pwa npm script.
// Prerequisite: public/sw.js must already contain: const CACHE_VERSION = 'vN';

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/sw.js');

if (!fs.existsSync(swPath)) {
  console.error('ERROR: public/sw.js not found');
  process.exit(1);
}

let content = fs.readFileSync(swPath, 'utf8');
const match = content.match(/const CACHE_VERSION = 'v(\d+)'/);

if (!match) {
  // CACHE_VERSION missing — insert it at the top rather than failing
  content = "const CACHE_VERSION = 'v1';\nconst CACHE_NAME = `chirohero-${CACHE_VERSION}`;\n" + content;
  fs.writeFileSync(swPath, content, 'utf8');
  console.log('CACHE_VERSION inserted at v1 (was missing)');
  process.exit(0);
}

const newVersion = parseInt(match[1], 10) + 1;
content = content.replace(
  /const CACHE_VERSION = 'v\d+'/,
  `const CACHE_VERSION = 'v${newVersion}'`
);
fs.writeFileSync(swPath, content, 'utf8');
console.log(`sw.js CACHE_VERSION bumped to v${newVersion}`);
```

- [ ] **Step 12.4: Add prebuild:pwa to package.json**

In `package.json`, in the `"scripts"` section, add:
```json
"prebuild:pwa": "node scripts/bump-sw-version.js"
```

- [ ] **Step 12.5: Create netlify.toml**

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build:pwa"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 12.6: Test build locally**

```bash
cd "E:\Juego Movil App\ChiroHero"
npm run build:pwa
```

Verify:
- `dist/` directory created
- `dist/index.html` exists
- `dist/sw.js` contains `const CACHE_VERSION = 'v2'` (incremented from v1)
- No build errors

- [ ] **Step 12.7: Run lint check**

```bash
npm run lint
```

Expected: 0 warnings, 0 errors. Fix any lint issues before deploying.

- [ ] **Step 12.8: Commit all deploy files**

```bash
git add public/manifest.json public/sw.js scripts/bump-sw-version.js netlify.toml package.json
git commit -m "feat: PWA metadata, auto cache-busting sw version, Netlify deploy config"
```

- [ ] **Step 12.9: Push to GitHub and connect Netlify**

```bash
git push origin feature/minigames-graphics-fixes
```

Then:
1. Go to [app.netlify.com](https://app.netlify.com) → Sign up with GitHub
2. "Add new site" → "Import an existing project" → GitHub
3. Select repo `Quirocesar/ChiroHero`
4. Branch: `feature/minigames-graphics-fixes`
5. Build command and publish dir are pre-filled from `netlify.toml` — leave as-is
6. Click "Deploy site"
7. Wait ~2 minutes → site live at `[random-name].netlify.app`
8. In Netlify settings → change site name to `chirohero` → URL becomes `chirohero.netlify.app`

---

## Final Verification Checklist

After all tasks complete, verify on the Netlify URL (or local preview):

**Encoding:**
- [ ] All text in ES renders without `Ã` or `Â` characters
- [ ] Switching to EN/PT/IT/FR/DE shows correct accented characters

**Navigation:**
- [ ] All 13 screens are reachable and scroll fully on 375×812
- [ ] All modal screens have a `←` back button (PathologyBook, Events, Achievements, Shop, Tutorial, IntroductionStory)

**Game flow:**
- [ ] New game: GameModeSelector → ClinicModeSelectorScreen (first play: TutorialScreen first) → ClinicView
- [ ] `gameState.set()` calls use object syntax throughout (e.g. `gameState.set({ money: x })`)
- [ ] `tutorialStep` and `unlockedTables` exist in `DEFAULT_STATE` in `src/state/saveState.js`
- [ ] Tutorial auto-starts on first new game, does not repeat after completion

**Sala Cerrada:**
- [ ] Patient entrance animation plays (from top to table)
- [ ] 6 tools visible, each adds XP to experience bar
- [ ] "Finalizar tratamiento" shows result with earnings and reputation

**Sala Abierta:**
- [ ] Aerial view shows 2 tables (or more if unlocked)
- [ ] Patients spawn and walk to empty tables after ~3-7s
- [ ] Tapping occupied table opens quick-treatment popup
- [ ] All 3 technique options are shown; the correct technique is always one of the 3
- [ ] Wrong technique: standard earnings, small rep loss. Correct: +15% earnings

**Manual treatment:**
- [ ] "TRATAR MANUALMENTE" button appears in ConsultationScreen
- [ ] Modal slides up from bottom (not inside ScrollView)
- [ ] Choosing Palpación/Neuro switches to that phase; X-Ray shows locked if not purchased

**Build & Deploy:**
- [ ] `npm run lint` passes with 0 warnings
- [ ] `npm run build:pwa` completes without errors
- [ ] `dist/sw.js` has incremented CACHE_VERSION after each build
- [ ] Netlify auto-deploys on push to `feature/minigames-graphics-fixes`
- [ ] Game is installable as PWA (Add to Home Screen prompt visible in browser)
