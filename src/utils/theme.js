// ChiroHero Theme — Clean Clinical (Teal / Emerald on Slate)
import { Platform } from 'react-native';

export const COLORS = {
  // Backgrounds — dark slate
  bg: '#0F172A',        // slate-900
  bgDark: '#020617',    // slate-950
  bgLight: '#1E293B',   // slate-800
  bgMedium: '#334155',  // slate-700

  // Surfaces
  desk: '#475569',      // slate-600
  deskLight: '#64748B', // slate-500
  deskDark: '#334155',  // slate-700

  // Primary — teal
  primary: '#0D9488',      // teal-600
  primaryLight: '#14B8A6', // teal-500
  primaryDark: '#0F766E',  // teal-700
  secondary: '#64748B',    // slate-500
  secondaryLight: '#94A3B8', // slate-400
  accent: '#10B981',       // emerald-500
  accentLight: '#34D399',  // emerald-400
  accentDark: '#059669',   // emerald-600

  // Feedback
  gold: '#F59E0B',       // amber-500
  goldLight: '#FBBF24',  // amber-400
  goldDark: '#D97706',   // amber-600
  green: '#10B981',      // emerald-500
  greenLight: '#34D399', // emerald-400
  greenDark: '#059669',  // emerald-600
  red: '#EF4444',        // red-500
  redLight: '#F87171',   // red-400
  redDark: '#DC2626',    // red-600
  orange: '#F97316',     // orange-500
  orangeLight: '#FB923C', // orange-400

  // Neutrals
  white: '#F8FAFC',      // slate-50
  gray: '#94A3B8',       // slate-400
  grayLight: '#CBD5E1',  // slate-300
  grayDark: '#64748B',   // slate-500
  dark: '#0F172A',       // slate-900
  darkAlt: '#1E293B',    // slate-800
  black: '#020617',      // slate-950

  // UI borders
  border: '#334155',     // slate-700

  // Game specific — skin tones kept
  skin: '#ffdbac',
  skinDark: '#e8b88a',
  skinLight: '#ffe8cc',
  bone: '#E2E8F0',       // slate-200
  boneDark: '#CBD5E1',   // slate-300
  muscle: '#DC2626',     // red-600
  muscleLight: '#EF4444', // red-500
  healthy: '#10B981',    // emerald-500
  inflamed: '#EF4444',   // red-500

  // UI / paper — clean whites
  paper: '#FFFFFF',
  paperDark: '#F1F5F9',  // slate-100
  paperLight: '#FFFFFF',
  ink: '#0F172A',        // slate-900
  inkLight: '#475569',   // slate-600

  // Clinic walls & floor — dark slate
  wall: '#1E293B',       // slate-800
  wallDark: '#0F172A',   // slate-900
  wallTop: '#1E293B',
  wallBottom: '#0F172A',
  floor: '#334155',      // slate-700
  floorLight: '#475569', // slate-600
  furniture: '#1E293B',  // slate-800
  furnitureDark: '#0F172A', // slate-900

  // Special/rare
  diamond: '#67E8F9',    // cyan-300
  diamondDark: '#22D3EE', // cyan-400
  legendary: '#FBBF24',  // amber-400
  epic: '#A855F7',       // purple-500
  rare: '#3B82F6',       // blue-500
  uncommon: '#22C55E',   // green-500
};

export const SYSTEM_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'system-ui, -apple-system, sans-serif',
});

export const PIXEL_FONT = {
  fontFamily: SYSTEM_FONT,
};

export const PIXEL_BORDER = {
  borderWidth: 1,
  borderColor: COLORS.border,
};

export const PIXEL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 4,
};

export function lighten(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export function darken(hex, amount = 60) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
