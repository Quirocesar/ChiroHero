# Clean Clinical Aesthetic Redesign — Design Spec

## Goal

Replace ChiroHero's pixel-art/8-bit aesthetic with a modern "Clean Clinical" look. Teal/emerald palette on dark slate backgrounds, system sans-serif typography, flat buttons, clean cards. Keep component names (`PixelText`, `PixelButton`, `PixelCard`) to avoid renaming 37+ imports — only internals change.

## Color Palette

| Token | Old | New | Tailwind Ref |
|-------|-----|-----|--------------|
| `bg` | `#3f2832` | `#0F172A` | slate-900 |
| `bgDark` | `#2d1b24` | `#020617` | slate-950 |
| `bgLight` | `#5c3d4a` | `#1E293B` | slate-800 |
| `bgMedium` | `#4a2e3a` | `#334155` | slate-700 |
| `desk` | `#6b4c3b` | `#475569` | slate-600 |
| `deskLight` | `#8a6650` | `#64748B` | slate-500 |
| `deskDark` | `#4a3328` | `#334155` | slate-700 |
| `primary` | `#ffba35` | `#0D9488` | teal-600 |
| `primaryLight` | `#ffd06a` | `#14B8A6` | teal-500 |
| `primaryDark` | `#d4951a` | `#0F766E` | teal-700 |
| `secondary` | `#8b4513` | `#64748B` | slate-500 |
| `secondaryLight` | `#a0622d` | `#94A3B8` | slate-400 |
| `accent` | `#4a9e5c` | `#10B981` | emerald-500 |
| `accentLight` | `#6bbd7a` | `#34D399` | emerald-400 |
| `accentDark` | `#357a44` | `#059669` | emerald-600 |
| `gold` | `#e8a830` | `#F59E0B` | amber-500 |
| `goldLight` | `#f4c55a` | `#FBBF24` | amber-400 |
| `goldDark` | `#b8861e` | `#D97706` | amber-600 |
| `green` | `#4a9e5c` | `#10B981` | emerald-500 |
| `greenLight` | `#6bbd7a` | `#34D399` | emerald-400 |
| `greenDark` | `#357a44` | `#059669` | emerald-600 |
| `red` | `#c1374f` | `#EF4444` | red-500 |
| `redLight` | `#e05068` | `#F87171` | red-400 |
| `redDark` | `#962a3e` | `#DC2626` | red-600 |
| `orange` | `#d4731a` | `#F97316` | orange-500 |
| `orangeLight` | `#e8943a` | `#FB923C` | orange-400 |
| `white` | `#f7f3f2` | `#F8FAFC` | slate-50 |
| `gray` | `#9a8a80` | `#94A3B8` | slate-400 |
| `grayLight` | `#c4b8b0` | `#CBD5E1` | slate-300 |
| `grayDark` | `#6a5a50` | `#64748B` | slate-500 |
| `dark` | `#2b1810` | `#0F172A` | slate-900 |
| `darkAlt` | `#3a2820` | `#1E293B` | slate-800 |
| `black` | `#1a0e08` | `#020617` | slate-950 |
| `border` | `#d7c8c4` | `#334155` | slate-700 |
| `paper` | `#f7f3f2` | `#FFFFFF` | white |
| `paperDark` | `#e8e0d8` | `#F1F5F9` | slate-100 |
| `paperLight` | `#fefcfb` | `#FFFFFF` | white |
| `ink` | `#2b1810` | `#0F172A` | slate-900 |
| `inkLight` | `#5a4035` | `#475569` | slate-600 |
| `wall` | `#d4c4b0` | `#1E293B` | slate-800 |
| `wallDark` | `#b8a898` | `#0F172A` | slate-900 |
| `floor` | `#6b4c3b` | `#334155` | slate-700 |
| `floorLight` | `#8a6650` | `#475569` | slate-600 |
| `furniture` | `#5a4030` | `#1E293B` | slate-800 |
| `furnitureDark` | `#4a3328` | `#0F172A` | slate-900 |
| `skin` | `#ffdbac` | `#ffdbac` | (keep) |
| `skinDark` | `#e8b88a` | `#e8b88a` | (keep) |
| `skinLight` | `#ffe8cc` | `#ffe8cc` | (keep) |
| `bone` | `#f0ead6` | `#E2E8F0` | slate-200 |
| `boneDark` | `#d4ceb8` | `#CBD5E1` | slate-300 |
| `muscle` | `#c1440e` | `#DC2626` | red-600 |
| `muscleLight` | `#e05530` | `#EF4444` | red-500 |
| `healthy` | `#4a9e5c` | `#10B981` | emerald-500 |
| `inflamed` | `#c1374f` | `#EF4444` | red-500 |
| `diamond` | `#b9f2ff` | `#67E8F9` | cyan-300 |
| `diamondDark` | `#7ac5cd` | `#22D3EE` | cyan-400 |
| `legendary` | `#ffd700` | `#FBBF24` | amber-400 |
| `epic` | `#a335ee` | `#A855F7` | purple-500 |
| `rare` | `#0070dd` | `#3B82F6` | blue-500 |
| `uncommon` | `#1eff00` | `#22C55E` | green-500 |

