-- KINNIPAW — Gate M8 Extension: Species common_name & Media URL compatibility aliases
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Adds common_name and scientific_name to public.species and media_url to public.animal_media to ensure API, web, and mobile queries succeed

BEGIN;

ALTER TABLE public.species
  ADD COLUMN IF NOT EXISTS common_name TEXT GENERATED ALWAYS AS (name) STORED,
  ADD COLUMN IF NOT EXISTS scientific_name TEXT NULL;

ALTER TABLE public.animal_media
  ADD COLUMN IF NOT EXISTS media_url TEXT GENERATED ALWAYS AS (storage_path) STORED;

COMMIT;
