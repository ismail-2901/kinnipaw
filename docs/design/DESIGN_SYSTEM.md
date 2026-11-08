# Design System Specification — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation
> 
> Note: Stub — full design system to be defined in M1 design phase.

This document outlines the foundation of the KINNIPAW design system. It establishes shared tokens, color palettes, typography scales, component library conventions, and platform-specific execution rules across Next.js (web) and React Native / Expo (mobile).

---

## 1. Design Principles

1. **Warm Editorial & Modern Consumer:** Calm, trustworthy, and emotionally engaging without feeling juvenile or toy-like. Avoid sterile, corporate dashboard aesthetics.
2. **Accessible by Default:** All text, interaction elements, and contrast levels comply with WCAG 2.1 AA standards. Color is never used as the sole indicator of status.
3. **Platform Integrity:** Web uses modern semantic DOM and Tailwind CSS; mobile uses native React Native views. Design tokens and business contracts are shared—DOM components are never shared with mobile.
4. **Bilingual Elegance:** Seamless visual and typographic balance between English and Bangla scripts across all screen densities.

---

## 2. Color Palette and Semantic Tokens

As established in ADR-020, KINNIPAW utilizes a nature-inspired palette centered around Forest Green and Sage Green:

### 2.1 Brand & Neutral Colors

| Token Name | Hex Value | Semantic Role | WCAG Contrast Target |
|---|---|---|---|
| **Primary (Forest Green)** | `#245B45` | Primary brand color, key action buttons, navigation active states | `>= 4.5:1` against Warm Ivory / White |
| **Supporting (Sage Green)** | `#66856C` | Secondary brand accents, badge backgrounds, supporting iconography | `>= 3:1` for large text/icons |
| **Warm Ivory** | `#FAF9F6` | Primary page background across web and mobile | Light neutral canvas |
| **Soft Terracotta** | `#D98769` | Attention grabber, secondary highlights, urgent tags, rescue accents | Accent role |
| **Deep Charcoal** | `#252A27` | Primary typography, dark surface backgrounds | `>= 7:1` against Warm Ivory |
| **Muted Slate** | `#6B7280` | Secondary typography, captions, metadata labels | `>= 4.5:1` against white backgrounds |
| **Soft Neutral** | `#E8E6E0` | Card borders, dividers, subtle input borders | Visual separation |
| **White** | `#FFFFFF` | Card surfaces, modal sheets, elevated containers | High-contrast container surface |

### 2.2 Semantic Status Colors

| Role | Hex Value | Usage Context |
|---|---|---|
| **Success** | `#1B7340` | Resolved rescue cases, approved adoptions, confirmed reunions |
| **Warning** | `#D97706` | Incomplete profiles, pending verification, expiring listings |
| **Destructive / Error** | `#DC2626` | Critical rescue urgency, failed validations, destructive modal actions |
| **Info / Discovery** | `#2563EB` | Informational announcements, guideline links, system notifications |

---

## 3. Typography Foundation

A unified bilingual typographic scale supporting both Latin and Bengali characters:

- **Latin Font Family:** Geist / Geist Sans (or system fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Bangla Font Family:** Noto Sans Bengali (or tested Bengali system font stack).
- **Font Scale (To be finalized in M1):**

| Style Name | Font Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| **Display Heading** | 32px (2rem) | 1.25 | Bold (700) | Landing headers, hero titles |
| **Heading 1** | 24px (1.5rem) | 1.3 | SemiBold (600) | Page titles, animal profile names |
| **Heading 2** | 20px (1.25rem) | 1.35 | SemiBold (600) | Section titles, card group headers |
| **Heading 3** | 18px (1.125rem) | 1.4 | Medium (500) | Modal headers, card titles |
| **Body Large** | 16px (1rem) | 1.5 | Regular (400) | Primary body text, article content |
| **Body Small** | 14px (0.875rem) | 1.45 | Regular (400) | Secondary descriptions, list items |
| **Caption / Meta** | 12px (0.75rem) | 1.4 | Medium (500) | Timestamps, badge labels, helper text |

---

## 4. Spacing and Sizing Scale

Built on a consistent 4px / 8px grid system:

| Token | Dimension | Use Case |
|---|---|---|
| `space-1` | 4px | Micro-gaps between icons and text badges |
| `space-2` | 8px | Button internal padding, badge padding, compact stack gap |
| `space-3` | 12px | Compact form input padding, list item gaps |
| `space-4` | 16px | Standard card padding, grid gutter, component spacing |
| `space-6` | 24px | Section padding, modal margins, desktop grid gap |
| `space-8` | 32px | Major section dividers, hero spacing |
| `space-12` | 48px | Page header spacing, desktop layout margins |

- **Corner Radii:**
  - `radius-sm`: 4px (tags, badges)
  - `radius-md`: 8px (form inputs, regular buttons)
  - `radius-lg`: 12px (cards, sheet modals)
  - `radius-full`: 9999px (avatars, pills)

---

## 5. Component Library Strategy

### 5.1 Web Application (`apps/web`)
- **Primitive Layer:** Radix UI primitives for unstyled, accessible UI mechanics (Dialog, Popover, Dropdown, Accordion, Tooltip).
- **Component System:** shadcn/ui patterns customized with KINNIPAW design tokens.
- **Styling Engine:** Tailwind CSS with semantic utility classes linked to CSS custom properties.

### 5.2 Mobile Application (`apps/mobile`)
- **Platform Components:** React Native core components (`View`, `Text`, `Pressable`, `Image`, `FlatList`).
- **Touch Targets:** Minimum 44x44px interactive hit regions on mobile.
- **Strict Rule:** Never share web DOM components into the mobile workspace. Share tokens, TypeScript types, and validation schemas only.

### 5.3 Shared Token Package (`packages/design-tokens`)
- Central repository for all design constants.
- Exports:
  - `tokens.json`: Raw design token dictionary.
  - `theme.css`: CSS custom properties for web Tailwind configuration.
  - `tokens.ts`: Strongly typed constants and theme object for React Native StyleSheet consumption.

---

## 6. Animation Guidelines

- **Web:** Powered by Motion (Framer Motion). Used sparingly for page transitions, accordion expands, and modal overlays.
- **Mobile:** React Native Reanimated utilized only where 60fps gesture handling requires it (e.g. swipeable cards, bottom sheet dragging).
- **Reduced Motion:** Animations must be fully disabled or degraded to simple opacity fades when `prefers-reduced-motion` is detected.
