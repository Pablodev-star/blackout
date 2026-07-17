-- BLACKOUT backend schema: usernames, device telemetry, leaderboards and realtime rooms.
-- Idempotent: safe to run from the Supabase SQL editor more than once.

create extension if not exists pgcrypto;

create table if not exists public.players (
  device_id uuid primary key,
  name text not null unique check (char_length(name) between 2 and 16),
  name_normalized text generated always as (lower(name)) stored unique,
  device_info jsonb not null default '{}'::jsonb,
  last_ip inet,
  last_port integer,
  last_country text,
  last_region text,
  last_city text,
  last_language text,
  last_user_agent text,
  screen_w integer,
  screen_h integer,
  viewport_w integer,
  viewport_h integer,
  device_pixel_ratio numeric,
  cookie_enabled boolean,
  first_party_cookie_writeable boolean,
  cookie_string_present boolean,
  timezone text,
  platform text,
  connection_type text,
  effective_connection_type text,
  downlink_mbps numeric,
  rtt_ms integer,
  isp_asn text,
  isp_org text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.player_devices (
  id uuid primary key default gen_random_uuid(),
  player_device_id uuid not null references public.players(device_id) on delete cascade,
  device_info jsonb not null default '{}'::jsonb,
  ip inet,
  port integer,
  country text,
  region text,
  city text,
  user_agent text,
  screen_w integer,
  screen_h integer,
  viewport_w integer,
  viewport_h integer,
  device_pixel_ratio numeric,
  cookie_enabled boolean,
  first_party_cookie_writeable boolean,
  cookie_string_present boolean,
  timezone text,
  platform text,
  connection_type text,
  effective_connection_type text,
  downlink_mbps numeric,
  rtt_ms integer,
  isp_asn text,
  isp_org text,
  seen_at timestamptz not null default now()
);


alter table public.players add column if not exists screen_w integer;
alter table public.players add column if not exists screen_h integer;
alter table public.players add column if not exists viewport_w integer;
alter table public.players add column if not exists viewport_h integer;
alter table public.players add column if not exists device_pixel_ratio numeric;
alter table public.players add column if not exists cookie_enabled boolean;
alter table public.players add column if not exists first_party_cookie_writeable boolean;
alter table public.players add column if not exists cookie_string_present boolean;
alter table public.players add column if not exists timezone text;
alter table public.players add column if not exists platform text;
alter table public.players add column if not exists connection_type text;
alter table public.players add column if not exists effective_connection_type text;
alter table public.players add column if not exists downlink_mbps numeric;
alter table public.players add column if not exists rtt_ms integer;
alter table public.players add column if not exists isp_asn text;
alter table public.players add column if not exists isp_org text;

alter table public.player_devices add column if not exists screen_w integer;
alter table public.player_devices add column if not exists screen_h integer;
alter table public.player_devices add column if not exists viewport_w integer;
alter table public.player_devices add column if not exists viewport_h integer;
alter table public.player_devices add column if not exists device_pixel_ratio numeric;
alter table public.player_devices add column if not exists cookie_enabled boolean;
alter table public.player_devices add column if not exists first_party_cookie_writeable boolean;
alter table public.player_devices add column if not exists cookie_string_present boolean;
alter table public.player_devices add column if not exists timezone text;
alter table public.player_devices add column if not exists platform text;
alter table public.player_devices add column if not exists connection_type text;
alter table public.player_devices add column if not exists effective_connection_type text;
alter table public.player_devices add column if not exists downlink_mbps numeric;
alter table public.player_devices add column if not exists rtt_ms integer;
alter table public.player_devices add column if not exists isp_asn text;
alter table public.player_devices add column if not exists isp_org text;
delete from public.player_devices d
using public.player_devices newer
where d.player_device_id = newer.player_device_id
  and d.seen_at < newer.seen_at;
delete from public.player_devices d
using public.player_devices newer
where d.player_device_id = newer.player_device_id
  and d.seen_at = newer.seen_at
  and d.id < newer.id;
create unique index if not exists player_devices_player_device_id_key on public.player_devices(player_device_id);

create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  board text not null check (board in ('times', 'survival', 'credits')),
  player_device_id uuid references public.players(device_id) on delete set null,
  player_name text not null,
  score_value numeric not null,
  display_value text not null,
  meta jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);
