export const BRAND_COLORS = {
  blueFrom: '#5CB3FF',
  blueTo: '#2196F3',
  yellow: '#FFD700',
  yellowSoft: '#FFE25C',
  yellowPress: '#F5C400',
  cream: '#FFF9C4',
  ink: '#1A2B4A',
  text: '#FFFFFF',
  cardSolid: '#FFFFFF',
  danger: '#FF5252',
  success: '#69F0AE',
  lightBlueAccent: '#B3E0FF',
} as const

export const CONFETTI_COLORS: readonly string[] = [
  BRAND_COLORS.yellow,
  BRAND_COLORS.cream,
  BRAND_COLORS.text,
  BRAND_COLORS.lightBlueAccent,
] as const
