-- No catalogue/interaction data is deleted by this migration.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- RLS must reject still-unexpired JWTs once their session is revoked.
-- This narrowly scoped helper is outside the exposed API schema.
create or replace function private.has_active_session()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from auth.sessions s
    where s.user_id = (select auth.uid()) and s.id::text = (select auth.jwt()->>'session_id')
  );
$$;
revoke all on function private.has_active_session() from public, anon;
grant execute on function private.has_active_session() to authenticated;

create policy "require active swipe session" on public.swipes as restrictive for all to authenticated
using ((select private.has_active_session())) with check ((select private.has_active_session()));
create policy "require active favourite session" on public.favourites as restrictive for all to authenticated
using ((select private.has_active_session())) with check ((select private.has_active_session()));

alter table public.swipes add column request_id uuid;
create unique index swipes_user_request_idx on public.swipes(user_id,request_id) where request_id is not null;
create index swipes_user_created_idx on public.swipes(user_id,created_at desc);

create table public.beta_feedback (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check(category in ('idea','bug','restaurant','other')),
 message text not null check(length(btrim(message)) between 5 and 2000),
 created_at timestamptz not null default now()
);
alter table public.beta_feedback enable row level security;
revoke all on public.beta_feedback from public,anon,authenticated;
grant select,insert on public.beta_feedback to authenticated;
create index beta_feedback_user_created_idx on public.beta_feedback(user_id,created_at desc);
create policy "feedback belongs to author" on public.beta_feedback for select to authenticated
using (user_id=(select auth.uid()) and (select private.has_active_session()));
create policy "guests submit own feedback" on public.beta_feedback for insert to authenticated
with check (user_id=(select auth.uid()) and (select private.has_active_session()));

-- Trigger applies limits to RPC and direct Data API writes alike. Timestamp is
-- server-owned, and a per-user lock serializes concurrent quota checks.
create or replace function private.limit_interaction()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if auth.uid() is null or new.user_id <> auth.uid() or not private.has_active_session() then
   raise exception using errcode='42501',message='Active owner session required';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 new.created_at := clock_timestamp();
 if tg_table_name='swipes' and (
   (select count(*) from public.swipes where user_id=auth.uid() and created_at>now()-interval '1 minute')>=60
   or (select count(*) from public.swipes where user_id=auth.uid() and created_at>now()-interval '1 day')>=500
 ) then raise exception using errcode='P0001',message='Rate limit reached. Please try later.'; end if;
 if tg_table_name='beta_feedback' and (
   (select count(*) from public.beta_feedback where user_id=auth.uid() and created_at>now()-interval '1 day')>=5
 ) then raise exception using errcode='P0001',message='Feedback rate limit reached. Please try tomorrow.'; end if;
 return new;
end;
$$;
revoke all on function private.limit_interaction() from public,anon,authenticated;
create trigger limit_swipes before insert on public.swipes for each row execute function private.limit_interaction();
create trigger limit_feedback before insert on public.beta_feedback for each row execute function private.limit_interaction();

-- Optional UUID keeps older two-argument clients working, while upgraded
-- clients can retry a timed-out operation without duplicating it.
drop function public.record_swipe(uuid,text);
create function public.record_swipe(p_restaurant_id uuid,p_decision text,p_request_id uuid default null)
returns table(swipe_id uuid,is_favourite boolean)
language plpgsql security invoker set search_path='' as $$
declare v_user uuid:=auth.uid(); v_id uuid; v_existing public.swipes;
begin
 if v_user is null or not private.has_active_session() then
  raise exception using errcode='28000',message='Active session required'; end if;
 if p_restaurant_id is null or p_decision is null or p_decision not in ('like','skip') then
  raise exception using errcode='22023',message='Invalid swipe'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 if p_request_id is not null then
  select * into v_existing from public.swipes where user_id=v_user and request_id=p_request_id;
  if found then
   if v_existing.restaurant_id<>p_restaurant_id or v_existing.decision<>p_decision then
    raise exception using errcode='22023',message='Request identifier already used'; end if;
   return query select v_existing.id,exists(select 1 from public.favourites where user_id=v_user and restaurant_id=p_restaurant_id);
   return;
  end if;
 end if;
 if not exists(select 1 from public.restaurants where id=p_restaurant_id) then
  raise exception using errcode='23503',message='Restaurant unavailable'; end if;
 insert into public.swipes(user_id,restaurant_id,decision,request_id)
 values(v_user,p_restaurant_id,p_decision,p_request_id) returning id into v_id;
 if p_decision='like' then
  insert into public.favourites(user_id,restaurant_id) values(v_user,p_restaurant_id) on conflict do nothing;
 else delete from public.favourites where user_id=v_user and restaurant_id=p_restaurant_id;
 end if;
 return query select v_id,p_decision='like';
end;
$$;
revoke all on function public.record_swipe(uuid,text,uuid) from public,anon;
grant execute on function public.record_swipe(uuid,text,uuid) to authenticated;

create function public.export_my_data() returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
 if not private.has_active_session() then raise exception using errcode='28000',message='Active session required'; end if;
 return jsonb_build_object('exported_at',now(),'user_id',auth.uid(),
  'swipes',coalesce((select jsonb_agg(s order by s.created_at) from public.swipes s where user_id=auth.uid()),'[]'::jsonb),
  'favourites',coalesce((select jsonb_agg(f order by f.created_at) from public.favourites f where user_id=auth.uid()),'[]'::jsonb),
  'feedback',coalesce((select jsonb_agg(b order by b.created_at) from public.beta_feedback b where user_id=auth.uid()),'[]'::jsonb));
end;
$$;
revoke all on function public.export_my_data() from public,anon;
grant execute on function public.export_my_data() to authenticated;

alter table public.restaurants add column is_published boolean not null default true,
 add column image_credit text,add column image_license_url text;
alter table public.restaurants add constraint licensed_photo_required check (
 image_url is null or (image_url like 'https://%' and length(btrim(image_credit))>0 and image_license_url like 'https://%')
);
-- NOT NULL checks must be explicit: SQL CHECK otherwise accepts NULL.
alter table public.restaurants add constraint photo_provenance_not_null check (
 image_url is null or (image_credit is not null and image_license_url is not null)
);
drop policy "catalogue is readable by visitors" on public.restaurants;
create policy "catalogue is readable by visitors" on public.restaurants for select to anon,authenticated using(is_published);
