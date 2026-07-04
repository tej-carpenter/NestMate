-- Add legal details for users
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS government_id varchar,
  ADD COLUMN IF NOT EXISTS address text;