## Typography

### PIXEL_FONT
```js
{ fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui, -apple-system, sans-serif' }) }
```

### PixelText internals
- Default `fontFamily`: system sans-serif (not monospace)
- Default `fontWeight`: '400' for body, '600' for titles
- `letterSpacing`: 0.3 (not 1-2)
- `textShadow`: none by default. `shadow` prop adds subtle `rgba(0,0,0,0.1)` offset 0,1
- `glow` prop: teal glow for logo/special text
- Badge: `borderRadius: 12`, semi-transparent background

### Size scale (unchanged values, just reference)
tiny: 11, small: 13, normal: 15, medium: 19, large: 25, xlarge: 33, title: 41, giant: 57

## PixelButton Redesign

Remove the 3D bottom-edge effect entirely. New design:

- **Shape:** `borderRadius: 12`, no thick border (borderWidth: 0 or 1.5 subtle)
- **Primary variant:** `backgroundColor: teal-600`, text white, no border
- **Secondary variant:** `backgroundColor: transparent`, border 1.5px slate-600, text slate-50
- **Danger variant:** `backgroundColor: red-500`, text white
- **Disabled:** `backgroundColor: slate-700`, text slate-500
- **Press animation:** `Animated.spring` scale to 0.97 (replaces translateY)
- **Font:** system sans-serif, fontWeight '600', no textTransform uppercase, letterSpacing 0.5
- **Highlight line:** removed

## PixelCard Redesign

Remove folded corner and inner highlight effects. New design:

- **Shape:** `borderRadius: 16`, `borderWidth: 1`, `borderColor: slate-700`
- **Background:** white (on light surfaces) or `slate-800` (on dark bg) — controlled by existing `color` prop
- **Default color prop:** change from `COLORS.paper` to `COLORS.bgLight` (slate-800) since most cards sit on dark backgrounds
- **Shadow:** `shadowColor: '#000'`, opacity 0.15, radius 8, offset {0,4}
- **Elevated:** opacity 0.25, radius 16, offset {0,8}
- **Header:** backgroundColor teal-600, borderRadius top-left/right 15, text white
- **Glow:** teal glow instead of gold

## PIXEL_BORDER / PIXEL_SHADOW exports

```js
PIXEL_BORDER = { borderWidth: 1, borderColor: '#334155' } // slate-700
PIXEL_SHADOW = { shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }
```

## Hardcoded Color Sweep

Files using hardcoded old colors (not via COLORS.x) need manual updates. Key patterns to find-and-replace:
- `#3f2832` → use `COLORS.bg`
- `#2b1810` → use `COLORS.dark`
- `#ffba35` → use `COLORS.primary`
- `backgroundColor: '#...'` patterns referencing old brown/gold tones

## Files Modified

### Core (4 files — change internals only):
1. `src/utils/theme.js` — full palette swap + font change
2. `src/components/PixelText.js` — system font, no heavy shadows
3. `src/components/PixelButton.js` — flat button, scale animation
4. `src/components/PixelCard.js` — clean card, no pixel decorations

### Hardcoded color fixes (~10-15 files):
- Screens and components with inline `backgroundColor`, `color`, or `borderColor` using old hex values directly instead of `COLORS.x` tokens.

### Zero changes needed:
- Files using only `<PixelText>`, `<PixelButton>`, `<PixelCard>` with standard props — they inherit the new look automatically.

## What stays the same
- Component names (PixelText, PixelButton, PixelCard)
- Component APIs (all props preserved)
- Game mechanics, navigation, state management
- Sound system
- PWA infrastructure
- Skin/body colors for patient rendering