create index if not exists leaderboards_board_score_idx on public.leaderboards(board, score_value);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  max_players integer not null check (max_players between 2 and 4),
  host_device_id uuid references public.players(device_id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting', 'countdown', 'playing', 'closed')),
  countdown_started_at timestamptz,
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_players (
  room_id uuid not null references public.rooms(id) on delete cascade,
  session_id uuid not null,
  player_device_id uuid references public.players(device_id) on delete set null,
  player_name text not null,
  is_host boolean not null default false,
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, session_id)
);

-- Player movement/state snapshots are intentionally not persisted; lobby presence is enough.
drop table if exists public.player_states cascade;

create table if not exists public.room_events (
  id bigint generated by default as identity primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  actor_session_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.player_devices enable row level security;
alter table public.leaderboards enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.players to anon, authenticated;
grant insert on public.player_devices to anon, authenticated;
grant select, insert on public.leaderboards to anon, authenticated;
grant select, insert, update on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.room_players to anon, authenticated;
grant select, insert on public.room_events to anon, authenticated;
grant usage, select on sequence public.room_events_id_seq to anon, authenticated;

-- Client-safe player policies. The RPC below remains the canonical path, but
-- these policies keep PostgREST/FK-related reads and repairs from being blocked
-- by RLS when a browser session uses the anon publishable key.
drop policy if exists "public players read" on public.players;
create policy "public players read" on public.players for select using (true);
drop policy if exists "public players insert" on public.players;
create policy "public players insert" on public.players for insert with check (true);
drop policy if exists "public players update" on public.players;
create policy "public players update" on public.players for update using (true) with check (true);
drop policy if exists "public player devices insert" on public.player_devices;
create policy "public player devices insert" on public.player_devices for insert with check (true);

drop policy if exists "public leaderboard read" on public.leaderboards;
create policy "public leaderboard read" on public.leaderboards for select using (true);
drop policy if exists "public leaderboard insert" on public.leaderboards;
create policy "public leaderboard insert" on public.leaderboards for insert with check (true);
drop policy if exists "public rooms read" on public.rooms;
create policy "public rooms read" on public.rooms for select using (true);
drop policy if exists "public rooms insert" on public.rooms;
create policy "public rooms insert" on public.rooms for insert with check (true);
drop policy if exists "public rooms update" on public.rooms;
create policy "public rooms update" on public.rooms for update using (true) with check (true);
drop policy if exists "public room players read" on public.room_players;
create policy "public room players read" on public.room_players for select using (true);
drop policy if exists "public room players insert" on public.room_players;
create policy "public room players insert" on public.room_players for insert with check (true);
drop policy if exists "public room players update" on public.room_players;
create policy "public room players update" on public.room_players for update using (true) with check (true);
drop policy if exists "public room players delete" on public.room_players;
create policy "public room players delete" on public.room_players for delete using (true);
drop policy if exists "public events read" on public.room_events;
create policy "public events read" on public.room_events for select using (true);
drop policy if exists "public events insert" on public.room_events;
create policy "public events insert" on public.room_events for insert with check (true);

create or replace function public.claim_player_name(p_name text, p_device_id uuid, p_device_info jsonb default '{}'::jsonb)
returns table(allowed boolean, reason text, device_id uuid, name text, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.players%rowtype;
  headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  ip_text text := split_part(coalesce(headers->>'x-forwarded-for', headers->>'cf-connecting-ip', ''), ',', 1);
  port_text text := headers->>'x-forwarded-port';
  isp_asn_text text := coalesce(headers->>'cf-asn', headers->>'x-vercel-ip-as-number');
  isp_org_text text := coalesce(headers->>'cf-organization', headers->>'x-vercel-ip-as-name', headers->>'x-vercel-ip-as-organization');
begin
  p_name := btrim(p_name);
  if char_length(p_name) < 2 or char_length(p_name) > 16 then
    return query select false, 'el nombre debe tener entre 2 y 16 caracteres', p_device_id, p_name, null::timestamptz, null::timestamptz;
    return;
  end if;

  select * into existing from public.players where lower(players.name) = lower(p_name) limit 1;
  if found and existing.device_id <> p_device_id then
    return query select false, 'ese nombre ya está ligado a otro dispositivo', existing.device_id, existing.name, existing.created_at, existing.updated_at;
    return;
  end if;

  insert into public.players(
    device_id, name, device_info, last_ip, last_port, last_country, last_region, last_city, last_language, last_user_agent,
    screen_w, screen_h, viewport_w, viewport_h, device_pixel_ratio, cookie_enabled, first_party_cookie_writeable,
    cookie_string_present, timezone, platform, connection_type, effective_connection_type, downlink_mbps, rtt_ms,
    isp_asn, isp_org
  )
  values (
    p_device_id, p_name, p_device_info, nullif(ip_text, '')::inet, nullif(port_text, '')::integer,
    headers->>'cf-ipcountry', headers->>'x-vercel-ip-country-region', headers->>'x-vercel-ip-city',
    p_device_info->>'language', p_device_info->>'user_agent',
    nullif(p_device_info->>'screen_w', '')::integer, nullif(p_device_info->>'screen_h', '')::integer,
    nullif(p_device_info->>'viewport_w', '')::integer, nullif(p_device_info->>'viewport_h', '')::integer,
    nullif(p_device_info->>'device_pixel_ratio', '')::numeric, nullif(p_device_info->>'cookie_enabled', '')::boolean,
    nullif(p_device_info->>'first_party_cookie_writeable', '')::boolean, nullif(p_device_info->>'cookie_string_present', '')::boolean,
    p_device_info->>'timezone', p_device_info->>'platform', p_device_info->>'connection_type',
    p_device_info->>'effective_connection_type', nullif(p_device_info->>'downlink_mbps', '')::numeric,
    nullif(p_device_info->>'rtt_ms', '')::integer, isp_asn_text, isp_org_text
  )
  on conflict on constraint players_pkey do update set
    name = excluded.name,
    device_info = excluded.device_info,
    last_ip = excluded.last_ip,
    last_port = excluded.last_port,
    last_country = excluded.last_country,
    last_region = excluded.last_region,
    last_city = excluded.last_city,
    last_language = excluded.last_language,
    last_user_agent = excluded.last_user_agent,
    screen_w = excluded.screen_w,
    screen_h = excluded.screen_h,
    viewport_w = excluded.viewport_w,
    viewport_h = excluded.viewport_h,
    device_pixel_ratio = excluded.device_pixel_ratio,
    cookie_enabled = excluded.cookie_enabled,
    first_party_cookie_writeable = excluded.first_party_cookie_writeable,
    cookie_string_present = excluded.cookie_string_present,
    timezone = excluded.timezone,
    platform = excluded.platform,
    connection_type = excluded.connection_type,
    effective_connection_type = excluded.effective_connection_type,
    downlink_mbps = excluded.downlink_mbps,
    rtt_ms = excluded.rtt_ms,
    isp_asn = excluded.isp_asn,
    isp_org = excluded.isp_org,
    updated_at = now(),
    last_seen_at = now();

  insert into public.player_devices(
    player_device_id, device_info, ip, port, country, region, city, user_agent,
    screen_w, screen_h, viewport_w, viewport_h, device_pixel_ratio, cookie_enabled, first_party_cookie_writeable,
    cookie_string_present, timezone, platform, connection_type, effective_connection_type, downlink_mbps, rtt_ms,
    isp_asn, isp_org
  )
  values (
    p_device_id, p_device_info, nullif(ip_text, '')::inet, nullif(port_text, '')::integer,
    headers->>'cf-ipcountry', headers->>'x-vercel-ip-country-region', headers->>'x-vercel-ip-city', p_device_info->>'user_agent',
    nullif(p_device_info->>'screen_w', '')::integer, nullif(p_device_info->>'screen_h', '')::integer,
    nullif(p_device_info->>'viewport_w', '')::integer, nullif(p_device_info->>'viewport_h', '')::integer,
    nullif(p_device_info->>'device_pixel_ratio', '')::numeric, nullif(p_device_info->>'cookie_enabled', '')::boolean,
    nullif(p_device_info->>'first_party_cookie_writeable', '')::boolean, nullif(p_device_info->>'cookie_string_present', '')::boolean,
    p_device_info->>'timezone', p_device_info->>'platform', p_device_info->>'connection_type',
    p_device_info->>'effective_connection_type', nullif(p_device_info->>'downlink_mbps', '')::numeric,
    nullif(p_device_info->>'rtt_ms', '')::integer, isp_asn_text, isp_org_text
  )
  on conflict (player_device_id) do update set
    device_info = excluded.device_info,
    ip = excluded.ip,
    port = excluded.port,
    country = excluded.country,
    region = excluded.region,
    city = excluded.city,
    user_agent = excluded.user_agent,
    screen_w = excluded.screen_w,
    screen_h = excluded.screen_h,
    viewport_w = excluded.viewport_w,
    viewport_h = excluded.viewport_h,
    device_pixel_ratio = excluded.device_pixel_ratio,
    cookie_enabled = excluded.cookie_enabled,
    first_party_cookie_writeable = excluded.first_party_cookie_writeable,
    cookie_string_present = excluded.cookie_string_present,
    timezone = excluded.timezone,
    platform = excluded.platform,
    connection_type = excluded.connection_type,
    effective_connection_type = excluded.effective_connection_type,
    downlink_mbps = excluded.downlink_mbps,
    rtt_ms = excluded.rtt_ms,
    isp_asn = excluded.isp_asn,
    isp_org = excluded.isp_org,
    seen_at = now();

  return query select true, null::text, p.device_id, p.name, p.created_at, p.updated_at from public.players as p where p.device_id = claim_player_name.p_device_id;
end;
$$;

grant execute on function public.claim_player_name(text, uuid, jsonb) to anon, authenticated;


create or replace function public.cleanup_empty_rooms(p_stale_after interval default interval '45 seconds')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  delete from public.room_players
  where last_seen_at < now() - p_stale_after;

  delete from public.rooms r
  where r.status = 'closed'
     or not exists (select 1 from public.room_players rp where rp.room_id = r.id);
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.cleanup_empty_rooms(interval) to anon, authenticated;

create or replace function public.delete_empty_room_after_player_leave()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rooms r
  where r.id = old.room_id
    and not exists (select 1 from public.room_players rp where rp.room_id = old.room_id);
  return old;
end;
$$;

drop trigger if exists room_players_cleanup_empty_room on public.room_players;
create trigger room_players_cleanup_empty_room
after delete on public.room_players
for each row execute function public.delete_empty_room_after_player_leave();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_players'
  ) then
    alter publication supabase_realtime add table public.room_players;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_events'
  ) then
    alter publication supabase_realtime add table public.room_events;
  end if;
end;
$$;

alter table public.rooms replica identity full;
alter table public.room_players replica identity full;
alter table public.room_events replica identity full;

-- Verification: this returns every BLACKOUT object expected by the game.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('players', 'player_devices', 'leaderboards', 'rooms', 'room_players', 'room_events')
order by table_name;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'claim_player_name';
