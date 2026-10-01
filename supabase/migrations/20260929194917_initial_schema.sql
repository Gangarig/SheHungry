-- SheHungry MVP: restaurant catalog and per-user preference history.
create extension if not exists pgcrypto;

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_place_id text not null,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  cuisine_types text[] not null default '{}',
  image_url text,
  rating numeric(2,1),
  price_level smallint,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_place_id)
);

create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  decision text not null check (decision in ('skip', 'like')),
  created_at timestamptz not null default now()
);
create index swipes_user_restaurant_idx on public.swipes (user_id, restaurant_id, created_at desc);

create table public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, restaurant_id)
);

alter table public.restaurants enable row level security;
alter table public.swipes enable row level security;
alter table public.favourites enable row level security;
create policy "restaurant catalog is public" on public.restaurants for select using (true);
create policy "users own swipes" on public.swipes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own favourites" on public.favourites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
