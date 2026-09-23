-- Prepared after read-only inspection on 2026-09-23. Manual application only.
-- The connected database has no accommodations table yet: first apply the
-- existing 20260912_accommodations.sql migration, then this file.
-- No seed, URL conversion, table replacement or change to RLS/policies.
BEGIN;

ALTER TABLE public.accommodations ADD COLUMN booking_url text;
ALTER TABLE public.zones ADD COLUMN booking_destination_url text;

-- Keep historic values, but allow new Booking-only recommendations.
ALTER TABLE public.accommodations ALTER COLUMN affiliate_url DROP NOT NULL;
COMMENT ON COLUMN public.accommodations.affiliate_url IS
  'Deprecated: historic affiliate links, no longer read by Surftrips. Retained without conversion.';
COMMENT ON COLUMN public.accommodations.booking_url IS
  'Manually verified ordinary HTTPS Booking.com property URL. CJ tracking is generated server-side on click.';
COMMENT ON COLUMN public.zones.booking_destination_url IS
  'Manually verified ordinary HTTPS Booking.com destination URL. No inferred destination or date parameters.';

-- First guard in SQL; the application also parses and validates exact hostnames.
ALTER TABLE public.accommodations ADD CONSTRAINT accommodations_booking_url_https
  CHECK (booking_url IS NULL OR booking_url ~ '^https://(www\.)?booking\.com(/[^[:space:]]*)?$');
ALTER TABLE public.zones ADD CONSTRAINT zones_booking_destination_url_https
  CHECK (booking_destination_url IS NULL OR booking_destination_url ~ '^https://(www\.)?booking\.com(/[^[:space:]]*)?$');

COMMIT;
