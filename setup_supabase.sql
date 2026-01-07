-- ============================================================================
-- Script de Setup para Supabase - Blog de Papers Científicos
-- ============================================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- 1. TABLAS
-- ============================================================================

-- Tabla: authors (Autores/Integrantes)
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    bio TEXT,
    profile_image_url VARCHAR(500),
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: papers (Publicaciones Científicas) - Bilingüe
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Idioma principal del paper
    language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('es', 'en')),
    -- Contenido en idioma principal
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    full_text TEXT,
    -- Traducción opcional (NULL si no hay traducción)
    title_translated VARCHAR(500),
    abstract_translated TEXT,
    full_text_translated TEXT,
    -- Metadatos (sin idioma)
    slug VARCHAR(500) UNIQUE NOT NULL,
    doi VARCHAR(255),
    journal VARCHAR(255),
    publication_date DATE,
    pdf_url VARCHAR(500),
    featured_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: paper_authors (Relación Papers ↔ Autores)
CREATE TABLE IF NOT EXISTS paper_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    author_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(paper_id, author_id)
);

-- Tabla: paper_images (Galería de Imágenes)
CREATE TABLE IF NOT EXISTS paper_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: comments (Comentarios Públicos - se publican inmediatamente)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'spam', 'rejected', 'deleted')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: tags (Opcional - Categorías)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_tags (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (paper_id, tag_id)
);

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_papers_slug ON papers(slug);
CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_published_at ON papers(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_publication_date ON papers(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_paper_authors_paper ON paper_authors(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_authors_author ON paper_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_paper_images_paper ON paper_images(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_images_order ON paper_images(paper_id, display_order);
CREATE INDEX IF NOT EXISTS idx_comments_paper ON comments(paper_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_paper_status ON comments(paper_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_tags_paper ON paper_tags(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_tags_tag ON paper_tags(tag_id);

-- ============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Papers: Lectura pública solo para publicados
DROP POLICY IF EXISTS "Papers públicos lectura" ON papers;
CREATE POLICY "Papers públicos lectura"
ON papers FOR SELECT
USING (status = 'published');

-- Authors: Lectura pública
DROP POLICY IF EXISTS "Authors públicos lectura" ON authors;
CREATE POLICY "Authors públicos lectura"
ON authors FOR SELECT
USING (true);

-- Paper Authors: Lectura pública
DROP POLICY IF EXISTS "Paper authors públicos lectura" ON paper_authors;
CREATE POLICY "Paper authors públicos lectura"
ON paper_authors FOR SELECT
USING (true);

-- Paper Images: Lectura pública
DROP POLICY IF EXISTS "Paper images públicos lectura" ON paper_images;
CREATE POLICY "Paper images públicos lectura"
ON paper_images FOR SELECT
USING (true);

-- Comments: Lectura pública solo para aprobados
DROP POLICY IF EXISTS "Comentarios públicos lectura" ON comments;
CREATE POLICY "Comentarios públicos lectura"
ON comments FOR SELECT
USING (status = 'approved');

-- Comments: Creación pública (se publican inmediatamente)
DROP POLICY IF EXISTS "Comentarios creación pública" ON comments;
CREATE POLICY "Comentarios creación pública"
ON comments FOR INSERT
WITH CHECK (
  length(trim(content)) > 0 
  AND length(trim(content)) < 5000
  AND length(trim(author_name)) > 0 
  AND length(trim(author_name)) < 100
  AND author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND status = 'approved'
);

-- Comments: Actualización/Eliminación solo para admins (opcional)
-- Por ahora, permitimos que cualquiera pueda actualizar/eliminar
-- Puedes restringir esto después si necesitas
DROP POLICY IF EXISTS "Comentarios update" ON comments;
CREATE POLICY "Comentarios update"
ON comments FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Comentarios delete" ON comments;
CREATE POLICY "Comentarios delete"
ON comments FOR DELETE
USING (true);

-- Tags: Lectura pública
DROP POLICY IF EXISTS "Tags públicos lectura" ON tags;
CREATE POLICY "Tags públicos lectura"
ON tags FOR SELECT
USING (true);

-- Paper Tags: Lectura pública
DROP POLICY IF EXISTS "Paper tags públicos lectura" ON paper_tags;
CREATE POLICY "Paper tags públicos lectura"
ON paper_tags FOR SELECT
USING (true);

-- ============================================================================
-- 5. FUNCIONES ÚTILES (Opcional)
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ SETUP COMPLETADO
-- ============================================================================
-- Próximos pasos:
-- 1. Insertar datos de autores (3 integrantes)
-- 2. Insertar papers (9 papers)
-- 3. Relacionar papers con autores
-- 4. Subir imágenes a Supabase Storage
-- 5. Relacionar imágenes con papers
-- ============================================================================

