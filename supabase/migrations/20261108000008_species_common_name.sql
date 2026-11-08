-- KINNIPAW — Gate M8 Extension: Species common_name compatibility alias
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Adds common_name generated column to public.species to ensure API, web, and mobile queries succeed

BEGIN;

ALTER TABLE public.species
  ADD COLUMN IF NOT EXISTS common_name TEXT GENERATED ALWAYS AS (name) STORED;

COMMIT;
