-- Add rated_at column to track when rating was last changed
-- This allows "Recent Ratings" to show games by rating time, not general update time

-- Add the column
ALTER TABLE public.game_logs
ADD COLUMN rated_at timestamptz;

-- Backfill: set rated_at to updated_at for existing rated games
UPDATE public.game_logs
SET rated_at = updated_at
WHERE rating IS NOT NULL;

-- Create trigger to auto-update rated_at when rating changes
CREATE OR REPLACE FUNCTION public.update_rated_at()
RETURNS trigger AS $$
BEGIN
  -- Only update rated_at if rating changed and new rating is not null
  IF (OLD.rating IS DISTINCT FROM NEW.rating) AND NEW.rating IS NOT NULL THEN
    NEW.rated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_logs_rated_at
  BEFORE UPDATE ON public.game_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_rated_at();

-- Also set rated_at on insert if rating is provided
CREATE OR REPLACE FUNCTION public.set_rated_at_on_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.rating IS NOT NULL THEN
    NEW.rated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_logs_rated_at_insert
  BEFORE INSERT ON public.game_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_rated_at_on_insert();
