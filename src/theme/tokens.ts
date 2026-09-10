/**
 * Raw Nocturne values for consumers that cannot take a className:
 * chart props, Progress.Bar colors, react-native-calendars `theme`, SVG fills.
 *
 * Mirrors src/global.css. .claude/rules/tokens.md is the source of truth for both.
 */
export const colors = {
  background: '#161826',
  foreground: '#e9e9ed',
  card: '#232532',
  primary: '#9184d9',
  primaryForeground: '#161826',
  secondary: '#a7a1db',
  muted: '#3f424d',
  mutedForeground: '#b2b6ca',
  subtle: '#9397ab',
  faint: '#75798c',
  line: 'rgba(233, 233, 237, 0.16)',
  track: '#3f424d',
  warning: '#dc932e',
  warningForeground: '#211a08',
  destructive: '#f97770',
  tagBg: '#423a6a',
  tagFg: '#f5f4ff',
  elevMd: '#595d6c',
  elevLg: '#9397ab',
} as const;

export const radius = { sm: 4, md: 8, lg: 14, pill: 999 } as const;

export const layout = {
  screenX: 18,
  screenTop: 58,
  screenBottom: 12,
  cardGap: 14,
  taskGap: 10,
} as const;

/** elev-sm is a HAIRLINE, not a shadow. See tokens.md gotcha #1. */
export const elevation = {
  sm: { borderWidth: 1, borderColor: colors.muted },
  md: {
    borderWidth: 1,
    borderColor: colors.elevMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 9,
    shadowOpacity: 0.55,
    elevation: 6,
  },
  lg: {
    borderWidth: 1,
    borderColor: colors.elevLg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 20,
    shadowOpacity: 0.65,
    elevation: 16,
  },
} as const;
