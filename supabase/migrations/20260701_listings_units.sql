-- Add total_units and available_units to listings table
ALTER TABLE IF EXISTS public.listings
  ADD COLUMN IF NOT EXISTS total_units integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS available_units integer DEFAULT 1;

-- Update existing records to have 1 available unit if they are approved
UPDATE public.listings
SET total_units = 1, available_units = 1
WHERE total_units IS NULL;
