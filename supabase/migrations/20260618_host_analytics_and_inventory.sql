-- Migration: 20260618_host_analytics_and_inventory.sql

-- 1. Create listing_views table
CREATE TABLE IF NOT EXISTS public.listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast analytics
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON public.listing_views(created_at);


-- 2. Availability / Booking Transaction RPC
CREATE OR REPLACE FUNCTION public.create_booking_transaction(booking_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available_units int;
  v_listing_id uuid;
  v_quantity int;
  v_booking_id uuid;
BEGIN
  v_listing_id := (booking_payload->>'listing_id')::uuid;
  v_quantity := (booking_payload->>'quantity')::int;
  
  -- Lock the row for update to prevent concurrent booking race conditions
  SELECT available_units INTO v_available_units 
  FROM public.listings 
  WHERE id = v_listing_id 
  FOR UPDATE;
  
  IF v_available_units < v_quantity THEN
    RAISE EXCEPTION 'Not enough availability';
  END IF;
  
  -- Decrement availability
  UPDATE public.listings 
  SET available_units = available_units - v_quantity 
  WHERE id = v_listing_id;
  
  -- Auto-update status if fully occupied
  IF (v_available_units - v_quantity) <= 0 THEN
    UPDATE public.listings 
    SET status = 'full' 
    WHERE id = v_listing_id;
  END IF;
  
  -- Insert the booking
  INSERT INTO public.bookings (
    listing_id, guest_id, host_id, move_in_date, move_out_date, 
    rent_amount, deposit_amount, booking_status, payment_status, 
    notes, quantity, guest_count
  ) VALUES (
    v_listing_id,
    (booking_payload->>'guest_id')::uuid,
    (booking_payload->>'host_id')::uuid,
    (booking_payload->>'move_in_date')::date,
    (booking_payload->>'move_out_date')::date,
    (booking_payload->>'rent_amount')::numeric,
    (booking_payload->>'deposit_amount')::numeric,
    booking_payload->>'booking_status',
    booking_payload->>'payment_status',
    booking_payload->>'notes',
    v_quantity,
    (booking_payload->>'guest_count')::int
  ) RETURNING id INTO v_booking_id;
  
  RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);
END;
$$;


-- 3. Update Inventory RPC (For hosts to manage availability)
CREATE OR REPLACE FUNCTION public.update_listing_availability(p_listing_id uuid, p_new_units int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the units
  UPDATE public.listings 
  SET available_units = p_new_units 
  WHERE id = p_listing_id;
  
  -- Auto-reactivate if units increased above 0 and it was previously marked as 'full'
  IF p_new_units > 0 THEN
    UPDATE public.listings 
    SET status = 'active' 
    WHERE id = p_listing_id AND status = 'full';
  END IF;
END;
$$;
