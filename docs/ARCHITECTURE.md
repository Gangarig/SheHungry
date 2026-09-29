# SheHungry — System Architecture

## Architecture goals
- Keep MVP simple.
- Reuse components across web and touch devices.
- Keep external API usage controlled.
- Separate UI, domain logic, data access, and third-party integrations.
- Leave clean extension points for later features without implementing them early.

## High-level system

Client (Expo / React Native / Web)
→ application hooks/services
→ Supabase client + SheHungry backend functions
→ Supabase Postgres/Auth/Storage
→ controlled external providers such as Google Places

The swipe UI never calls Google Places directly for every swipe. It consumes normalized restaurant records supplied by the application data layer.

## Frontend responsibilities
- Rendering screens and reusable UI.
- Pointer/touch gesture handling.
- Maintaining the small in-memory swipe deck.
- Optimistic swipe transitions.
- Calling application hooks/services.
- Authentication UI when required.

## Backend/data responsibilities
- User authentication and identity.
- Restaurant cache.
- Favourites.
- Swipe history/log.
- Access control with RLS.
- Server-side external API calls where secrets or centralized caching are required.

## Core domains
### Discovery
Gets nearby restaurant candidates based on location/filter inputs and supplies normalized cards.

### Swipe
Processes left/right decisions independently from gesture rendering. UI animation and persistence are separate concerns.

### Favourites
Persists liked/saved restaurants for authenticated users. Guest state may remain local until authentication.

### Auth
Supabase Auth. Authentication should not block initial browsing.

### Restaurant provider
Adapter boundary around Google Places. Provider-specific response objects must not leak into UI components.

## Data flow for discovery
1. User grants location and chooses filters.
2. Discovery hook requests restaurant candidates.
3. Application checks reusable cached restaurant data.
4. Missing/stale discovery data is fetched through the provider integration.
5. Provider results are normalized and cached.
6. Client receives a small card batch.
7. Client preloads the next cards/images so swiping does not wait on a network request.

## Swipe flow
1. User drags current card.
2. Gesture updates only local animation state.
3. Crossing the release threshold determines LEFT or RIGHT.
4. Card animates off-screen immediately.
5. Next preloaded card becomes active.
6. Swipe decision is persisted asynchronously.
7. Failed persistence must not freeze the gesture animation; application state handles retry/error behavior.

## API boundaries
MVP integrations should remain deliberately few:
1. Supabase — database/auth/storage/backend functions.
2. Google Places — restaurant/place discovery and provider data.
3. Google/Apple identity through Supabase Auth when enabled.

Stripe is a reserved future integration, not an active MVP dependency.

## Security
- No service-role or private provider secret in client code.
- Supabase RLS on user-owned records.
- Users can only modify their own favourites/swipe records.
- Validate server-side inputs to provider/backend operations.
- Public restaurant cache is read-only from normal clients unless a controlled backend operation updates it.

## Performance rules
- Never make an external provider request per swipe.
- Fetch cards in batches.
- Keep a small preloaded card buffer.
- Prefetch upcoming images.
- Cache normalized restaurant/provider data.
- Keep gesture animation on the client and independent of network latency.

## Future extension boundaries
Future modules may add billing, restaurant accounts/boosts, group sessions, reservations, delivery, and richer feed modes. These must attach through services/domain modules rather than adding logic directly to SwipeCard.