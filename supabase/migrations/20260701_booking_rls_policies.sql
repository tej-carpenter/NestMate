-- Enable RLS on bookings table if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 1. Guests can view their own bookings
CREATE POLICY "Guests can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = guest_id);

-- 2. Guests can update their own bookings (e.g. for cancellation or adding notes, if needed)
-- Note: Depending on rules, you might restrict WHICH fields can be updated, but for now we restrict to their own rows
CREATE POLICY "Guests can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = guest_id);

-- 3. Guests can insert their own bookings
CREATE POLICY "Guests can insert their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = guest_id);

-- 4. Hosts can view bookings for their listings
CREATE POLICY "Hosts can view bookings for their listings"
ON public.bookings
FOR SELECT
USING (auth.uid() = (SELECT host_id FROM public.listings WHERE listings.id = bookings.listing_id));

-- 5. Admins can view all bookings (assuming role = 'admin' in JWT or from user_roles)
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (
  (auth.jwt() ->> 'role' = 'admin') 
  OR 
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

-- Note: In production you might want Admins to also UPDATE or DELETE.
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (
  (auth.jwt() ->> 'role' = 'admin') 
  OR 
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);
