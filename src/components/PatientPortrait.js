/**
 * PatientPortrait.js
 * 24x28 caricature bust portrait for ChiroHero consultation scenes.
 * Supplements (does not replace) PixelAvatar — kept for walking scenes.
 *
 * Grid: 24 wide × 28 tall pixel units
 * Pixel unit: size / 24   (at size=120 → px=5)
 * Render size: ~120×140 px (default size=120)
 *
 * Budget: ~180 Views per portrait (enforced via useMemo)
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/theme';

// ─────────────────────────────────────────────
// Utility helpers (same pattern as PixelAvatar)
// ─────────────────────────────────────────────

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ─────────────────────────────────────────────
// Palettes
// ─────────────────────────────────────────────

// 6 skin tones — lightest to darkest
const SKIN_TONES = [
  '#ffe8cc',
  '#ffdbac',
  '#e8b88a',
  '#c49870',
  '#8d6e4a',
  '#5a3e28',
];

// 8 shirt colors derived from name hash
const SHIRT_COLORS = [
  '#4a90d9', // blue
  '#e94560', // red
  '#06d6a0', // teal
  '#f4d35e', // gold
  '#533483', // purple
  '#ff6b35', // orange
  '#00b4d8', // cyan
  '#c1440e', // rust
];

// Hair colors (tied to hash)
const HAIR_COLORS = [
  '#2b1b0e', // very dark brown
  '#5c3317', // medium brown
  '#8b5e3c', // light brown
  '#c0a060', // dirty blonde
  '#f0e68c', // blonde
  '#d0d0d0', // silver/grey
  '#1a1a2e', // near-black
  '#b22222', // auburn/red
];

// ─────────────────────────────────────────────
// Pixel-renderer helper
// ─────────────────────────────────────────────

/**
 * Px(col, row, color, w, h, px) — renders one pixel block.
 * Returns a positioned View (without key — key assigned in useMemo via map).
 */
