export const colors = {
  primary: {
    DEFAULT: '#245B45', // Forest Green (ADR-020)
    50: '#F0F6F3',
    100: '#E0EDE6',
    200: '#C2DCce',
    300: '#9BC4AE',
    400: '#6FA78A',
    500: '#4D8B6C',
    600: '#387357',
    700: '#245B45',
    800: '#1B4736',
    900: '#143629',
    950: '#0B2018',
  },
  secondary: {
    DEFAULT: '#66856C', // Sage Green (ADR-020)
    50: '#F4F7F5',
    100: '#E6ECE8',
    200: '#CCD8D0',
    300: '#ADC2B3',
    400: '#8DA895',
    500: '#66856C',
    600: '#526E57',
    700: '#3F5644',
    800: '#2E3E31',
    900: '#1F2B22',
  },
  surface: {
    ivory: '#FAF9F6', // Warm Ivory
    charcoal: '#252A27', // Deep Charcoal
    neutral: '#E8E6E0', // Soft Neutral
    terracotta: '#D98769', // Soft Terracotta
  },
  status: {
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',
  },
} as const;
