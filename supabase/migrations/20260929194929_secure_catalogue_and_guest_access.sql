-- SheHungry launch access model.
--
-- The restaurant catalogue is intentionally public. Interaction history is
-- private to the authenticated Supabase user, including an anonymous guest
-- created with auth.signInAnonymously().  Do not confuse that guest with the
-- unauthenticated `anon` Postgres role.

-- Keep all exposed tables protected by RLS, even though the first migration
-- also enabled it. These statements make the launch access model explicit.
alter table public.restaurants enable row level security;
alter table public.swipes enable row level security;
alter table public.favourites enable row level security;

-- Do not depend on the automatic privileges that older Supabase projects gave
-- every new public table. Grant the smallest useful surface deliberately.
revoke all on table public.restaurants from anon, authenticated;
revoke all on table public.swipes from anon, authenticated;
revoke all on table public.favourites from anon, authenticated;

grant select on table public.restaurants to anon, authenticated;
grant select, insert on table public.swipes to authenticated;
grant select, insert, delete on table public.favourites to authenticated;

-- Replace the broad policies created by the initial prototype with policies
-- that state the role and permitted operation explicitly.
drop policy if exists "restaurant catalog is public" on public.restaurants;
drop policy if exists "users own swipes" on public.swipes;
drop policy if exists "users own favourites" on public.favourites;
drop policy if exists "catalogue is readable by visitors" on public.restaurants;
drop policy if exists "users can read their own swipes" on public.swipes;
drop policy if exists "users can record their own swipes" on public.swipes;
drop policy if exists "users can read their own favourites" on public.favourites;
drop policy if exists "users can add their own favourites" on public.favourites;
drop policy if exists "users can remove their own favourites" on public.favourites;

create policy "catalogue is readable by visitors"
  on public.restaurants
  for select
  to anon, authenticated
  using (true);

create policy "users can read their own swipes"
  on public.swipes
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

create policy "users can record their own swipes"
  on public.swipes
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

create policy "users can read their own favourites"
  on public.favourites
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

create policy "users can add their own favourites"
  on public.favourites
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

create policy "users can remove their own favourites"
  on public.favourites
  for delete
  to authenticated
  using (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

-- Save an immutable swipe event and the current saved-place state as one
-- transaction. SECURITY INVOKER means this remains subject to the grants and
-- RLS rules above; it never accepts a user ID from the client.
create or replace function public.record_swipe(
  p_restaurant_id uuid,
  p_decision text
)
returns table (
  swipe_id uuid,
  is_favourite boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_swipe_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'authentication is required to record a swipe';
  end if;

  if p_restaurant_id is null then
    raise exception using
      errcode = '22004',
      message = 'restaurant_id is required';
  end if;

  if p_decision is null or p_decision not in ('like', 'skip') then
    raise exception using
      errcode = '22023',
      message = 'decision must be like or skip';
  end if;

  if not exists (
    select 1
    from public.restaurants
    where id = p_restaurant_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'restaurant does not exist';
  end if;

  insert into public.swipes (user_id, restaurant_id, decision)
  values (v_user_id, p_restaurant_id, p_decision)
  returning id into v_swipe_id;

  if p_decision = 'like' then
    -- Deliberately DO NOTHING on conflict: this needs no UPDATE privilege and
    -- keeps favourites as a set while preserving every swipe in its history.
    insert into public.favourites (user_id, restaurant_id)
    values (v_user_id, p_restaurant_id)
    on conflict (user_id, restaurant_id) do nothing;
  else
    -- A later skip removes a previous saved state while retaining both events.
    delete from public.favourites
    where user_id = v_user_id
      and restaurant_id = p_restaurant_id;
  end if;

  return query select v_swipe_id, p_decision = 'like';
end;
$$;

-- Functions in public otherwise receive EXECUTE from PUBLIC by default.
revoke execute on function public.record_swipe(uuid, text) from public;
revoke execute on function public.record_swipe(uuid, text) from anon;
revoke execute on function public.record_swipe(uuid, text) from authenticated;
grant execute on function public.record_swipe(uuid, text) to authenticated;
