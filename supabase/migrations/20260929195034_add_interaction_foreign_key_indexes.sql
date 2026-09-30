-- Keep restaurant foreign-key checks and editorial restaurant removals fast as
-- interaction history grows. The existing user-first indexes do not cover a
-- lookup whose leading column is restaurant_id.
create index if not exists swipes_restaurant_id_idx
  on public.swipes (restaurant_id);

create index if not exists favourites_restaurant_id_idx
  on public.favourites (restaurant_id);
