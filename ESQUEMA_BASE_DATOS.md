# Esquema de Base de Datos - Blog de Papers Científicos

## 📋 Estructura Completa (PostgreSQL/Supabase)

### 1. Tabla: `authors` (Autores/Integrantes)

```sql
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    bio TEXT,
    profile_image_url VARCHAR(500),
    slug VARCHAR(255) UNIQUE, -- URL amigable: "andres-diaz"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_authors_slug ON authors(slug);
```

**Datos iniciales (3 integrantes):**
- Andrés Felipe Díaz (CEO)
- [Otros 2 integrantes]

---

### 2. Tabla: `papers` (Publicaciones Científicas)

```sql
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL, -- URL: "ecologia-virus-neotropicales"
    abstract TEXT NOT NULL,
    full_text TEXT, -- Opcional: texto completo extendido
    doi VARCHAR(255), -- Digital Object Identifier
    journal VARCHAR(255),
    publication_date DATE,
    pdf_url VARCHAR(500), -- Link al PDF completo
    featured_image_url VARCHAR(500), -- Imagen principal/portada
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsqueda y filtrado
CREATE INDEX idx_papers_slug ON papers(slug);
CREATE INDEX idx_papers_status ON papers(status);
CREATE INDEX idx_papers_published_at ON papers(published_at DESC);
CREATE INDEX idx_papers_publication_date ON papers(publication_date DESC);
```

**Campos importantes:**
- `slug`: Para URLs amigables (ej: `/blog/ecologia-virus-neotropicales`)
- `status`: Control de publicación
- `view_count`: Para estadísticas

---

### 3. Tabla: `paper_authors` (Relación Papers ↔ Autores)

```sql
CREATE TABLE paper_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    author_order INTEGER NOT NULL, -- 1 = primer autor, 2 = segundo, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(paper_id, author_id)
);

-- Índices
CREATE INDEX idx_paper_authors_paper ON paper_authors(paper_id);
CREATE INDEX idx_paper_authors_author ON paper_authors(author_id);
```

**Ejemplo:**
- Paper "Ecología de Virus" → Andrés (order: 1), María (order: 2), Juan (order: 3)

---

### 4. Tabla: `paper_images` (Galería de Imágenes)

```sql
CREATE TABLE paper_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL, -- URL en Supabase Storage
    caption TEXT,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0, -- Para ordenar: 0, 1, 2, 3...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_paper_images_paper ON paper_images(paper_id);
CREATE INDEX idx_paper_images_order ON paper_images(paper_id, display_order);
```

**Uso:**
- Carrusel de imágenes en cada paper
- Ordenadas por `display_order`

---

