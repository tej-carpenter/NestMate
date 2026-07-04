-- Enable RLS on listings if not already enabled
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view approved listings
CREATE POLICY "Anyone can view approved listings"
  ON public.listings
  FOR SELECT
  USING (status = 'approved');

-- Allow hosts to view their own listings
CREATE POLICY "Hosts can view their own listings"
  ON public.listings
  FOR SELECT
  USING (host_id = auth.uid());

-- Allow hosts to update their own listings
CREATE POLICY "Hosts can update their own listings"
  ON public.listings
  FOR UPDATE
  USING (host_id = auth.uid());

-- Allow hosts to insert listings
CREATE POLICY "Hosts can insert listings"
  ON public.listings
  FOR INSERT
  WITH CHECK (host_id = auth.uid());

-- Admins can do everything (handled by service role in backend, but good to add for admin auth)
CREATE POLICY "Admins can view all listings"
  ON public.listings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all listings"
  ON public.listings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Enable RLS on reviews if not already enabled
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reviews for approved listings
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);
