-- ============================================================================
-- Supabase Migration: Significance fields (bilingüe opcional)
-- ============================================================================
-- Ejecuta esto en Supabase -> SQL Editor.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'papers'
      AND column_name = 'significance'
  ) THEN
    ALTER TABLE public.papers ADD COLUMN significance TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'papers'
      AND column_name = 'significance_translated'
  ) THEN
    ALTER TABLE public.papers ADD COLUMN significance_translated TEXT;
  END IF;
END $$;

-- (Opcional) Cargar significance de A1 si aún está vacío
UPDATE public.papers
SET significance = 'Living cells rely on a continuous flux of energy to spatially organize biochemical processes. It remains unclear whether cells can achieve this spatial organization via thermodynamic principles. Here, we report the striking behavior of a cold-blooded organism that reacts to environmental temperature changes similar to a thermodynamic system at local equilibrium. Our key finding is that protein-rich droplets form and dissolve reversibly with temperature due to changes in the organism''s entropy. We show that the organism uses a specific molecule to extend droplet stability to the natural temperature range of the organism''s habitat. Due to the relevance of such protein droplets for the organism''s fertility, our work sheds light on how molecular components could facilitate biological functions via thermodynamic principles.'
WHERE slug = 'local-thermodynamics-p-granules-condensates'
  AND (significance IS NULL OR length(trim(significance)) = 0);


