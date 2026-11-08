export const APP_CONFIG = {
  name: 'KINNIPAW',
  tagline: 'One Platform. Every Animal. One Connected Ecosystem.',
  locales: ['en', 'bn'] as const,
  defaultLocale: 'en' as const,
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  species: {
    defaultMVP: ['dog', 'cat', 'bird', 'rabbit', 'small_mammal'] as const,
  },
} as const;

export type AppLocale = (typeof APP_CONFIG.locales)[number];
