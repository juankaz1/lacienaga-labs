-- ============================================================================
-- Supabase Migration: Likes + Comentarios (image_url opcional)
-- ============================================================================
-- Ejecuta esto en Supabase -> SQL Editor (una sola vez)
-- Es seguro re-ejecutarlo (usa IF NOT EXISTS / checks).
-- ============================================================================

-- 1) (Opcional) Permitir imagen por comentario (solo URL; el archivo viviría en Storage)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comments'
      AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- 2) Tabla de likes (1 like por navegador/dispositivo usando client_id)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES public.papers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (paper_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_paper ON public.likes(paper_id);
CREATE INDEX IF NOT EXISTS idx_likes_client ON public.likes(client_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para likes:
-- - SELECT público (para contar likes)
-- - INSERT público (para dar like)
-- - NO permitimos UPDATE/DELETE público (like es "una vez" por client_id)
DROP POLICY IF EXISTS "Likes públicos lectura" ON public.likes;
CREATE POLICY "Likes públicos lectura"
ON public.likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Likes creación pública" ON public.likes;
CREATE POLICY "Likes creación pública"
ON public.likes FOR INSERT
WITH CHECK (client_id IS NOT NULL);


