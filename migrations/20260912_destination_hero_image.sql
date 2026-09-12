-- Inspected 2026-09-12: public.zones has no image column.
-- Apply manually after review. This file does not upload or associate photos.
-- Create the public `destinations` bucket via the Supabase Storage dashboard/API,
-- never by editing storage.objects or storing image bytes in PostgreSQL.
BEGIN;

ALTER TABLE public.zones ADD COLUMN hero_image_path text;
ALTER TABLE public.zones ADD CONSTRAINT zones_hero_image_path_valid CHECK (
  hero_image_path IS NULL OR (
    char_length(hero_image_path) <= 320
    AND hero_image_path ~* '^[a-zA-Z0-9_-]+/([a-zA-Z0-9_-]+/)*[a-zA-Z0-9_-]+\.(webp|avif)$'
    AND split_part(hero_image_path, '/', 1) = zone_id
  )
);
COMMENT ON COLUMN public.zones.hero_image_path IS
  'Relative path in public Storage bucket destinations; manually approved photo only. NULL uses Surftrips graphic fallback.';

COMMIT;
