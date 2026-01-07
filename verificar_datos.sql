-- ============================================================================
-- Script para Verificar que los Datos se Insertaron Correctamente
-- ============================================================================
-- Ejecuta este script en SQL Editor para verificar los datos
-- ============================================================================

-- Verificar Autores
SELECT 'Autores' as tabla, COUNT(*) as cantidad FROM authors;
SELECT id, name, slug, email FROM authors ORDER BY name;

-- Verificar Papers
SELECT 'Papers' as tabla, COUNT(*) as cantidad FROM papers;
SELECT id, slug, title, status, publication_date FROM papers ORDER BY publication_date DESC;

-- Verificar Relaciones Paper-Author
SELECT 'Paper-Authors' as tabla, COUNT(*) as cantidad FROM paper_authors;
SELECT 
    p.slug as paper_slug,
    p.title as paper_title,
    a.name as author_name,
    pa.author_order
FROM paper_authors pa
JOIN papers p ON pa.paper_id = p.id
JOIN authors a ON pa.author_id = a.id
ORDER BY p.publication_date DESC, pa.author_order;

