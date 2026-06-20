/**
 * DugóKo Design Tokens
 * "Dugo" = blood (Cebuano/Tagalog). The palette leans into the subject:
 * a deep clinical crimson as the hero color, warm paper background
 * (not sterile white) so the app feels human rather than hospital-cold,
 * and a calm teal as the "safe / eligible" signal color, distinct from
 * the red so users never confuse "urgent" with "good news".
 */

export const colors = {
  light: {
    crimson: '#B3122A',
    crimsonDark: '#7A0C1D',
    crimsonLight: '#FCE7E9',
    teal: '#0E7C7B',
    tealLight: '#E3F4F3',
    amber: '#C97A1A',
    amberLight: '#FBEEDD',
    paper: '#FAF6F4',
    surface: '#FFFFFF',
    border: '#EBE0DD',
    ink: '#241313',
    inkMuted: '#6B5A58',
    inkFaint: '#A6928F',
    success: '#0E7C7B',
    danger: '#B3122A',
    warning: '#C97A1A',
  },
  dark: {
    crimson: '#E61E3C', // Brighter red for dark mode
    crimsonDark: '#B3122A',
    crimsonLight: '#3A1414',
    teal: '#14B8B6',
    tealLight: '#0A2E2D',
    amber: '#FFA439',
    amberLight: '#2D1F0E',
    paper: '#120A0A', // Very dark red-tinted black
    surface: '#1C1212',
    border: '#3B2828',
    ink: '#F5ECEB',
    inkMuted: '#BBA8A6',
    inkFaint: '#7A6462',
    success: '#14B8B6',
    danger: '#E61E3C',
    warning: '#FFA439',
  }
};

// Default export for backward compatibility where possible, but context should be used
export const defaultColors = colors.light;

export const gradients = {
  hero: ['#B3122A', '#7A0C1D'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xxl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
  eyebrow: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2 },
};

export const shadows = {
  light: {
    shadowColor: '#3A1414',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dark: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
};
