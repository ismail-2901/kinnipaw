# Responsive Layout Specification — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation
> 
> Note: Stub — layout specifications to be defined during M1 UI work.

This document establishes the responsive design standards, layout breakpoints, viewport targets, and state behaviors for KINNIPAW across all supported device form factors, in accordance with AGENTS.md §7.

---

## 1. Breakpoint System

KINNIPAW follows a strict mobile-first responsive methodology utilizing standard Tailwind CSS breakpoints:

| Breakpoint | Minimum Width | Typical Target Devices | Layout Behavior |
|---|---|---|---|
| **Base (Mobile)** | `< 640px` | Small to large smartphones (360px – 430px) | Single column, fixed bottom tab navigation, edge-to-edge cards |
| `sm` | `640px` | Large phablets, small landscape devices | Single column with comfortable margins, inline actions |
| `md` | `768px` | Tablets (portrait), iPad Mini | 2-column grid, persistent compact sidebar option |
| `lg` | `1024px` | Tablets (landscape), small laptops | Full left sidebar navigation, 2-to-3 column grids |
| `xl` | `1280px` | Standard desktops, large laptops | 3-column layout: Left navigation, central feed (max 720px), right contextual rail |
| `2xl` | `1536px` | Large high-resolution monitors | Centered layout, max content width bounded to 1320px |

---

## 2. Target Form Factors (AGENTS.md §7)

All responsive layouts must be explicitly tested across these 4 primary form factor targets:

### 2.1 Small Phones (360px width)
- **Representative devices:** Budget Android smartphones (e.g. Samsung Galaxy A series, Xiaomi Redmi).
- **Layout rules:**
  - Content padding: 12px horizontal.
  - Buttons and interactive touch targets: 44px minimum touch height.
  - Form inputs: 100% full width, stacked labels.
  - Bangla typography: Extra line-height allowance to prevent truncation of diacritics and conjuncts.
  - Modal sheets: Bottom sheet modal replacing center dialogs.

### 2.2 Large Phones (390px – 430px width)
- **Representative devices:** Modern flagships (iPhone 14/15/16 Pro, Google Pixel, Samsung Galaxy S series).
- **Layout rules:**
  - Standard 16px screen padding.
  - Fixed bottom navigation bar with 5 primary destinations (Home, Explore, Create, Rescue, Profile).
  - Floating action buttons positioned clear of OS home indicators and safe area insets.

### 2.3 Tablets (768px – 1024px width)
- **Representative devices:** iPad 10th Gen, iPad Air, Android tablets.
- **Layout rules:**
  - Feed and listing displays transition into a dual-column card grid.
  - Modals render as centered overlay dialogs with backdrop blur.
  - Support both portrait and landscape orientations without breaking layout constraints.

### 2.4 Desktop (1280px+ width)
- **Representative devices:** Laptops, desktop monitors.
- **Layout rules:**
  - Persistent left sidebar navigation (Home, Explore, Adoption, Lost & Found, Rescue, My Animals, Messages, Profile).
  - Center column: Main feed / listing content constrained to 640px – 720px for optimal reading line length.
  - Right rail: Contextual information (nearby urgent rescue alerts, pending adoption applications, community events).
  - Overall container width capped at 1200px – 1320px to prevent excessive horizontal stretching.

---

## 3. Mandatory Responsive States

Every screen and functional view must provide explicit implementations for the following 5 states:

```
[Screen / Component]
  ├── 1. Loading State       → Animated skeleton placeholders matching layout geometry
  ├── 2. Empty State         → Friendly illustration/icon, clear explanation, primary call to action
  ├── 3. Error State         → Clear error message, trace ID, and actionable retry button
  ├── 4. Success State       → Visual confirmation banner or toast with next-step navigation
  └── 5. Permission Denied   → Explanation of access boundary with login or role upgrade prompt
```

---

## 4. Bilingual and Text Expansion Considerations

- **Bangla Text Expansion:** Bengali text is typically 15% to 25% longer than equivalent English copy. All card titles, buttons, and navigation labels must allow for multi-line wrapping or flex-wrap without clipping text.
- **Line Heights:** Set minimum line height to `1.4` to `1.5` for Bengali scripts to preserve upper and lower vowel markers (kar and jofola).
- **Ellipsis Handling:** Prevent truncation on critical data points (such as emergency rescue status, animal breed, and location names).