### 5. Tabla: `comments` (Comentarios Públicos)

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para respuestas anidadas
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255), -- Opcional
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'spam', 'rejected', 'deleted')),
    ip_address INET, -- Para moderación anti-spam
    user_agent TEXT, -- Para análisis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX idx_comments_paper ON comments(paper_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_paper_status ON comments(paper_id, status);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

**Flujo de moderación:**
1. Usuario envía comentario → `status = 'approved'` (se publica inmediatamente)
2. Admin revisa después (mensual o cuando pueda)
3. Si encuentra spam/inapropiado → `status = 'spam'` o `'rejected'` (se oculta)
4. Si quiere eliminar → `status = 'deleted'` o DELETE directo

---

### 6. Tabla: `tags` (Categorías/Tags - Opcional)

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE paper_tags (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (paper_id, tag_id)
);

CREATE INDEX idx_paper_tags_paper ON paper_tags(paper_id);
CREATE INDEX idx_paper_tags_tag ON paper_tags(tag_id);
```

**Ejemplos de tags:**
- "Ecología", "Virología", "Microbiología", "Conservación"

---

## 🔒 Políticas de Seguridad (Row Level Security - Supabase)

### Lectura Pública (Papers publicados)
```sql
CREATE POLICY "Papers públicos lectura"
ON papers FOR SELECT
USING (status = 'published');
```

### Lectura Pública (Comentarios aprobados - se publican inmediatamente)
```sql
CREATE POLICY "Comentarios públicos lectura"
ON comments FOR SELECT
USING (status = 'approved');
```

### Creación de Comentarios (Público - se publican inmediatamente)
```sql
CREATE POLICY "Comentarios creación pública"
ON comments FOR INSERT
WITH CHECK (
  -- Validaciones
  length(trim(content)) > 0 
  AND length(trim(content)) < 5000
  AND length(trim(author_name)) > 0 
  AND length(trim(author_name)) < 100
  AND author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND status = 'approved' -- Se publica inmediatamente
);
```

### Actualización/Eliminación (Solo Admin)
```sql
-- Solo usuarios autenticados con rol admin pueden modificar
CREATE POLICY "Comentarios admin update"
ON comments FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Comentarios admin delete"
ON comments FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📊 Consultas Útiles

### Obtener todos los papers con autores e imágenes
```sql
SELECT 
    p.*,
    json_agg(DISTINCT jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'order', pa.author_order
    ) ORDER BY pa.author_order) as authors,
    json_agg(DISTINCT jsonb_build_object(
        'id', pi.id,
        'url', pi.image_url,
        'caption', pi.caption,
        'alt', pi.alt_text,
        'order', pi.display_order
    ) ORDER BY pi.display_order) as images,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'approved') as comments_count
FROM papers p
LEFT JOIN paper_authors pa ON p.id = pa.paper_id
LEFT JOIN authors a ON pa.author_id = a.id
LEFT JOIN paper_images pi ON p.id = pi.paper_id
LEFT JOIN comments c ON p.id = c.paper_id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.published_at DESC;
```

### Obtener comentarios de un paper (con respuestas anidadas)
```sql
WITH RECURSIVE comment_tree AS (
    -- Comentarios raíz
    SELECT 
        c.*,
        0 as depth,
        ARRAY[c.id] as path
    FROM comments c
    WHERE c.paper_id = $1 
      AND c.parent_comment_id IS NULL
      AND c.status = 'approved'
    
    UNION ALL
    
    -- Respuestas anidadas (máximo 2 niveles)
    SELECT 
        c.*,
        ct.depth + 1,
        ct.path || c.id
    FROM comments c
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE ct.depth < 2 -- Máximo 2 niveles de anidación
      AND c.status = 'approved'
)
SELECT * FROM comment_tree
ORDER BY path, created_at;
```

---

## 🎨 Estructura para Frontend

### Endpoint: GET `/papers` (Listado)
```json
{
  "papers": [
    {
      "id": "uuid",
      "title": "Ecología de Virus Neotropicales",
      "slug": "ecologia-virus-neotropicales",
      "abstract": "Resumen...",
      "featured_image_url": "https://...",
      "publication_date": "2024-01-15",
      "authors": [
        {"name": "Andrés Díaz", "order": 1},
        {"name": "María García", "order": 2}
      ],
      "images_count": 5,
      "comments_count": 12
    }
  ]
}
```

### Endpoint: GET `/papers/:slug` (Detalle)
```json
{
  "id": "uuid",
  "title": "...",
  "abstract": "...",
  "full_text": "...",
  "pdf_url": "https://...",
  "doi": "10.1234/...",
  "journal": "Nature",
  "publication_date": "2024-01-15",
  "authors": [...],
  "images": [
    {
      "url": "https://...",
      "caption": "...",
      "alt": "..."
    }
  ],
  "comments": [
    {
      "id": "uuid",
      "author_name": "Juan Pérez",
      "content": "Excelente trabajo...",
      "created_at": "2024-01-20T10:00:00Z",
      "replies": [...]
    }
  ]
}
```

---

## 🔄 Migraciones y Setup Inicial

### Script de inicialización (Supabase SQL Editor)
```sql
-- 1. Crear tablas (en orden de dependencias)
-- 2. Crear índices
-- 3. Habilitar RLS
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas (ver sección de seguridad arriba)
-- 5. Insertar datos iniciales (3 autores)
```

---

## 📈 Escalabilidad

**Para 9 papers iniciales:**
- ✅ Cualquier plan gratuito es suficiente

**Para 100+ papers:**
- Supabase Free: 500 MB DB ≈ 100-200 papers con imágenes
- Firebase Free: 1 GB DB ≈ 200-400 papers

**Recomendación:**
- Empezar con plan gratuito
- Monitorear uso
- Migrar a plan pago cuando sea necesario

