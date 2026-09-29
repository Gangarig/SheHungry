# SheHungry — Build Roadmap

## Rule
Build one vertical slice at a time. Do not add later-version features before the core swipe discovery loop is excellent.

## Phase 0 — Learn and validate
Before production implementation, be comfortable with:
- TypeScript/React component state and props
- Expo + Expo Router basics
- React Native layout and responsive web behavior
- pointer/touch gesture concepts and animation
- async requests, loading/error states and cancellation
- Supabase Auth/Postgres/RLS/migrations
- environment variables and client/server secrets
- Google Places request/response concepts, quotas and current data policies
- basic automated testing and Git branching/commits

Create tiny spikes if needed: one draggable card; one Supabase read with RLS; one Places request through the intended server boundary.

## Phase 1 — Skeleton + design tokens
Initialize Expo TypeScript project, router, lint/typecheck/tests, environment template, theme tokens and reusable UI primitives. Add representative fixture restaurants. No external restaurant API yet.

Exit: web + phone show the same responsive shell and fixture card.

## Phase 2 — Swipe vertical slice
Build SwipeCard, SwipeDeck and SwipeActions using fixtures. Tune pointer/touch feel, stack, thresholds, motion and accessibility.

Exit: 50+ fixture swipes can be performed smoothly with no double commits or broken layout.

## Phase 3 — Discovery data
Create Supabase migrations/RLS, restaurant domain model and provider adapter. Add controlled Google Places discovery and normalization. Add batching/cache behavior and image preloading.

Exit: real nearby restaurant candidates populate the same deck without changing SwipeCard.

## Phase 4 — Location + filters
Permission UX, location state, cuisine/price/open-now style lightweight filters where supported, and distance/travel presentation. Treat true travel-time routing as a separate routing capability; do not pretend straight-line distance is travel time.

Exit: changing meaningful criteria produces a coherent new candidate deck without request storms.

## Phase 5 — Auth + favourites
Guest-first browsing, Google/Apple sign-in through Supabase as configured, local guest likes, favourites persistence and RLS tests.

Exit: user can browse anonymously, sign in when needed, and see persistent favourites.

## Phase 6 — Product polish
Empty/error/loading states, analytics events without sensitive location history, performance profiling, accessibility, responsive desktop, real-device testing, icon/splash/metadata.

Exit: MVP release candidate.

## Phase 7 — Release
Environment separation, production Supabase, quotas/budgets, privacy/terms content, monitoring, deployment and small Vienna pilot.

## Later
Restaurant boosts + Stripe; group swipe rooms/matching; reservations/delivery/call actions; richer vertical discovery mode.

## MVP success criteria
- first useful card appears quickly on normal connection
- normal swiping never waits on one network call per card
- touch and mouse behavior feel equivalent
- no duplicate cards in active deck
- guest can reach discovery without account wall
- favourites are protected by RLS
- provider usage is observable and bounded
- core journey works on real iPhone and web