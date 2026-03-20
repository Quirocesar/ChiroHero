// ChiroHero Theme — Warm Clinic Style (Prescribe & Pray inspired)
export const COLORS = {
  // Backgrounds - Warm dark browns
  bg: '#3f2832',
  bgDark: '#2d1b24',
  bgLight: '#5c3d4a',
  bgMedium: '#4a2e3a',

  // Desk / wood surfaces
  desk: '#6b4c3b',
  deskLight: '#8a6650',
  deskDark: '#4a3328',

  // Primary palette
  primary: '#ffba35',
  primaryLight: '#ffd06a',
  primaryDark: '#d4951a',
  secondary: '#8b4513',
  secondaryLight: '#a0622d',
  accent: '#4a9e5c',
  accentLight: '#6bbd7a',
  accentDark: '#357a44',

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

  // UI borders
  border: '#d7c8c4',

  // Game specific
  skin: '#ffdbac',
  skinDark: '#e8b88a',
  skinLight: '#ffe8cc',
  bone: '#f0ead6',
  boneDark: '#d4ceb8',
  muscle: '#c1440e',
  muscleLight: '#e05530',
  healthy: '#4a9e5c',
  inflamed: '#c1374f',

  // UI / paper
  paper: '#f7f3f2',
  paperDark: '#e8e0d8',
  paperLight: '#fefcfb',
  ink: '#2b1810',
  inkLight: '#5a4035',

  // Clinic walls & floor
  wall: '#d4c4b0',
  wallDark: '#b8a898',
  wallTop: '#d4c4b0',      // backward-compat alias → wall
  wallBottom: '#b8a898',   // backward-compat alias → wallDark
  floor: '#6b4c3b',        // backward-compat alias → desk
  floorLight: '#8a6650',   // backward-compat alias → deskLight
  furniture: '#5a4030',
  furnitureDark: '#4a3328',

  // Special/rare
  diamond: '#b9f2ff',
  diamondDark: '#7ac5cd',
  legendary: '#ffd700',
  epic: '#a335ee',
  rare: '#0070dd',
  uncommon: '#1eff00',
};

export const PIXEL_FONT = {
  fontFamily: 'monospace',
};

export const PIXEL_BORDER = {
  borderWidth: 1.5,
  borderColor: COLORS.border,
};

export const PIXEL_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 1, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
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
