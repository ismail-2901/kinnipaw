# Accessibility Specification — KINNIPAW

> Status: STUB | Last updated: 2026-11-08 | M0 Documentation Reconciliation
> 
> Note: Stub — full accessibility checklist to be defined during M1.

This document establishes the accessibility standards, interaction principles, assistive technology support guidelines, and testing criteria for KINNIPAW across web and mobile platforms.

---

## 1. Compliance Target: WCAG 2.1 Level AA

All user-facing interfaces on web (`apps/web`) and mobile (`apps/mobile`) must conform to the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**. Animal welfare and emergency rescue workflows must remain fully accessible to individuals with visual, motor, auditory, or cognitive disabilities.

---

## 2. Core Web Accessibility Requirements

### 2.1 Keyboard Navigation & Focus Handling
- **Full Keyboard Operability:** Every interactive element (buttons, links, form controls, tabs, menu items, modals) must be operable via keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, arrow keys, `Escape`).
- **Visible Focus Indicator:** High-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`) must be visible on all focused elements. Never remove focus outlines without an accessible replacement.
- **Logical Tab Order:** DOM order must strictly reflect visual layout order.
- **Skip Links:** Provide a "Skip to main content" link as the first focusable element on every page.
- **Modal Focus Trapping:** When dialogs or sheets open, keyboard focus must be trapped within the modal container. Pressing `Escape` must close the dialog and restore focus to the triggering element.

### 2.2 Semantic HTML & Screen Reader Support
- **Semantic Landmarks:** Use semantic elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`, `<article>`) rather than unsemantic `<div>` tags.
- **Accessible Names:** Icon-only buttons (such as like hearts, bookmark flags, close buttons) must have explicit `aria-label` or visually hidden screen reader text (`sr-only`).
- **Image Text Alternatives:** All user-submitted animal photos and post images must have informative `alt` text describing the animal's physical appearance. Purely decorative icons must carry `aria-hidden="true"`.
- **Form Association:** Every input, textarea, and select element must have a programmatic `<label>` with matching `for`/`id` association, along with `aria-describedby` for validation error messages.

### 2.3 Color and Contrast Standards
- **Minimum Contrast Ratios:**
  - Standard text (`< 18pt` or `< 14pt bold`): Minimum `4.5:1` contrast against its background.
  - Large text (`>= 18pt` or `>= 14pt bold`): Minimum `3.0:1` contrast against its background.
  - Interactive UI components & graphical borders: Minimum `3.0:1` contrast.
- **Non-Color Dependence:** Color must never be the sole indicator of state, urgency, or action. Emergency badges and status indicators must pair color with explicit icons and text labels (e.g. "Critical" + alert icon, not just a red dot).

### 2.4 Motion Sensitivity
- **Reduced Motion Support:** Respect user operating system preferences for reduced motion:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- Non-essential animations, parallax effects, and auto-playing carousels are disabled when reduced motion is requested.

---

## 3. Mobile Accessibility (React Native / Expo)

- **React Native Accessibility API:** Use native accessibility props across all components:
  - `accessible={true}`: Marks view as an accessible element.
  - `accessibilityLabel`: Provides localized screen reader text (in English or Bangla).
  - `accessibilityRole`: Declares semantic role (`button`, `header`, `image`, `link`, `alert`).
  - `accessibilityHint`: Explains the action outcome when not obvious.
  - `accessibilityState`: Communicates states such as `selected`, `disabled`, `expanded`.
- **Minimum Touch Target Size:** Interactive elements must have a touch target area of at least `44x44` points.
- **Dynamic Type & OS Font Scaling:** Text containers must support OS text scaling up to 200% without clipping, overlapping, or breaking touch interactions.

---

## 4. Bilingual Screen Reader Support

- **Language Attributes:** Web pages and components must set appropriate language tags (`lang="en"` or `lang="bn"`) to ensure screen readers switch to the proper pronunciation engine.
- **Bengali Pronunciation:** Ensure currency formatting (e.g. `৳` / BDT), dates, and phone numbers are structured to avoid fragmented screen-reader phonetic output.

---

## 5. Automated and Manual Verification Plan

| Test Type | Tool / Method | Frequency | Target |
|---|---|---|---|
| **Static Code Audit** | `eslint-plugin-jsx-a11y` | Every commit / PR | Zero a11y lint errors |
| **Automated E2E Audit** | `@axe-core/playwright` | CI E2E test runs | Zero critical or serious axe violations |
| **Screen Reader Testing** | NVDA / VoiceOver (web), TalkBack / VoiceOver (mobile) | Milestone gates (M4, M6, M9, M10) | Core P0 journeys fully operable |
| **Keyboard-Only Audit** | Manual Tab/Shift-Tab walkthrough | Pre-release | 100% interactive paths traversable |
