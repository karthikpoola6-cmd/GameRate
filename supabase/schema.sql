-- SavePoint Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================
-- 1. PROFILES TABLE
-- Stores user profile info (linked to auth.users)
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Username must be 3-20 chars, letters, numbers, underscores only
alter table public.profiles
  add constraint username_format
  check (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- ============================================
-- 2. GAME LOGS TABLE
-- Tracks user's relationship with games
-- ============================================

-- Status options for game logs
create type public.game_status as enum (
  'want_to_play',
  'playing',
  'played',
  'dropped'
);

create table public.game_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  game_id integer not null,              -- IGDB game ID
  game_slug text not null,               -- For URLs (e.g., "elden-ring")
  game_name text not null,               -- Display name
  game_cover_id text,                    -- IGDB cover image ID
  status public.game_status not null,
  rating numeric(2,1) check (rating >= 0.5 and rating <= 5),  -- 0.5-5 stars (half-star increments)
  review text,
  started_at date,
  finished_at date,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- One log per user per game
  unique(user_id, game_id)
);

-- ============================================
-- 3. LISTS TABLE
-- User-created game lists
-- ============================================

create table public.lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true not null,
  is_ranked boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- 4. LIST ITEMS TABLE
-- Games within lists
-- ============================================

create table public.list_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.lists on delete cascade not null,
  game_id integer not null,
  game_slug text not null,
  game_name text not null,
  game_cover_id text,
  position integer not null default 0,   -- For ordering games in list
  notes text,                            -- Optional notes about why it's in the list
  added_at timestamptz default now() not null,

  -- One entry per game per list
  unique(list_id, game_id)
);

-- ============================================
-- 5. FOLLOWS TABLE
-- Who follows who
-- ============================================

create table public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,

  -- Can't follow yourself, one follow per pair
  check (follower_id != following_id),
  unique(follower_id, following_id)
);

-- ============================================
-- 6. INDEXES (for performance)
-- ============================================

create index game_logs_user_id_idx on public.game_logs(user_id);
create index game_logs_game_id_idx on public.game_logs(game_id);
create index game_logs_status_idx on public.game_logs(status);
create index lists_user_id_idx on public.lists(user_id);
create index list_items_list_id_idx on public.list_items(list_id);
create index follows_follower_id_idx on public.follows(follower_id);
create index follows_following_id_idx on public.follows(following_id);

-- ============================================
-- 7. AUTO-UPDATE TIMESTAMPS
-- ============================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger game_logs_updated_at
  before update on public.game_logs
  for each row execute function public.update_updated_at();

create trigger lists_updated_at
  before update on public.lists
  for each row execute function public.update_updated_at();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- Controls who can read/write what
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.game_logs enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.follows enable row level security;

-- PROFILES policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- GAME LOGS policies
create policy "Game logs are viewable by everyone"
  on public.game_logs for select
  using (true);

create policy "Users can insert own game logs"
  on public.game_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own game logs"
  on public.game_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own game logs"
  on public.game_logs for delete
  using (auth.uid() = user_id);

-- LISTS policies
create policy "Public lists are viewable by everyone"
  on public.lists for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can insert own lists"
  on public.lists for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.lists for update
  using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.lists for delete
  using (auth.uid() = user_id);

-- LIST ITEMS policies
create policy "List items viewable if list is viewable"
  on public.list_items for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id
      and (lists.is_public = true or lists.user_id = auth.uid())
    )
  );

create policy "Users can insert items to own lists"
  on public.list_items for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

create policy "Users can update items in own lists"
  on public.list_items for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

create policy "Users can delete items from own lists"
  on public.list_items for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = list_items.list_id
      and lists.user_id = auth.uid()
    )
  );

-- FOLLOWS policies
create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================
-- 9. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  email_prefix text;
  clean_username text;
begin
  -- Get email prefix (before @)
  email_prefix := split_part(new.email, '@', 1);
  -- Remove any characters that aren't lowercase letters, numbers, or underscores
  clean_username := regexp_replace(lower(email_prefix), '[^a-z0-9_]', '', 'g');
  -- Ensure minimum length of 3 characters
  if length(clean_username) < 3 then
    clean_username := 'user';
  end if;
  -- Truncate if too long (max 15 chars to leave room for suffix)
  clean_username := left(clean_username, 15);

  insert into public.profiles (id, username)
  values (
    new.id,
    clean_username || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
