# SheHungry — Master Project Source

Updated: 2026-09-29
Status: Pre-coding blueprint

## Product principle
SheHungry answers one question quickly: **What should I eat nearby?**

The first application stays deliberately simple:
**Open → location/filter → restaurant card → swipe left/right → next restaurant.**

Future features must not make the MVP architecture or interface complicated.

## Shared web/mobile product rule
Web and mobile are the same SheHungry product. They share visual identity, business rules, types, services, reusable components, and reusable functions wherever practical. Platform-specific code exists only when interaction/platform APIs require it, such as mouse/pointer dragging versus touch gestures.

## Design system
Food photography is the visual hero. UI chrome stays minimal.

Color tokens:
- brand/coral: #FF5A5F
- accent/orange: #FF8A3D
- positive/green: #2FBF71
- background/warm: #FFF9F5
- surface: #FFFFFF
- text: #1F1F1F
- muted: #6F6F6F

Theme modules:
- colors
- typography
- spacing
- radius
- shadows
- motion
- breakpoints/responsive sizing

Use tokens instead of repeated hard-coded visual values.

## MVP use cases
1. First-time guest opens SheHungry.
2. User allows or denies location permission.
3. User sets/changes simple discovery filters.
4. App loads a buffered deck of nearby restaurants.
5. User swipes left to skip.
6. User swipes right to like/save intent.
7. A short/unfinished swipe snaps back.
8. User opens restaurant details.
9. User saves/views favourites.
10. User signs in when persistence/free-limit rules require it.
11. App handles no nearby results or exhausted deck.
12. App handles network/provider/auth errors without freezing discovery.

Each use case should map user action → app behavior → next state.

## Swipe engine
- Web: click/hold/drag/release.
- Mobile/tablet: touch drag/release.
- Card follows input and rotates slightly with horizontal displacement.
- Below threshold: snap to center.
- Left threshold: skip once.
- Right threshold: like once.
- Preload next cards; never make an external API request after every swipe.
- UI advances immediately; persistence may finish asynchronously.
- Avoid duplicate restaurants within the intended discovery session.

## Reusable components
Core boundaries:
- AppShell
- SwipeDeck
- SwipeCard
- RestaurantCard
- RestaurantImage
- RestaurantMeta
- CuisineTags
- DistanceTravelTime
- SwipeFeedback
- SwipeActions
- FilterBar / FilterSheet
- FavouriteButton
- EmptyDeck
- LoadingDeck
- ErrorState

SwipeDeck owns deck ordering/advancement. SwipeCard owns gestures/animation. RestaurantCard owns presentation. Presentational components do not call external APIs directly.

## Reusable functions/services
Restaurant domain:
- discoverRestaurants(criteria)
- getRestaurant(id)
- refreshRestaurantCache(...)
- mapProviderRestaurant(raw)
- getRestaurantPhoto(reference)

Swipe domain:
- resolveSwipe(dx, threshold)
- recordSwipe(restaurantId, direction)
- removeSeenRestaurants(restaurants, seenIds)
- buildCardBuffer(restaurants)

Favourites:
- listFavourites()
- addFavourite(restaurantId)
- removeFavourite(restaurantId)

Location/filtering:
- requestLocationPermission()
- getCurrentLocation()
- normalizeDiscoveryFilters()

Auth:
- signInWithGoogle()
- signInWithApple()
- signOut()
- getSession()

Names may evolve, but responsibilities stay separated.

## Frontend structure
Target direction: React Native + Expo + TypeScript, sharing logic/components across iOS, Android and web.

src/
  app/
  components/
    ui/
    swipe/
    restaurant/
    navigation/
    feedback/
  features/
    discovery/
    favourites/
    auth/
    location/
    filters/
  hooks/
  services/
    restaurants/
    supabase/
    auth/
    location/
  state/
  theme/
  types/
  utils/
  constants/
  assets/
    fonts/
    images/
    icons/

supabase/
  migrations/
  functions/

docs/

Rules: screens compose features/components; domain behavior lives in features; external systems live behind services; types are explicit; avoid duplicated web/mobile business logic.

## Backend/data
Supabase responsibilities: Postgres, Auth, RLS, restaurant cache, favourites, swipe history, and server-side functions where secrets are required.

MVP logical data:
- users: Supabase Auth
- restaurants: normalized cached provider data
- favourites: user ↔ restaurant
- swipes: user/session + restaurant + direction + timestamp

Guest browsing is supported. Exact free-swipe limits remain configurable rather than scattered as hard-coded UI values.

## Restaurant API/cost rules
Google Places is a provider, not the application's live database.
- Never call it after every swipe.
- Fetch discovery data in batches.
- Cache/normalize reusable data where provider terms permit.
- Request only fields needed for the current use case.
- Keep billing-sensitive/secret logic behind appropriate service/server boundaries.
- Separate photo loading from core restaurant metadata.
- Exact TTLs, batch sizes, field masks, quotas and pricing assumptions must be checked against current provider terms when implemented.

## API lifecycle
No arbitrary permanently open external API connections are required for MVP.
- Supabase app session/client can be long-lived.
- Restaurant discovery is request-based and batched.
- Realtime is not required for MVP.
- Future Group Mode may add Supabase Realtime behind its own feature boundary.
- Stripe/webhooks are future server-side concerns.

## Security
- Never ship Supabase service-role keys to clients.
- Never expose server-only provider secrets in web/mobile bundles.
- Separate client-safe and server-only environment configuration.
- RLS protects user-owned favourites/swipe data.
- Do not trust client-provided user IDs.
- Validate server inputs.
- Future paid boost ranking must be server-controlled.

## State rule
Keep state local by default. Shared state is reserved for cross-screen concerns such as session, location, filters, discovery session/deck, and favourites cache. Do not add a large global-state system unless the implementation actually needs it.

## Responsive rule
Mobile is touch-first; desktop web uses pointer/mouse dragging; tablet adapts sizing. The interaction meaning and business logic remain shared.

## Error states
Design explicit states for location denied/unavailable, empty nearby results, provider failure, missing images, slow network, low deck buffer, auth cancellation, favourite persistence failure, and exhausted results.

## Coding rules
- TypeScript strict.
- Small focused components/functions.
- Prefer composition.
- One responsibility per service/module.
- No API calls inside presentational components.
- No duplicated business rules across screens.
- Use theme tokens instead of magic design values.
- Comments explain why, not obvious syntax.
- Future features must not prematurely complicate MVP modules.

## Acceptance criteria
- Pointer drag works on web.
- Touch swipe works on touch devices.
- Under-threshold card returns cleanly.
- Left/right action fires once.
- Buffered next card avoids visible per-swipe network waiting under normal conditions.
- Seen restaurants do not repeat within the intended session.
- Location denial and API failure have usable states.
- Auth cancellation is safe.
- Favourites respect authenticated ownership.
- Layout works across mobile/tablet/desktop.
- Server secrets are absent from client bundles.

## Future extension boundaries
V2: restaurant boosts + Stripe/webhooks.
V3: Group Mode, join code, multi-user swiping, vote aggregation; realtime only if useful.
Later: call/reservation/delivery links and richer food-first vertical discovery.

## Source-of-truth rule
This file is the compact master context for SheHungry. Detailed docs can expand sections. When implementation changes an agreed architectural/product decision, update this source and the relevant repository documentation with the code change.
