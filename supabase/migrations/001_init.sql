-- =====================================================
-- 자물쇠 메시지 지도 — 초기 스키마
-- =====================================================

-- Locks
create table if not exists locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lat float8 not null,
  lng float8 not null,
  location_name text,
  title text not null check (char_length(title) between 1 and 20),
  body text not null check (char_length(body) between 1 and 200),
  color text not null check (color in ('red','pink','yellow','sky','purple')),
  shape text not null check (shape in ('heart','square','circle')),
  visibility text not null check (visibility in ('public','private','link')),
  share_token uuid,
  created_at timestamptz not null default now()
);

create index if not exists locks_visibility_idx on locks (visibility);
create index if not exists locks_user_idx on locks (user_id);
create index if not exists locks_share_token_idx on locks (share_token);
create index if not exists locks_created_at_idx on locks (created_at desc);

-- Ensure share_token is unique when present
create unique index if not exists locks_share_token_unique on locks (share_token) where share_token is not null;

-- Likes
create table if not exists likes (
  lock_id uuid not null references locks(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (lock_id, user_id)
);

-- =====================================================
-- RLS
-- =====================================================
alter table locks enable row level security;
alter table likes enable row level security;

-- Drop existing policies (idempotent)
drop policy if exists "select_public_or_link" on locks;
drop policy if exists "select_public" on locks;
drop policy if exists "insert_locks_anyone" on locks;
drop policy if exists "delete_locks_within_minute" on locks;
drop policy if exists "select_likes" on likes;
drop policy if exists "insert_likes" on likes;
drop policy if exists "delete_likes" on likes;

-- Locks: only public locks are directly SELECT-able.
-- Private locks are retrieved via the get_my_locks() RPC (filtered by user_id),
-- and link locks via the get_lock_by_token() RPC (requires the secret token).
create policy "select_public"
  on locks for select
  using (visibility = 'public');

-- Anyone can insert. user_id is supplied by the client (anonymous UUID).
-- In v2 with Kakao auth, tighten to: with check (user_id = auth.uid())
create policy "insert_locks_anyone"
  on locks for insert
  with check (true);

-- Delete only allowed within the 1-minute soft-window. (spec: 작성 후 1분 이내만 삭제 가능)
-- v2 will also enforce user_id = auth.uid()
create policy "delete_locks_within_minute"
  on locks for delete
  using (created_at > now() - interval '1 minute');

-- Likes: open, gated by client (anonymous UUID).
create policy "select_likes" on likes for select using (true);
create policy "insert_likes" on likes for insert with check (true);
create policy "delete_likes" on likes for delete using (true);

-- =====================================================
-- RPC functions (security definer to bypass RLS for known-safe queries)
-- =====================================================

-- Fetch a lock by its share_token (link-shared locks only).
create or replace function get_lock_by_token(p_token uuid)
returns setof locks
language sql
stable
security definer
set search_path = public
as $$
  select * from locks
   where share_token = p_token
     and visibility = 'link'
   limit 1;
$$;

revoke all on function get_lock_by_token(uuid) from public;
grant execute on function get_lock_by_token(uuid) to anon, authenticated;

-- Fetch all locks belonging to a given anonymous user_id (includes private).
-- Client passes its own UUID; UUIDs are 128-bit secrets stored in localStorage.
create or replace function get_my_locks(p_user_id uuid)
returns setof locks
language sql
stable
security definer
set search_path = public
as $$
  select * from locks
   where user_id = p_user_id
   order by created_at desc;
$$;

revoke all on function get_my_locks(uuid) from public;
grant execute on function get_my_locks(uuid) to anon, authenticated;
