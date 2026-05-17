/**
 * ForgeTheme — Dual-mode design system
 *
 * Dark: Deep graphite (not OLED black) with FORGE accent
 * Light: Apple-system off-white with same FORGE accent
 */

// ── Shared accent palette (identical in both modes) ────────────────────────
const accent = {
  forge:      '#FF5C2E',   // FORGE brand orange
  forgeDim:   '#FF5C2E26',
  forgeMid:   '#FF7D54',
  forgeMuted: '#CC4A25',

  green:    '#32D74B',
  greenDim: '#32D74B20',
  blue:     '#0A84FF',
  blueDim:  '#0A84FF20',
  gold:     '#FF9F0A',
  goldDim:  '#FF9F0A20',
  red:      '#FF453A',
  redDim:   '#FF453A20',
  purple:   '#BF5AF2',
  purpleDim:'#BF5AF220',
};

// ── Dark palette ───────────────────────────────────────────────────────────
export const DarkColors = {
  ...accent,
  bg0: '#111113',   // Page background — not pure black
  bg1: '#1C1C1E',   // Card / surface
  bg2: '#2C2C2E',   // Secondary surface
  bg3: '#3A3A3C',   // Tertiary / input
  bg4: '#48484A',   // Prominent floating layer

  b0:  '#3A3A3C',
  b1:  '#2C2C2E',
  b2:  '#3A3A3C',

  t1:  '#F5F5F7',   // Primary text — not pure white
  t2:  '#AEAEB2',   // Secondary text
  t3:  '#6E6E73',   // Placeholder / caption
  t4:  '#48484A',   // Disabled

  overlay:      'rgba(0,0,0,0.70)',
  overlayLight: 'rgba(0,0,0,0.40)',
  
  // Legacy aliases kept for backward compat
  forgeHover: '#FF7D54',
};

// ── Light palette ──────────────────────────────────────────────────────────
export const LightColors = {
  ...accent,
  bg0: '#F5F5F7',   // Page background — off-white
  bg1: '#FFFFFF',   // Card / surface — pure white
  bg2: '#FBFBFD',   // Secondary surface
  bg3: '#E5E5EA',   // Tertiary / input
  bg4: '#D2D2D7',   // Prominent layer

  b0:  '#D2D2D7',
  b1:  '#D2D2D7',
  b2:  '#AEAEB2',

  t1:  '#1D1D1F',   // Primary text
  t2:  '#6E6E73',   // Secondary text
  t3:  '#8E8E93',   // Placeholder / caption
  t4:  '#C7C7CC',   // Disabled

  overlay:      'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.20)',

  forgeHover: '#FF7D54',
};

// ── Static theme (typography, spacing, radii, motion) — same for both modes
const base = {
  typography: {
    families: {
      display: undefined,
      heading: undefined,
      body:    undefined,
      mono:    undefined,
    },
    sizes: {
      display: 34,
      h1:      28,
      h2:      22,
      h3:      20,
      body:    17,
      bodyS:   15,
      label:   13,
      caption: 11,
    },
    weights: {
      regular:  '400' as const,
      medium:   '500' as const,
      semibold: '600' as const,
      bold:     '700' as const,
      black:    '800' as const,
    },
    lineHeights: {
      tight: 1.1,
      body:  1.3,
      loose: 1.5,
    },
  },
  spacing: {
    px1: 4, px2: 8, px3: 12, px4: 16,
    px5: 20, px6: 24, px7: 32, px8: 48, px9: 64,
    xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, page: 20,
  },
  radii: {
    xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 5,
    },
    forge: {
      shadowColor: '#FF5C2E',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },
    float: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.30,
      shadowRadius: 24,
      elevation: 14,
    },
    lift: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
  },
  motion: {
    duration: {
      instant: 100, fast: 150, standard: 250,
      enter: 350, slow: 500, pulse: 1400,
    },
    spring: { damping: 14, stiffness: 120 } as const,
  },
  touch: { minSize: 44, minSizeMd: 48, minGap: 8 },
};

// ── Constructed theme objects ──────────────────────────────────────────────
export const DarkTheme  = { colors: DarkColors,  ...base } as const;
export const LightTheme = { colors: LightColors, ...base } as const;

// Default export keeps backward compat — components that import ForgeTheme
// directly still get the dark theme; they should migrate to useForgeTheme().
export const ForgeTheme = DarkTheme;
export const T = ForgeTheme;

export type ForgeColors  = typeof DarkColors;
export type ForgeSpacing = typeof base.spacing;
export type ForgeThemeType = typeof DarkTheme;
