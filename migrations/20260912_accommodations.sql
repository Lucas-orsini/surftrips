-- Prepared after read-only schema inspection on 2026-09-12.
-- Existing application tables: public.zones and public.spots only.
-- NOT automatically executed by the application. No seed data.
-- Apply once, as the database administrator, after review.
BEGIN;

CREATE TABLE public.accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id text NOT NULL REFERENCES public.zones(zone_id),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type text NOT NULL CHECK (type IN ('hotel','hostel','surf_house','apartment','guesthouse','surf_camp')),
  location_label text,
  description text CHECK (char_length(description) <= 150),
  image_url text CHECK (image_url ~ '^https://[^[:space:]]+$'),
  distance_label text,
  price_category text CHECK (price_category IN ('budget','mid','premium')),
  affiliate_url text NOT NULL CHECK (affiliate_url ~ '^https://[^[:space:]]+$'),
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (zone_id, slug)
);

CREATE INDEX accommodations_recommendations_idx
  ON public.accommodations (zone_id, featured DESC, display_order ASC, id ASC)
  WHERE active = true;

CREATE FUNCTION public.surftrips_accommodation_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER accommodations_updated_at
  BEFORE UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION public.surftrips_accommodation_updated_at();

ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
-- No browser access or public write policy. The owner maintains editorial data.
REVOKE ALL ON TABLE public.accommodations FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.accommodations TO service_role;
CREATE POLICY accommodations_server_read ON public.accommodations
  FOR SELECT TO service_role USING (active = true);
REVOKE ALL ON FUNCTION public.surftrips_accommodation_updated_at() FROM PUBLIC;

COMMIT;
