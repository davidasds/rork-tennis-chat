export const SURFACES = [
  'Hard Court',
  'Clay Court',
  'Grass Court',
  'Indoor Hard',
  'Indoor Clay',
] as const;

export const AGE_GROUPS = [
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'Open',
  '25+',
  '35+',
  '45+',
  '55+',
  '65+',
] as const;

export const SKILL_LEVELS = [
  'Beginner (2.5-3.0)',
  'Intermediate (3.5-4.0)',
  'Advanced (4.5-5.0)',
  'Expert (5.5+)',
  'UTR 1-4',
  'UTR 5-8',
  'UTR 9-12',
  'UTR 13+',
] as const;

export const AVAILABILITY = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
] as const;

export const COLORS = {
  primary: '#C6FF00',
  primaryDark: '#B8E92D',
  secondary: '#2E7D32',
  secondaryLight: '#4CAF50',
  accent: '#FFD700',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  error: '#F44336',
  success: '#4CAF50',
  border: '#E0E0E0',
} as const;