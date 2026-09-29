# SheHungry — Technical Specification

## Stack
- TypeScript strict
- React Native + Expo
- Expo Router
- React Native Web
- Supabase: Postgres, Auth, RLS, backend capabilities
- Google Places through adapter/backend boundary
- gesture/animation library chosen during implementation spike based on current Expo compatibility
- Stripe later only

Lock exact package versions when implementation begins.

## Repository
```text
SheHungry/
├── app/                         # routes/composition only
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── discover.tsx
│   ├── favourites.tsx
│   ├── restaurant/[id].tsx
│   └── auth/sign-in.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── swipe/
│   ├── features/
│   │   ├── discovery/
│   │   ├── favourites/
│   │   └── auth/
│   ├── services/
│   │   ├── supabase/
│   │   ├── places/
│   │   └── routing/
│   ├── hooks/
│   ├── lib/
│   ├── theme/
│   ├── types/
│   └── constants/
├── assets/{fonts,icons,images}/
├── supabase/{migrations,functions}/
├── docs/
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

## Responsibilities
Routes compose features. UI primitives contain no business logic. SwipeCard renders/animates one normalized Restaurant. SwipeDeck owns the local stack. Discovery feature owns criteria/refill. Provider adapters own external response conversion. Database access is behind small repository/service functions.

## Core domain types
Restaurant, DiscoveryCriteria, SwipeDirection, SwipeDecision, Favourite, LocationPoint, DistanceInfo and optionally TravelEstimate.

## MVP hooks
- useDiscovery
- useSwipeDeck
- useFavourites
- useAuth
- useLocation

Do not turn every function into a hook.

## Core functions
Pure/testable examples:
- normalizeRestaurant(providerResult)
- shouldCommitSwipe(displacement, velocity, config)
- applySwipe(deck, restaurantId, direction)
- dedupeCandidates(existingIds, candidates)
- buildDiscoveryCriteria(filters, location)
- shouldRefillDeck(deckLength, threshold)

Integration functions:
- discoverRestaurants(criteria)
- recordSwipe(...)
- saveFavourite(...)
- removeFavourite(...)
- getRestaurant(...)
- getTravelEstimates(...) only when routing exists

## State
Local/feature state first. No global state library until a concrete cross-feature problem justifies it.

## Configuration
Centralize swipe thresholds, refill thresholds, batch sizes, feature flags and API-related limits. No magic values scattered in components.

## Quality gates
Every commit intended for main should pass typecheck, lint and relevant tests. No any without justification. No secrets in repo. Database changes are migrations.

## Testing
Unit: swipe decision, deck reducer, dedupe, normalization.
Integration: repositories/provider adapters, RLS.
Component: SwipeCard/Deck semantics and buttons.
E2E/manual: iPhone touch + desktop pointer core journey.

## Observability
Record coarse technical events/errors and provider request counts. Do not create unnecessary precise-location analytics.

## Documentation rule
When an architectural decision changes, update the relevant /docs file in the same work unit.