# SheHungry — Technical Specification

## Stack
- TypeScript with strict typing.
- React Native + Expo.
- Expo Router for route/file organization.
- React Native Web through Expo for web delivery.
- Supabase for Postgres, Auth, Storage, RLS and controlled backend operations.
- Google Places behind an integration/service boundary.
- Stripe reserved for later billing work.

Exact package versions should be locked when implementation starts rather than hard-coded into this planning document.

## Repository structure
```text
SheHungry/
├── app/                         # Expo Router route files only
│   ├── _layout.tsx
│   ├── index.tsx                # entry/discovery redirect or screen
│   ├── discover.tsx
│   ├── favourites.tsx
│   ├── restaurant/
│   │   └── [id].tsx
│   └── auth/
│       └── sign-in.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                  # Button, Chip, IconButton, Text, etc.
│   │   └── swipe/               # SwipeDeck, SwipeCard, SwipeActions
│   ├── features/
│   │   ├── discovery/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── favourites/
│   │   └── auth/
│   ├── hooks/                   # truly cross-feature hooks only
│   ├── services/
│   │   ├── supabase/
│   │   └── places/
│   ├── lib/                     # pure helpers/configuration
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   ├── types/                   # shared application types
│   └── constants/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── supabase/
│   ├── migrations/
│   └── functions/               # only when server-side functions are needed
│
├── docs/                        # project source-of-truth specifications
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

## Folder rules
- `app/` contains routing/screen composition, not business logic.
- Reusable primitive UI belongs in `src/components/ui`.
- Swipe-specific reusable UI belongs in `src/components/swipe`.
- Feature logic stays close to its feature under `src/features`.
- Cross-feature provider clients/adapters belong in `src/services`.
- Pure utilities with no React dependency belong in `src/lib`.
- Theme values are imported from `src/theme`; components do not invent colors/spacing.
- Fonts and static media live in `assets`.
- Database changes are migrations, not manual undocumented production edits.

## Component responsibilities
### SwipeCard
Presentation + pointer/touch gesture animation. Receives normalized restaurant data and emits a semantic swipe decision. It does not fetch restaurants and does not contain Supabase/Google logic.

### SwipeDeck
Owns the small visible/preloaded stack, advances cards, and requests another batch through discovery logic when the buffer becomes low.

### SwipeActions
Accessible button alternative for Skip/Like. It triggers the same semantic actions as gestures.

## Hook policy
Keep hooks few and feature-oriented. MVP target shape:
- `useDiscovery()` — candidate batches/loading/filter changes.
- `useSwipeDeck()` — local deck progression and swipe decisions.
- `useFavourites()` — persistent likes/favourites.
- `useAuth()` — session/sign-in state.
- `useLocation()` — permission/current coarse discovery location behavior.

Do not create a custom hook for every small operation. Pure functions remain plain functions.

## Service policy
- `places` adapter converts provider responses to SheHungry domain models.
- `supabase` client is initialized once and imported through one module.
- UI never imports provider SDK internals directly.
- Secrets are never committed.

## State policy
Prefer local component/feature state for MVP. Avoid introducing a large global state framework unless implementation demonstrates a real cross-feature need.

## Styling policy
- Theme tokens only for colors/spacing/radii/type scales.
- Responsive layout through shared layout primitives/helpers.
- Keep platform-specific code isolated and only where input/browser/native behavior genuinely differs.

## Testing priorities
1. Swipe threshold/decision logic.
2. Deck progression and no duplicate visible cards.
3. Discovery normalization/filter behavior.
4. Auth-gated favourites.
5. RLS/database access behavior.

## Code quality
- Strict TypeScript.
- Small components.
- Explicit domain types.
- No `any` unless documented and unavoidable at an integration boundary.
- Business rules must be testable without rendering UI.