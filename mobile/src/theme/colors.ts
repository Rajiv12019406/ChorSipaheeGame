export const colors = {
  bg: '#070B1A',
  bgElevated: '#121833',
  bgCard: '#1A2140',
  bgCardSoft: '#222B4D',

  gold: '#D4AF37',
  goldSoft: '#E8C96A',
  goldMuted: 'rgba(212, 175, 55, 0.25)',
  cream: '#F5E6C8',
  creamMuted: 'rgba(245, 230, 200, 0.7)',

  raja: '#3B82F6',
  mantri: '#9B59B6',
  sipahi: '#10B981',
  chor: '#DC2626',

  text: '#F8F5EE',
  textMuted: '#9AA3B8',
  textDark: '#0A0E1A',

  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  border: 'rgba(245, 230, 200, 0.12)',
  borderGold: 'rgba(212, 175, 55, 0.45)',

  overlay: 'rgba(7, 11, 26, 0.72)',
  glowGold: 'rgba(212, 175, 55, 0.35)',
  glowRaja: 'rgba(59, 130, 246, 0.35)',
} as const;

export type ColorToken = keyof typeof colors;

export const roleColors = {
  Raja: colors.raja,
  Mantri: colors.mantri,
  Sipahi: colors.sipahi,
  Chor: colors.chor,
} as const;
