# Mobile Specification — KINNIPAW

## Stack

React Native + Expo + Expo Router, TypeScript, shared contracts/API client, shared design tokens, platform-native UI. Do not import web DOM components into native screens.

## Navigation

Tabs: Home, Explore, Create, Rescue, Profile. Secondary routes: Adoption, Lost & Found, My Animals, Messages, Notifications, Settings, pet detail, application detail and rescue detail.

## Authentication

Use Supabase Auth with secure native session storage. Handle refresh/session expiry, deep-link redirects, sign-out, account deletion and device revocation. Never store secrets in `EXPO_PUBLIC_*` variables.

## Native capabilities

- Camera and photo picker with user consent.
- Push notification permission requested contextually, not at first launch without explanation.
- Deep links for animal profiles, listings, rescue requests and messages.
- Secure storage for session data.
- Share sheet where useful.
- Location only after explicit user action; no continuous background tracking in MVP.

## Offline and low-connectivity

- Cache safe public/read-only content.
- Show connectivity state and retry controls.
- Avoid queuing sensitive state transitions without conflict handling.
- Draft post/report forms locally only with clear privacy and expiry behaviour.

## Mobile quality

Test small Android devices, current iPhone sizes, notched screens, keyboard overlap, image upload failures, slow networks, permission denial, accessibility labels and font scaling.

## Release

EAS Build may have free quotas but quotas/terms change. Google Play and Apple store accounts and review requirements are separate from build cost. Do not claim native store distribution is free.
