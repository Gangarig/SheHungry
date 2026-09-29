# SheHungry — API & Cost-Control Specification

## Goal
The swipe experience must not translate into one paid external API request per card. External data is fetched in controlled batches and reused through caching.

## Active MVP external systems
### 1. Supabase
Used for:
- Postgres data.
- Authentication.
- favourites.
- swipe log/history.
- restaurant/provider cache.
- controlled backend operations where needed.

### 2. Google Places
Used as the initial external restaurant/place data provider.

Provider access must be wrapped behind a SheHungry service/adapter so the application is not structurally tied to Google response formats.

### 3. Google / Apple identity
Used through the authentication layer when social sign-in is enabled. Authentication is not required to begin browsing.

## Not active in MVP
Stripe is reserved for restaurant subscriptions/boosts in a later version.

## Request strategy
### Discovery request
A discovery request is based on a meaningful change such as:
- initial location/filter load,
- user changes travel/filter criteria,
- card buffer is genuinely running low and more candidates are required.

A swipe itself does **not** trigger a Google Places request.

## Client card buffer
The client should receive a batch of normalized restaurant cards and keep several upcoming cards ready. The exact batch/buffer sizes are implementation-tuning values and should be configurable constants, not embedded throughout components.

## Cache model
Cache normalized provider restaurant records in Supabase with:
- provider name,
- provider place ID,
- normalized restaurant fields,
- provider metadata required by the application,
- last refreshed timestamp.

Where provider terms permit caching of a field, reuse it until stale according to the configured policy. Provider-specific storage/refresh restrictions must be respected during implementation.

## Image strategy
- Do not download every possible restaurant image up front.
- Preload only the current/next small card set.
- Store provider references/metadata according to provider rules rather than blindly duplicating external images.
- Use image sizing appropriate to the displayed card.

## Rate/cost protection
- Centralize provider calls.
- Debounce/filter changes that could cause repeated discovery calls.
- Do not refetch because a component re-rendered.
- Deduplicate concurrent equivalent requests.
- Add server-side limits/validation to public callable endpoints.
- Log provider usage/error categories so unexpected request growth is visible.

## Failure behavior
If Google Places is temporarily unavailable but usable cached candidates exist, discovery should prefer the cache rather than breaking the swipe experience. If no candidates exist, show a clear retry/empty state rather than looping requests.

## API abstraction
Application-facing interface conceptually exposes operations such as:
- `discoverRestaurants(criteria)`
- `getRestaurant(id)`
- `recordSwipe(restaurantId, direction)`
- `saveFavourite(restaurantId)`
- `removeFavourite(restaurantId)`

These names describe application operations. Components should not know which provider/database calls implement them.

## Future integrations
Later integrations (Stripe, reservations, delivery providers) receive their own adapters/modules. They must not be placed inside swipe gesture components or the core discovery provider.