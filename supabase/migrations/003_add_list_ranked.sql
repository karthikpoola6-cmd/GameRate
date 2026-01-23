-- Add is_ranked column to lists table
-- When true, list items will display numbered positions (1, 2, 3, etc.)

ALTER TABLE public.lists
ADD COLUMN is_ranked boolean DEFAULT false NOT NULL;