function Px(col, row, color, w = 1, h = 1, px) {
  return {
    style: {
      position: 'absolute',
      left: col * px,
      top: row * px,
      width: w * px,
      height: h * px,
      backgroundColor: color,
    },
  };
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function PatientPortrait({
  name = '',
  avatar,            // optional override for skin/hair
  expression = 'neutral',
  size = 120,
  animated = true,   // idle breathing
}) {
  // px is the size of one grid unit
  const px = size / 24;
  // Portrait height: 28 rows
  const height = (28 / 24) * size; // ≈ 140 at size=120

  // Deterministic hash for procedural variety
  const hash = useMemo(
    () => hashStr(name || avatar?.hairColor || 'default'),
    [name, avatar?.hairColor],
  );

  // ── Derived colours ──────────────────────────
  const skinColor   = avatar?.skinTone  || SKIN_TONES[hash % SKIN_TONES.length];
  const skinShadow  = darkenColor(skinColor, 28);
  const skinHighlight = lightenColor(skinColor, 20);
  const hairColor   = avatar?.hairColor || HAIR_COLORS[(hash >> 3) % HAIR_COLORS.length];
  const hairHighlight = lightenColor(hairColor, 30);
  const hairShadow  = darkenColor(hairColor, 25);
  const shirtColor  = SHIRT_COLORS[(hash >> 5) % SHIRT_COLORS.length];
  const shirtHighlight = lightenColor(shirtColor, 35);
  const shirtShadow = darkenColor(shirtColor, 40);
  const outlineColor = '#1a1a2e';
  const eyeColor     = '#1a1a2e';
  const eyeWhite     = '#f0f0f0';
  const mouthColor   = '#b03030';
  const noseColor    = darkenColor(skinColor, 22);
  const teethColor   = '#f7f3f2';
  const blushColor   = '#f4a8a0';

  // ── Procedural feature indices ──────────────
  // face shapes: 0=round 1=square 2=long 3=triangular 4=oval 5=wide
  const faceShape    = (hash >> 1) % 6;
  // nose types: 0=big-round 1=pointy 2=small 3=bulbous 4=upturned
  const noseType     = (hash >> 2) % 5;
  // eye types: 0=round 1=narrow 2=wide 3=droopy
  const eyeType      = (hash >> 4) % 4;
  // hair styles: 0=short 1=tall 2=bald 3=mohawk 4=side-swept 5=curly 6=long 7=ponytail
  const hairStyle    = (hash >> 6) % 8;
  // facial hair: 0=none 1=mustache 2=beard 3=goatee
  const facialHair   = (hash >> 8) % 4;
  // accessory: 0=none 1=glasses 2=bandage 3=hat
  const accessory    = (hash >> 10) % 4;

  // ── Animation refs ──────────────────────────
  const breathAnim  = useRef(new Animated.Value(1)).current;
  const squashAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim   = useRef(new Animated.Value(0)).current;
  const prevExprRef = useRef(expression);

  // Idle breathing (scale 1.0 → 1.01)
  useEffect(() => {
    if (!animated) {
      breathAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.012,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, breathAnim]);

  // Expression-change squash-stretch (scaleY 0.9 → 1.05 → 1.0, 200ms)
  useEffect(() => {
    if (prevExprRef.current !== expression) {
      prevExprRef.current = expression;
      Animated.sequence([
        Animated.timing(squashAnim, {
          toValue: 0.9,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(squashAnim, {
          toValue: 1.05,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(squashAnim, {
          toValue: 1.0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [expression, squashAnim]);

  // Enter slide (spring bounce from left)
  useEffect(() => {
    slideAnim.setValue(-size * 0.5);
    Animated.spring(slideAnim, {
      toValue: 0,
      speed: 14,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, size]);

  // ── Static pixel grid (memoised) ────────────
  const pixelGrid = useMemo(() => {
    const P = (col, row, color, w = 1, h = 1) => Px(col, row, color, w, h, px);
    const pixels = [];

    // ── HELPERS ──────────────────────────────

    // Face bounding box varies by face shape
    // faceShape: 0=round, 1=square, 2=long, 3=triangular, 4=oval, 5=wide
    const faceLeft  = faceShape === 5 ? 2 : faceShape === 3 ? 4 : 3;
    const faceRight = faceShape === 5 ? 21 : faceShape === 3 ? 20 : 20;
    const faceWidth = faceRight - faceLeft;      // columns of skin fill
    const faceStart = 4;  // top row of skin (rows 0-3 = hair zone)
    const chinRow   = faceShape === 2 ? 16 : faceShape === 1 ? 14 : 15; // long face = row 16

    // ─────────────────────────────────────────
    // SECTION 1: HAIR (rows 0-3)
    // ─────────────────────────────────────────
    switch (hairStyle) {
      case 0: // short
        pixels.push(P(faceLeft,     2, hairColor, faceWidth, 2));
        pixels.push(P(faceLeft,     2, hairHighlight, 4, 1));
        pixels.push(P(faceLeft - 1, 3, hairColor, 1, 4));  // left sideburn
        pixels.push(P(faceRight,    3, hairColor, 1, 3));  // right sideburn
        break;
      case 1: // tall
        pixels.push(P(faceLeft + 1, 0, hairColor, faceWidth - 2, 2));
        pixels.push(P(faceLeft,     2, hairColor, faceWidth, 2));
        pixels.push(P(faceLeft + 2, 0, hairHighlight, 3, 1));
        pixels.push(P(faceLeft - 1, 3, hairColor, 1, 4));
        pixels.push(P(faceRight,    3, hairColor, 1, 3));
        break;
      case 2: // bald
        pixels.push(P(faceLeft, 3, skinShadow, faceWidth, 1));
        pixels.push(P(faceLeft - 1, 4, skinShadow, 1, 2));  // light shadow
        break;
      case 3: // mohawk
        pixels.push(P(10, 0, hairColor, 4, 4));
        pixels.push(P(11, 0, hairHighlight, 1, 2));
        pixels.push(P(faceLeft - 1, 3, hairColor, 1, 3));
        pixels.push(P(faceRight,    3, hairColor, 1, 2));
        break;
      case 4: // side-swept
        pixels.push(P(faceLeft - 1, 2, hairColor, faceWidth + 3, 2));
        pixels.push(P(faceLeft - 2, 3, hairColor, 3, 3));    // sweeps left
        pixels.push(P(faceLeft + 1, 2, hairHighlight, 5, 1));
        pixels.push(P(faceRight,    3, hairColor, 1, 2));
        break;
      case 5: // curly
        // Curly represented as bumpy top edge
        pixels.push(P(faceLeft,         1, hairColor, 2, 3));
        pixels.push(P(faceLeft + 3,     0, hairColor, 2, 4));
        pixels.push(P(faceLeft + 6,     1, hairColor, 2, 3));
        pixels.push(P(faceLeft + 9,     0, hairColor, 2, 4));
        pixels.push(P(faceLeft + 12,    1, hairColor, 2, 3));
        pixels.push(P(faceLeft - 1,     3, hairColor, 1, 4));
        pixels.push(P(faceRight,        3, hairColor, 1, 3));
        pixels.push(P(faceLeft + 2,     1, hairHighlight, 1, 1));
        pixels.push(P(faceLeft + 8,     0, hairHighlight, 1, 1));
        break;
      case 6: // long (hangs below shoulders — only top portion here)
        pixels.push(P(faceLeft,     1, hairColor, faceWidth, 3));
        pixels.push(P(faceLeft - 1, 3, hairColor, 2, 14)); // left side fall
        pixels.push(P(faceRight - 1, 3, hairColor, 2, 14)); // right side fall
        pixels.push(P(faceLeft + 1, 1, hairHighlight, 4, 1));
        break;
      case 7: // ponytail
        pixels.push(P(faceLeft,     2, hairColor, faceWidth, 2));
        pixels.push(P(faceLeft - 1, 3, hairColor, 1, 3));
        pixels.push(P(faceRight,    3, hairColor, 1, 2));
        // Ponytail bun on top-right
        pixels.push(P(faceRight - 2, 0, hairColor, 4, 4));
        pixels.push(P(faceRight - 1, 0, hairHighlight, 1, 1));
        break;
      default:
        pixels.push(P(faceLeft, 2, hairColor, faceWidth, 2));
    }

    // ─────────────────────────────────────────
    // SECTION 2: FACE / HEAD (rows 4 – chinRow)
    // ─────────────────────────────────────────
    // Outline
    pixels.push(P(faceLeft,     faceStart,     outlineColor, faceWidth, 1)); // top
    pixels.push(P(faceLeft - 1, faceStart + 1, outlineColor, 1, chinRow - faceStart)); // left
    pixels.push(P(faceRight,    faceStart + 1, outlineColor, 1, chinRow - faceStart)); // right
    pixels.push(P(faceLeft,     chinRow,        outlineColor, faceWidth, 1)); // bottom jaw

    // Skin fill
    pixels.push(P(faceLeft, faceStart + 1, skinColor, faceWidth, chinRow - faceStart - 1));

    // Subtle right-side & bottom shadow for depth
    pixels.push(P(faceRight - 1, faceStart + 2, skinShadow, 1, chinRow - faceStart - 3));
    pixels.push(P(faceLeft + 1,  chinRow - 1,   skinShadow, faceWidth - 2, 1));

    // Ear left
    pixels.push(P(faceLeft - 2, 8,  skinColor,  1, 3));
    pixels.push(P(faceLeft - 2, 9,  skinShadow, 1, 1));
    // Ear right
    pixels.push(P(faceRight + 1, 8,  skinColor,  1, 3));
    pixels.push(P(faceRight + 1, 9,  skinShadow, 1, 1));

    // ── NOSE (rows 8-10, caricature large) ───
    // Nose anchor: horizontally centred around col 12
    const noseCX = 11; // left col of nose zone
    switch (noseType) {
      case 0: // big round (4×3)
        pixels.push(P(noseCX,     8, noseColor, 4, 3));
        pixels.push(P(noseCX,     8, skinHighlight, 1, 1));
        pixels.push(P(noseCX + 3, 10, skinShadow,  1, 1));
        break;
      case 1: // pointy (2×4)
        pixels.push(P(noseCX + 1, 7, noseColor, 2, 4));
        pixels.push(P(noseCX + 1, 7, skinHighlight, 1, 1));
        break;
      case 2: // small (2×2)
        pixels.push(P(noseCX + 1, 9,  noseColor, 2, 2));
        pixels.push(P(noseCX + 1, 9,  skinHighlight, 1, 1));
        break;
      case 3: // bulbous (5×3)
        pixels.push(P(noseCX - 1, 8, noseColor, 5, 3));
        pixels.push(P(noseCX,     8, skinHighlight, 2, 1));
        pixels.push(P(noseCX + 3, 10, skinShadow, 1, 1));
        pixels.push(P(noseCX - 1, 10, skinShadow, 1, 1));
        break;
      case 4: // upturned (3×3)
        pixels.push(P(noseCX + 1, 8, noseColor, 3, 3));
        pixels.push(P(noseCX + 1, 9, skinHighlight, 1, 1));
        pixels.push(P(noseCX + 1, 8, skinShadow,    1, 1));
        break;
      default:
        pixels.push(P(noseCX, 8, noseColor, 4, 3));
    }

    // ── CHEEK BLUSH (rows 10-11) ─────────────
    pixels.push(P(faceLeft + 1,      10, blushColor, 2, 1));
    pixels.push(P(faceRight - 3,     10, blushColor, 2, 1));

    // ── EYES (rows 6-7) ──────────────────────
    // Eye positions: left eye cols 5-8, right eye cols 13-16
    // (on the larger 24-wide face these shift slightly)
    const eyeLCol = faceLeft + 2;   // ≈5
    const eyeRCol = faceRight - 6;  // ≈14
    const eyeRow  = 6;

    const expr = expression || 'neutral';

    switch (expr) {
      case 'pain':
        // X eyes
        pixels.push(P(eyeLCol,     eyeRow,     eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 2, eyeRow,     eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 1, eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeLCol,     eyeRow + 2, eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 2, eyeRow + 2, eyeColor, 1, 1));
        // right X
        pixels.push(P(eyeRCol,     eyeRow,     eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 2, eyeRow,     eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 1, eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeRCol,     eyeRow + 2, eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 2, eyeRow + 2, eyeColor, 1, 1));
        // sweat drops (2 blue dots near temples)
        pixels.push(P(faceLeft + 1, eyeRow - 1, '#6ab4f5', 1, 1));
        pixels.push(P(faceRight - 2, eyeRow - 1, '#6ab4f5', 1, 1));
        break;

      case 'happy':
        // U-shaped closed eyes (arc — top row empty, bottom row filled)
        pixels.push(P(eyeLCol,     eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 1, eyeRow + 2, eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 2, eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeRCol,     eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 1, eyeRow + 2, eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 2, eyeRow + 1, eyeColor, 1, 1));
        break;

      case 'worried':
        // Wide eyes (3×2) + raised inner brows (offset pixel above inner corner)
        pixels.push(P(eyeLCol - 1, eyeRow - 2, eyeColor, 1, 1));   // left inner brow raised
        pixels.push(P(eyeRCol + 2, eyeRow - 2, eyeColor, 1, 1));   // right inner brow raised
        // eye whites
        pixels.push(P(eyeLCol, eyeRow, eyeWhite, 3, 2));
        pixels.push(P(eyeRCol, eyeRow, eyeWhite, 3, 2));
        // pupils
        pixels.push(P(eyeLCol + 1, eyeRow, eyeColor, 1, 2));
        pixels.push(P(eyeRCol + 1, eyeRow, eyeColor, 1, 2));
        // eye outline
        pixels.push(P(eyeLCol, eyeRow,     outlineColor, 3, 1));
        pixels.push(P(eyeLCol, eyeRow + 2, outlineColor, 3, 1));
        pixels.push(P(eyeRCol, eyeRow,     outlineColor, 3, 1));
        pixels.push(P(eyeRCol, eyeRow + 2, outlineColor, 3, 1));
        break;

      case 'relieved':
        // Half-closed eyes (bottom half only — top row is skin, bottom row is pupil line)
        pixels.push(P(eyeLCol,     eyeRow + 1, eyeColor, 3, 1));
        pixels.push(P(eyeLCol + 1, eyeRow,     skinColor, 1, 1));  // top half obscured by lid
        pixels.push(P(eyeRCol,     eyeRow + 1, eyeColor, 3, 1));
        pixels.push(P(eyeRCol + 1, eyeRow,     skinColor, 1, 1));
        break;

      case 'angry':
        // Angled brows (diagonal line going inward-down) + dot pupils
        // left brow: high outside, low inside
        pixels.push(P(eyeLCol,     eyeRow - 2, eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 1, eyeRow - 1, eyeColor, 1, 1));
        pixels.push(P(eyeLCol + 2, eyeRow - 1, eyeColor, 1, 1));
        // right brow: low outside, high inside
        pixels.push(P(eyeRCol + 2, eyeRow - 2, eyeColor, 1, 1));
        pixels.push(P(eyeRCol,     eyeRow - 1, eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 1, eyeRow - 1, eyeColor, 1, 1));
        // dot eyes
        pixels.push(P(eyeLCol + 1, eyeRow + 1, eyeColor, 1, 1));
        pixels.push(P(eyeRCol + 1, eyeRow + 1, eyeColor, 1, 1));
        // red cheek tint
        pixels.push(P(faceLeft + 1,  10, '#e05068', 2, 1));
        pixels.push(P(faceRight - 3, 10, '#e05068', 2, 1));
        break;

      case 'neutral':
      default:
        // Standard 2×2 dot eyes with white glint
        switch (eyeType) {
          case 1: // narrow (3×1)
            pixels.push(P(eyeLCol, eyeRow + 1, eyeColor, 3, 1));
            pixels.push(P(eyeRCol, eyeRow + 1, eyeColor, 3, 1));
            break;
          case 2: // wide (3×2)
            pixels.push(P(eyeLCol, eyeRow, eyeWhite, 3, 2));
            pixels.push(P(eyeRCol, eyeRow, eyeWhite, 3, 2));
            pixels.push(P(eyeLCol + 1, eyeRow, eyeColor, 1, 2));
            pixels.push(P(eyeRCol + 1, eyeRow, eyeColor, 1, 2));
            pixels.push(P(eyeLCol, eyeRow, outlineColor, 3, 1));
            pixels.push(P(eyeRCol, eyeRow, outlineColor, 3, 1));
            break;
          case 3: // droopy (2×2 offset down)
            pixels.push(P(eyeLCol, eyeRow + 1, eyeColor, 2, 2));
            pixels.push(P(eyeLCol, eyeRow + 1, eyeWhite, 1, 1));
            pixels.push(P(eyeRCol, eyeRow + 1, eyeColor, 2, 2));
            pixels.push(P(eyeRCol, eyeRow + 1, eyeWhite, 1, 1));
            // droopy eyelid line
            pixels.push(P(eyeLCol - 1, eyeRow + 1, skinShadow, 1, 1));
            pixels.push(P(eyeRCol + 2, eyeRow + 1, skinShadow, 1, 1));
            break;
          case 0: // round (2×2) — default
          default:
            pixels.push(P(eyeLCol, eyeRow, eyeColor, 2, 2));
            pixels.push(P(eyeLCol, eyeRow, eyeWhite, 1, 1)); // glint
            pixels.push(P(eyeRCol, eyeRow, eyeColor, 2, 2));
            pixels.push(P(eyeRCol, eyeRow, eyeWhite, 1, 1));
        }
        break;
    }

    // ── MOUTH (rows 12-13) ───────────────────
    const mouthRow = 12;
    const mouthCX  = 10; // left col of mouth zone
    switch (expr) {
      case 'pain':
        // Wide open mouth (4×3 oval)
        pixels.push(P(mouthCX,     mouthRow,     outlineColor, 4, 1));
        pixels.push(P(mouthCX - 1, mouthRow + 1, outlineColor, 1, 2));
        pixels.push(P(mouthCX + 4, mouthRow + 1, outlineColor, 1, 2));
        pixels.push(P(mouthCX,     mouthRow + 3, outlineColor, 4, 1));
        pixels.push(P(mouthCX,     mouthRow + 1, mouthColor,   4, 2));
        pixels.push(P(mouthCX + 1, mouthRow + 2, '#8b0000',    2, 1)); // back of mouth
        pixels.push(P(mouthCX,     mouthRow + 2, teethColor,   4, 1)); // top teeth
        break;

      case 'happy':
        // Huge smile (6-wide curve)
        pixels.push(P(mouthCX - 1, mouthRow,     mouthColor, 1, 1));
        pixels.push(P(mouthCX,     mouthRow + 1, mouthColor, 6, 1));
        pixels.push(P(mouthCX + 5, mouthRow,     mouthColor, 1, 1));
        // teeth
        pixels.push(P(mouthCX,     mouthRow + 1, teethColor, 6, 1));
        pixels.push(P(mouthCX - 1, mouthRow + 1, mouthColor, 1, 1));
        pixels.push(P(mouthCX + 6, mouthRow + 1, mouthColor, 1, 1));
        break;

      case 'worried':
        // Wavy mouth
        pixels.push(P(mouthCX,     mouthRow + 1, mouthColor, 1, 1));
        pixels.push(P(mouthCX + 1, mouthRow,     mouthColor, 1, 1));
        pixels.push(P(mouthCX + 2, mouthRow + 1, mouthColor, 1, 1));
        pixels.push(P(mouthCX + 3, mouthRow,     mouthColor, 1, 1));
        pixels.push(P(mouthCX + 4, mouthRow + 1, mouthColor, 1, 1));
        break;

      case 'relieved':
        // Gentle smile (4-wide curve)
        pixels.push(P(mouthCX + 1, mouthRow,     mouthColor, 1, 1));
        pixels.push(P(mouthCX + 2, mouthRow + 1, mouthColor, 2, 1));
        pixels.push(P(mouthCX + 4, mouthRow,     mouthColor, 1, 1));
        break;

      case 'angry':
        // Tight frown (corners down)
        pixels.push(P(mouthCX,     mouthRow + 1, mouthColor, 1, 1)); // left corner down
        pixels.push(P(mouthCX + 1, mouthRow,     mouthColor, 4, 1)); // flat middle
        pixels.push(P(mouthCX + 5, mouthRow + 1, mouthColor, 1, 1)); // right corner down
        break;

      case 'neutral':
      default:
        // Straight mouth line
        pixels.push(P(mouthCX + 1, mouthRow, mouthColor, 4, 1));
        break;
    }

    // ── FACIAL HAIR (below nose / jaw area) ─────
    if (facialHair > 0) {
      const fhColor = darkenColor(hairColor, 10);
      switch (facialHair) {
        case 1: // mustache (cols 9-14, row 11)
          pixels.push(P(9,  11, fhColor, 2, 1));
          pixels.push(P(13, 11, fhColor, 2, 1));
          pixels.push(P(10, 11, fhColor, 1, 1));
          pixels.push(P(13, 11, fhColor, 1, 1));
          break;
        case 2: // beard (jaw area rows 13-15)
          pixels.push(P(faceLeft,     13, fhColor, faceWidth, 1));
          pixels.push(P(faceLeft - 1, 14, fhColor, faceWidth + 2, 2));
          break;
        case 3: // goatee (chin only rows 13-15, narrow)
          pixels.push(P(10, 13, fhColor, 4, 3));
          break;
      }
    }

    // ── ACCESSORIES ─────────────────────────────
    if (accessory > 0) {
      switch (accessory) {
        case 1: { // glasses (border around eyes)
          const glassColor = '#2b1b0e';
          // left lens frame
          pixels.push(P(eyeLCol - 1, eyeRow - 1, glassColor, 4, 1));
          pixels.push(P(eyeLCol - 1, eyeRow + 2, glassColor, 4, 1));
          pixels.push(P(eyeLCol - 1, eyeRow,     glassColor, 1, 2));
          pixels.push(P(eyeLCol + 3, eyeRow,     glassColor, 1, 2));
          // bridge
          pixels.push(P(eyeLCol + 3, eyeRow,     glassColor, eyeRCol - eyeLCol - 3, 1));
          // right lens frame
          pixels.push(P(eyeRCol - 1, eyeRow - 1, glassColor, 4, 1));
          pixels.push(P(eyeRCol - 1, eyeRow + 2, glassColor, 4, 1));
          pixels.push(P(eyeRCol - 1, eyeRow,     glassColor, 1, 2));
          pixels.push(P(eyeRCol + 3, eyeRow,     glassColor, 1, 2));
          // temples (arms extending to ears)
          pixels.push(P(faceLeft,     eyeRow, glassColor, eyeLCol - faceLeft, 1));
          pixels.push(P(eyeRCol + 3,  eyeRow, glassColor, faceRight - eyeRCol - 3, 1));
          break;
        }
        case 2: { // bandage (forehead strip, rows 4-5)
          pixels.push(P(faceLeft + 1, 4, '#f7f3f2', faceWidth - 2, 2));
          pixels.push(P(faceLeft + 3, 4, '#e8b88a', 1, 2)); // tape cross
          pixels.push(P(faceRight - 4, 4, '#e8b88a', 1, 2));
          break;
        }
        case 3: { // hat (rows 0-3 overlaid)
          const hatColor = darkenColor(shirtColor, 20);
          const hatBrim  = darkenColor(hatColor, 15);
          pixels.push(P(faceLeft + 1, 0, hatColor,  faceWidth - 2, 3));
          pixels.push(P(faceLeft - 1, 3, hatBrim,   faceWidth + 2, 1));
          pixels.push(P(faceLeft + 2, 0, lightenColor(hatColor, 20), 3, 1));
          break;
        }
      }
    }

    // ─────────────────────────────────────────
    // SECTION 3: NECK (rows 17-18)
    // ─────────────────────────────────────────
    const neckLeft  = 10;
    const neckWidth = 4;
    pixels.push(P(neckLeft,         17, skinColor,  neckWidth, 2));
    pixels.push(P(neckLeft + neckWidth - 1, 17, skinShadow, 1, 2));

    // ─────────────────────────────────────────
    // SECTION 4: COLLAR / SHIRT TOP (rows 19-20)
    // ─────────────────────────────────────────
    // Collar V-shape
    pixels.push(P(6,  19, shirtColor, 12, 1));  // collar band
    pixels.push(P(5,  20, shirtColor, 14, 1));
    // V-notch of collar
    pixels.push(P(10, 19, skinColor,  4,  1));   // skin showing in V
    pixels.push(P(11, 20, skinColor,  2,  1));
    // Collar highlight
    pixels.push(P(6,  19, shirtHighlight, 2, 1));

    // ─────────────────────────────────────────
    // SECTION 5: SHOULDERS / BODY (rows 21-27)
    // ─────────────────────────────────────────
    // Shirt body — wider trapezoid (shoulders wider than neck)
    pixels.push(P(2,  21, shirtColor, 20, 7));
    // Shoulder highlight (top-left)
    pixels.push(P(2,  21, shirtHighlight, 6, 1));
    pixels.push(P(2,  22, shirtHighlight, 1, 3));
    // Shadow (right side)
    pixels.push(P(18, 21, shirtShadow, 4, 7));
    pixels.push(P(2,  27, shirtShadow, 20, 1));
    // Shirt outline (top edge only — sides blend off-canvas)
    pixels.push(P(2, 21, outlineColor, 20, 1));

    return pixels;
  }, [
    name, avatar, expression,
    px,
    skinColor, skinShadow, skinHighlight, hairColor, hairHighlight, hairShadow,
    shirtColor, shirtHighlight, shirtShadow,
    outlineColor, eyeColor, eyeWhite, mouthColor, noseColor, teethColor, blushColor,
    faceShape, noseType, eyeType, hairStyle, facialHair, accessory,
  ]);

  // ── Render ───────────────────────────────────
  return (
    <View style={[styles.container, { width: size + 12, height: height + 12 }]}>
      {/* Background circle for framing */}
      <View style={[styles.portraitBg, {
        width: size + 8,
        height: height + 4,
        borderRadius: (size + 8) / 2.5,
      }]} />
      {/* Subtle inner glow */}
      <View style={[styles.portraitGlow, {
        width: size + 4,
        height: height,
        borderRadius: (size + 4) / 2.8,
      }]} />
      <Animated.View
        style={{
          width: size,
          height,
          transform: [
            { translateX: slideAnim },
            { scale: breathAnim },
            { scaleY: squashAnim },
          ],
        }}
      >
        {/* Pixel grid is fully positioned-absolute, relative to this view */}
        {pixelGrid.map((p, i) => <View key={i} style={p.style} />)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitBg: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  portraitGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,248,240,0.06)',
  },
});
