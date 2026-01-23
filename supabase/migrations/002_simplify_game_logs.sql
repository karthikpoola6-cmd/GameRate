-- Migration: Simplify game logging
-- - Change statuses to just 'want_to_play' and 'played'
-- - Add 'favorite' column for Top 5 feature

-- 1. Add favorite column
ALTER TABLE public.game_logs
ADD COLUMN IF NOT EXISTS favorite boolean DEFAULT false NOT NULL;

-- 2. Update any existing 'playing' or 'dropped' to 'played'
UPDATE public.game_logs SET status = 'played' WHERE status IN ('playing', 'dropped');

-- 3. Remove the old enum values (create new enum, migrate, drop old)
-- First, create the new simpler enum
CREATE TYPE public.game_status_new AS ENUM ('want_to_play', 'played');

-- Alter the column to use the new enum
ALTER TABLE public.game_logs
  ALTER COLUMN status TYPE public.game_status_new
  USING status::text::public.game_status_new;

-- Drop the old enum and rename
DROP TYPE public.game_status;
ALTER TYPE public.game_status_new RENAME TO game_status;

-- 4. Add index for favorites (for Top 5 queries)
CREATE INDEX IF NOT EXISTS game_logs_favorite_idx ON public.game_logs(user_id, favorite) WHERE favorite = true;
