# SheHungry — API, Provider & Cost Blueprint

## Objective
Swiping must never mean one paid provider call per card.

## MVP systems
Supabase for app data/auth/RLS. Google Places is the initial restaurant provider. Identity providers are mediated by Supabase Auth. A routing provider is introduced only if true travel-time filtering is part of the implemented scope. Stripe is later.

## Provider boundary
Components consume SheHungry Restaurant objects, not Google payloads. Central adapter/server logic requests only needed fields, normalizes responses and makes provider replacement possible.

## Request triggers
Provider discovery may happen on initial discovery, meaningful location/filter change, or genuine buffer refill. A left/right swipe itself does not call Places.

## Batch/buffer
Fetch candidate batches; client keeps a small configurable upcoming-card buffer. Refill before exhaustion. Exact values are tuning constants established through testing, not architecture assumptions.

## Cost controls
- request only fields displayed/needed
- centralize calls
- debounce meaningful criteria changes
- deduplicate equivalent concurrent requests
- prevent render-driven refetch
- validate and rate-limit public backend operations
- monitor provider request counts/errors
- set provider-side quotas/budget alerts where available
- cache/reuse only what current provider terms permit

## Provider data policy
Before implementation, verify the current Google Maps Platform/Places terms for what may be stored, for how long, attribution/display requirements and photo handling. Do not assume all provider content can be copied permanently into Supabase. Stable provider identifiers and SheHungry-owned data should be treated separately from restricted provider content.

## Images
Load only current/next card images at useful sizes. Do not bulk-download a city’s restaurant photos. Follow provider photo/attribution rules.

## Travel time
Straight-line distance is cheap and can be calculated locally/server-side. Walking/cycling/driving minutes require route/travel-time data. If no routing provider is active, UI must say distance/radius rather than claiming travel minutes.

## Failure
Use permissible cached/known candidates when possible. Otherwise show bounded retry/empty state. Never create automatic retry storms.

## Application operations
- discoverRestaurants(criteria)
- getRestaurant(id)
- recordSwipe(restaurantId, direction)
- saveFavourite(restaurantId)
- removeFavourite(restaurantId)
- getTravelEstimates(...) only behind RoutingProvider

## Future
Billing, restaurant management, reservations and delivery each get separate adapters/modules. None belongs inside swipe gesture code.