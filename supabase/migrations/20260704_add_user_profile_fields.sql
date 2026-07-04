-- Add missing profile fields to the users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS gender varchar,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS government_id varchar,
  ADD COLUMN IF NOT EXISTS address text;
