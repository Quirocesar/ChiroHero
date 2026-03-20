# ChiroHero Art Bible v1 (Vertical Slice)

## 1. Visual Pillars

- Premium pixel art with readable silhouettes on mobile screens.
- Cozy clinical fantasy tone: calm, clean, optimistic.
- Consistent UI hierarchy: gameplay data first, decoration second.

## 2. Pixel Rules

- Base scale: 1x authored sprites, rendered at integer scale only.
- Character sprite target: 32x48 to 48x64 px.
- Environment tiles: 16x16 and 32x32 only.
- No mixed anti-aliasing; hard edges with 1 px outlines.

## 3. Palette Direction

- Clinical base: `#E9F5FF`, `#CFEAFF`, `#7BC7E8`, `#2A4B66`.
- Warm accent: `#F6C177`, `#E07A5F`.
- Positive feedback: `#6AD18B`.
- Warning feedback: `#F2C14E`.
- Negative feedback: `#E76F51`.

## 4. UI Grammar

- Cards: rounded 10-12 px, strong border contrast, subtle shadow.
- HUD priority order:
  1. Cash
  2. Debt
  3. Pending bonus
  4. Predicted patients
- Action bar CTA in one place only: `Atender automatico`.

## 5. Animation Language

- Duration tokens:
  - micro: 120 ms
  - short: 220 ms
  - medium: 350 ms
- Easing:
  - enter: ease-out
  - feedback pulse: ease-in-out
- Fixed feedback cadence:
  1. treatment outcome
  2. money delta
  3. reputation delta
  4. review bubble

## 6. Audio Mix Guidance

- One lo-fi bed per state:
  - menu
  - clinic loop
  - treatment focus
  - end-of-day
- SFX priority:
  1. treatment result
  2. debt warning
  3. UI click
- Avoid simultaneous layered SFX > 3 events.

## 7. Do / Don't

- Do: keep iconography chunky and readable.
- Do: use same border system in every panel.
- Do: keep text contrast AA+ for mobile.
- Don't: mix realistic gradients with flat pixel surfaces.
- Don't: add particle overload that hides actionable data.
