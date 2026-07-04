-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Insert default row if none exists
INSERT INTO public.platform_settings (razorpay_enabled)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Anyone can read settings
CREATE POLICY "Anyone can view platform settings"
  ON public.platform_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  USING (public.is_admin());
