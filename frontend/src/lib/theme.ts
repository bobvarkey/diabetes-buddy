// Clinical Diabetes Buddy theme - calm medical aesthetic
export const colors = {
  // Base
  background: '#0a0e1a',
  card: '#111827',
  cardElevated: '#1a2332',
  border: '#1f2937',
  borderStrong: '#334155',

  // Text
  text: '#e5e7eb',
  textMuted: '#94a3b8',
  textDim: '#64748b',

  // Brand
  primary: '#38bdf8', // sky-400
  primarySoft: 'rgba(56, 189, 248, 0.12)',
  primaryFg: '#0c1220',

  // Status
  success: '#34d399',
  successSoft: 'rgba(52, 211, 153, 0.12)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251, 191, 36, 0.12)',
  destructive: '#f87171',
  destructiveSoft: 'rgba(248, 113, 113, 0.12)',
  info: '#a78bfa',
  infoSoft: 'rgba(167, 139, 250, 0.12)',

  // Plate sections
  plateVeggie: '#34d399',
  plateProtein: '#fb923c',
  plateGrain: '#fbbf24',
  plateDairy: '#a78bfa',

  // Hero gradient solid (RN doesn't easily do gradients without dep)
  heroBg: '#0e2a3f',
  heroBgAccent: '#1a4263',
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text },
  bodySm: { fontSize: 13, color: colors.text },
  caption: { fontSize: 11, color: colors.textMuted },
  micro: { fontSize: 10, color: colors.textMuted },
};
