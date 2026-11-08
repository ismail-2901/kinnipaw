# UI/UX Specification — KINNIPAW

## Design direction

Warm editorial + modern consumer product. Premium, calm, trustworthy, emotionally engaging, not childish. Photography should feel authentic and respectful. Avoid generic dashboard aesthetics.

## Starting design tokens

| Token | Value | Use |
|---|---|---|
| Warm Ivory | `#FAF9F6` | Main background |
| Sage Green | `#66856C` | Primary brand/action |
| Soft Terracotta | `#D98769` | Accent/secondary action |
| Deep Charcoal | `#252A27` | Text |
| Soft Neutral | `#E8E6E0` | Borders/surfaces |
| White | `#FFFFFF` | Cards/surfaces |

Check WCAG contrast before finalizing foreground/background combinations. Do not use color alone to communicate status.

## Typography

- Latin: Geist / Geist Sans or an equivalent locally hosted, properly licensed family.
- Bangla: Noto Sans Bengali or a tested Bengali family.
- Define typography scale, line heights and fallback stacks.
- Verify Bengali conjuncts, vowel marks and mixed-script alignment on real devices.

## Desktop layout

- Left navigation: Home, Explore, Adoption, Lost & Found, Rescue, My Animals, Messages, Profile.
- Center: feed/listing/detail content.
- Right rail only where useful: nearby reports, rescue updates, community tips/events.
- Content max width target 1200–1320px; adapt to dense tables/admin pages.

## Mobile navigation

Five primary destinations: Home, Explore, Create, Rescue, Profile. Adoption and Lost & Found must remain readily discoverable (not buried several levels deep). Use a contextual quick action or Explore shortcuts.

## Core routes

Public: `/`, `/explore`, `/animals/[id]`, `/community`, `/adoption`, `/adoption/[id]`, `/lost-found`, `/lost-found/[id]`, `/rescue`, `/providers`, `/providers/[id]`, `/events`, `/guidelines`, `/privacy`, `/terms`.

Authenticated: `/feed`, `/my-animals`, `/my-animals/[id]`, `/my-animals/[id]/health`, `/my-animals/[id]/memories`, `/create`, `/saved`, `/my-applications`, `/my-listings`, `/my-reports`, `/my-rescue-requests`, `/messages`, `/notifications`, `/settings`.

Admin: `/admin`, `/admin/users`, `/admin/animals`, `/admin/posts`, `/admin/adoptions`, `/admin/lost-found`, `/admin/rescue`, `/admin/providers`, `/admin/reports`, `/admin/organizations`, `/admin/audit-logs`, `/admin/settings`.

## Responsive test widths

- 360px small phone.
- 390px modern phone.
- 768px tablet portrait.
- 1024px small laptop/tablet landscape.
- 1440px desktop.

Also test long Bangla text, mixed-language labels, large text settings, and landscape orientation.

## Interaction and quality requirements

- Touch target approximately 44px minimum where practical.
- Visible focus states and keyboard-operable menus/dialogs.
- Semantic headings, labels and landmarks.
- Text alternatives for pet images; decorative images hidden from screen readers.
- Reduced motion support.
- Skeleton/loading, empty, error, retry, success and permission-denied states.
- Image aspect-ratio consistency and optimized thumbnails.
- Optimistic updates only for reversible low-risk actions.
- Do not create fake counters, fake verification badges or non-functional controls.
- Provide safe meeting/scam guidance in adoption/rescue contexts.
