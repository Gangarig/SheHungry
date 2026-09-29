# SheHungry — System Architecture

## Goals
Simple MVP, shared web/mobile code, instant swipe feel, controlled provider costs, secure secrets, replaceable integrations.

## System
Expo React Native app (iOS + web)
→ feature hooks/domain services
→ Supabase Auth/Postgres/RLS
→ controlled server/provider boundary
→ Google Places initially
→ optional routing provider when true travel-time filtering is implemented

Swipe UI never talks directly to Places.

## Layers
### Presentation
Routes, reusable UI, SwipeCard/SwipeDeck, filters, states. No provider-specific objects.

### Feature/domain
Discovery criteria, deck progression, favourites and semantic swipe decisions. Pure logic where possible.

### Data/services
Supabase repositories, Places adapter, location/routing adapter. Convert external data into stable SheHungry domain types.

### Backend boundary
Operations needing private credentials, central rate control or provider aggregation run server-side. Never ship service-role/private provider credentials to clients.

## Discovery flow
1. Resolve location/permission and filters.
2. Build canonical DiscoveryCriteria.
3. Query cached/known candidate records.
4. Fetch missing/current provider data through controlled integration when required.
5. Normalize to Restaurant domain records.
6. Exclude current-session/user swiped candidates as appropriate.
7. Return a batch to the client.
8. Client preloads only the next small set of images/cards.
9. Refill before buffer exhaustion.

## Swipe flow
Gesture is local and immediate → semantic LEFT/RIGHT decision → animate out → advance preloaded card → persist/log asynchronously. Persistence failure cannot freeze the gesture.

## Location/travel architecture
Keep three concepts separate:
- coordinates / area
- straight-line distance
- actual route/travel duration

If MVP shows true walking/cycling/driving minutes, use an appropriate routing/travel-time service through a RoutingProvider interface. If routing is not yet implemented, display honest distance/radius information instead.

## API boundaries
MVP: Supabase, Google Places, identity providers through Supabase. Routing is optional depending on travel-time scope. Stripe is later.

## Security/privacy
- RLS on user-owned rows
- private credentials server-side
- validate/rate-limit callable operations
- restaurant cache read-only to normal clients
- do not persist exact location history without a product need
- minimum data collection

## Reliability
Cached candidates may keep discovery useful during provider errors where provider terms allow. Empty/error states stop retry loops. External calls have timeouts, bounded retry and observability.

## Performance
No provider request per swipe. Batch discovery, small deck buffer, image prefetch, optimistic gesture progression, deduplicated requests, stable domain models.

## Replaceability
Interfaces: RestaurantProvider, RoutingProvider, FavouritesRepository, SwipeRepository. Later billing/group/reservation modules attach outside SwipeCard.

## Environments
Use development and production configuration separately. Database schema is reproducible from migrations. Secrets remain outside Git.