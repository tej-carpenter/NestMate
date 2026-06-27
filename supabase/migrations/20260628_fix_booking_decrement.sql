-- Migration: 20260628_fix_booking_decrement.sql

-- 1. Redefine create_booking_transaction to REMOVE decrement logic
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
  
  -- We just check if there are enough units available, but we DO NOT decrement them yet.
  SELECT available_units INTO v_available_units 
  FROM public.listings 
  WHERE id = v_listing_id;
  
  IF v_available_units < v_quantity THEN
    RAISE EXCEPTION 'Not enough availability';
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


-- 2. Create confirm_booking_payment_transaction RPC
CREATE OR REPLACE FUNCTION public.confirm_booking_payment_transaction(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing_id uuid;
  v_quantity int;
  v_available_units int;
  v_booking_status text;
BEGIN
  -- Lock the booking to prevent race conditions
  SELECT listing_id, quantity, booking_status 
  INTO v_listing_id, v_quantity, v_booking_status
  FROM public.bookings 
  WHERE id = p_booking_id
  FOR UPDATE;
  
  -- Only process if it hasn't been confirmed yet
  IF v_booking_status = 'confirmed' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already confirmed');
  END IF;
  
  -- Lock the listing for update
  SELECT available_units INTO v_available_units 
  FROM public.listings 
  WHERE id = v_listing_id 
  FOR UPDATE;
  
  -- Decrement availability (if there's enough spots, though payment is already done)
  -- We allow it even if it goes below zero, as payment is the ultimate source of truth,
  -- but ideally it shouldn't because create_booking_transaction checked it.
  UPDATE public.listings 
  SET available_units = available_units - v_quantity 
  WHERE id = v_listing_id;
  
  -- Auto-update status if fully occupied
  IF (v_available_units - v_quantity) <= 0 THEN
    UPDATE public.listings 
    SET status = 'full' 
    WHERE id = v_listing_id;
  END IF;
  
  -- Update booking status
  UPDATE public.bookings
  SET booking_status = 'confirmed', payment_status = 'completed'
  WHERE id = p_booking_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
