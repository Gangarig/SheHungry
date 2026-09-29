# SheHungry — Database Blueprint

## Principles
Keep the MVP schema small. Supabase Auth owns identity. Application tables contain only data needed for discovery, swipes and favourites. All schema changes are migrations.

## Tables
### restaurants
Normalized application-facing restaurant record.
- id uuid primary key
- provider text
- provider_place_id text unique with provider
- name text
- latitude/longitude
- cuisine/category fields
- price_level nullable
- rating/rating_count nullable
- address/display metadata
- photo reference/metadata subject to provider rules
- provider_payload_version nullable
- refreshed_at timestamptz
- created_at/updated_at

### swipes
- id uuid
- user_id uuid nullable only if guest swipes are not persisted server-side
- restaurant_id uuid
- direction enum: left/right
- created_at
Authenticated users may only read/write their own records. Guest swipe history stays local for MVP unless a server-issued anonymous session is later justified.

### favourites
- user_id uuid
- restaurant_id uuid
- created_at
Composite unique(user_id, restaurant_id). User owns rows.

### profiles
Optional lightweight extension of auth.users only when application profile fields become necessary. Do not create fields merely because they might be useful later.

## Recommended indexes
- restaurants(provider, provider_place_id) unique
- restaurant geo lookup appropriate to the selected geospatial implementation
- swipes(user_id, created_at desc)
- swipes(user_id, restaurant_id)
- favourites(user_id, created_at desc)
- favourites(user_id, restaurant_id) unique

## RLS
- restaurants: normal clients can read approved cached records; writes happen through controlled backend/service paths.
- swipes: authenticated user can select/insert/delete only where auth.uid() = user_id.
- favourites: authenticated user can select/insert/delete only where auth.uid() = user_id.
- profiles, if added: auth.uid() = id.

## Data rules
- UI consumes a Restaurant domain model, never raw Google response objects.
- Provider refresh/caching must follow the current provider terms.
- Avoid storing exact user location as durable history in MVP. Location should be used for discovery and retained only when necessary.
- No payment/subscription tables until the monetization version is implemented.

## Migration order
1. enums/extensions needed for geo.
2. restaurants.
3. swipes.
4. favourites.
5. indexes.
6. RLS policies.
7. seed/dev fixtures.

## MVP acceptance
A fresh Supabase project can be reproduced entirely from committed migrations and has no undocumented dashboard-only schema changes.