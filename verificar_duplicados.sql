-- ============================================================================
-- Script para Verificar Duplicados y Estado de los Datos
-- ============================================================================

-- 1. Verificar si hay autores duplicados
SELECT slug, COUNT(*) as cantidad
FROM authors
GROUP BY slug
HAVING COUNT(*) > 1;

-- 2. Verificar si hay papers duplicados
SELECT slug, COUNT(*) as cantidad
FROM papers
GROUP BY slug
HAVING COUNT(*) > 1;

-- 3. Contar totales
SELECT 
    'Autores' as tabla,
    COUNT(*) as total,
    COUNT(DISTINCT slug) as slugs_unicos
FROM authors
UNION ALL
SELECT 
    'Papers' as tabla,
    COUNT(*) as total,
    COUNT(DISTINCT slug) as slugs_unicos
FROM papers
UNION ALL
SELECT 
    'Paper-Authors' as tabla,
    COUNT(*) as total,
    COUNT(DISTINCT paper_id) as papers_con_autores
FROM paper_authors;

-- 4. Ver todos los papers con sus autores
SELECT 
    p.slug,
    p.title,
    p.status,
    p.publication_date,
    a.name as author_name,
    pa.author_order
FROM papers p
LEFT JOIN paper_authors pa ON p.id = pa.paper_id
LEFT JOIN authors a ON pa.author_id = a.id
ORDER BY p.publication_date DESC;

