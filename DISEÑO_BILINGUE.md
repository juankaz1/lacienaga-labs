# Diseño del Sistema Bilingüe - Blog de Papers

## 🎯 Objetivo

Manejar papers en inglés y español de manera inteligente:
- Papers en inglés: mostrar en inglés, con opción de ver en español (si hay traducción)
- Papers en español: mostrar en español, con opción de ver en inglés (si hay traducción)
- UI coherente en español (sitio principal está en español)

## 📊 Análisis de los Papers

### Papers en Inglés (4):
1. Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates (Andrés)
2. Local thermodynamics governs the formation and dissolution of protein condensates in living cells (Andrés)
3. Temperature Drives P granule Formation in Caenorhabditis elegans (Andrés - Tesis)
4. Immunogenicity and safety of a RBD vaccine against SARS-CoV-2 in a murine model (Andrés)

### Papers en Español (3):
5. Caracterización de arquitecturas de circuitos genéticos desde modelos analíticos y estocásticos (Juan Carlos)
6. Soluciones analíticas a sistemas de expresión de genes con feedback negativo (Juan Carlos)
7. Diversidad de hongos micorrízicos en lianas y en la rizósfera de los forófitos en un relicto de bosque en Córdoba, Colombia (Ramón)

### Papers con Ambos Idiomas:
- Paper 5: Tiene resumen en español e inglés
- Paper 7: Tiene resumen en español e inglés

## 🗄️ Opción 1: Campos Duplicados (Recomendada)

### Estructura de Base de Datos:

```sql
CREATE TABLE papers (
    id UUID PRIMARY KEY,
    -- Idioma principal del paper
    language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('es', 'en')),
    
    -- Contenido en idioma principal
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    full_text TEXT,
    
    -- Traducción opcional
    title_translated VARCHAR(500), -- NULL si no hay traducción
    abstract_translated TEXT,     -- NULL si no hay traducción
    full_text_translated TEXT,    -- NULL si no hay traducción
    
    -- Metadatos (sin idioma)
    slug VARCHAR(500) UNIQUE NOT NULL,
    doi VARCHAR(255),
    journal VARCHAR(255),
    publication_date DATE,
    pdf_url VARCHAR(500),
    featured_image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Ventajas:
- ✅ Simple de consultar
- ✅ Fácil de entender
- ✅ NULL indica "no hay traducción"
- ✅ Un solo campo para cada idioma

### Desventajas:
- ⚠️ Duplicación de campos (pero necesaria para bilingüismo)

---

## 🗄️ Opción 2: JSON con Traducciones

```sql
CREATE TABLE papers (
    id UUID PRIMARY KEY,
    title JSONB NOT NULL, -- {"es": "...", "en": "..."}
    abstract JSONB NOT NULL,
    full_text JSONB,
    language VARCHAR(2) DEFAULT 'en', -- Idioma principal
    -- ... resto de campos
);
```

### Ventajas:
- ✅ Flexible para agregar más idiomas
- ✅ Un solo campo

### Desventajas:
- ⚠️ Más complejo de consultar en SQL
- ⚠️ Validación más difícil
- ⚠️ Puede ser NULL para algunos idiomas

---

## 🎨 Opción 3: Tabla de Traducciones Separada

```sql
CREATE TABLE papers (
    id UUID PRIMARY KEY,
    language VARCHAR(2) DEFAULT 'en',
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    -- ... resto
);

CREATE TABLE paper_translations (
    id UUID PRIMARY KEY,
    paper_id UUID REFERENCES papers(id),
    language VARCHAR(2) NOT NULL,
    title VARCHAR(500),
    abstract TEXT,
    full_text TEXT,
    UNIQUE(paper_id, language)
);
```

### Ventajas:
- ✅ Normalizado
- ✅ Fácil agregar más idiomas
- ✅ Sin duplicación

### Desventajas:
- ⚠️ Más complejo (JOINs necesarios)
- ⚠️ Más queries

---

## ✅ Recomendación: Opción 1 (Campos Duplicados)

**Razones:**
1. Solo necesitamos 2 idiomas (es, en)
2. Simple de consultar y mantener
3. NULL indica claramente "no hay traducción"
4. Mejor performance (sin JOINs adicionales)

---

## 🎨 Diseño de UI/UX

### Estrategia de Visualización:

1. **Idioma por Defecto**: Español (coherente con el sitio)
2. **Selector de Idioma**: Botón toggle ES/EN en cada paper
3. **Fallback Inteligente**: 
   - Si paper está en inglés y usuario quiere español → mostrar inglés si no hay traducción
   - Mostrar indicador visual si no hay traducción disponible

### Componente de Paper:

```
┌─────────────────────────────────────────┐
│  [ES] [EN]  ← Selector de idioma        │
│                                         │
│  Título del Paper                       │
│  🔗 [Icono enlace]                      │
│                                         │
│  Por: Andrés Díaz, María García        │
│  📅 Enero 2024                          │
│                                         │
│  [Carrusel de imágenes]                 │
│                                         │
│  Resumen/Abstract:                      │
│  [Texto en idioma seleccionado]         │
│                                         │
│  [Si no hay traducción disponible]     │
│  ⚠️ Traducción no disponible            │
│  [Mostrar en idioma original]          │
└─────────────────────────────────────────┘
```

### Lógica de Visualización:

```javascript
function getPaperContent(paper, userLanguage) {
    // Si el paper tiene el idioma que el usuario quiere
    if (paper.language === userLanguage) {
        return {
            title: paper.title,
            abstract: paper.abstract,
            full_text: paper.full_text,
            hasTranslation: !!paper.title_translated
        };
    }
    
    // Si el usuario quiere el idioma traducido
    if (userLanguage === 'es' && paper.language === 'en') {
        if (paper.title_translated) {
            return {
                title: paper.title_translated,
                abstract: paper.abstract_translated,
                full_text: paper.full_text_translated,
                hasTranslation: true,
                originalLanguage: 'en'
            };
        } else {
            // No hay traducción, mostrar original con indicador
            return {
                title: paper.title,
                abstract: paper.abstract,
                full_text: paper.full_text,
                hasTranslation: false,
                originalLanguage: 'en',
                showOriginalWarning: true
            };
        }
    }
    
    // Similar para español → inglés
    if (userLanguage === 'en' && paper.language === 'es') {
        if (paper.title_translated) {
            return {
                title: paper.title_translated,
                abstract: paper.abstract_translated,
                full_text: paper.full_text_translated,
                hasTranslation: true,
                originalLanguage: 'es'
            };
        } else {
            return {
                title: paper.title,
                abstract: paper.abstract,
                full_text: paper.full_text,
                hasTranslation: false,
                originalLanguage: 'es',
                showOriginalWarning: true
            };
        }
    }
}
```

---

## 🔄 Flujo de Usuario

### Escenario 1: Paper en Inglés, Usuario quiere Español
1. Usuario ve paper en inglés (idioma original)
2. Click en botón "ES"
3. Si hay traducción → muestra en español
4. Si NO hay traducción → muestra en inglés con mensaje: "Traducción no disponible. Mostrando en inglés."

### Escenario 2: Paper en Español, Usuario quiere Inglés
1. Usuario ve paper en español (idioma original)
2. Click en botón "EN"
3. Si hay traducción → muestra en inglés
4. Si NO hay traducción → muestra en español con mensaje: "Translation not available. Showing in Spanish."

### Escenario 3: Paper tiene ambos idiomas
1. Usuario puede cambiar entre ES/EN libremente
2. Ambos idiomas están disponibles

---

## 📝 Estructura de Datos para Insertar

### Ejemplo: Paper en Inglés con traducción opcional

```sql
INSERT INTO papers (
    language,
    title,
    abstract,
    title_translated,  -- NULL si no hay
    abstract_translated, -- NULL si no hay
    slug,
    doi,
    journal,
    publication_date,
    -- ...
) VALUES (
    'en',
    'Local thermodynamics govern formation and dissolution of Caenorhabditis elegans P granule condensates',
    'Membraneless compartments, also known as condensates...',
    NULL, -- No hay traducción al español aún
    NULL,
    'local-thermodynamics-p-granules',
    '10.1073/pnas.2102772118',
    'PNAS',
    '2021-09-10',
    -- ...
);
```

### Ejemplo: Paper en Español con traducción al inglés

```sql
INSERT INTO papers (
    language,
    title,
    abstract,
    title_translated,
    abstract_translated,
    slug,
    -- ...
) VALUES (
    'es',
    'Caracterización de arquitecturas de circuitos genéticos desde modelos analíticos y estocásticos',
    'Diseñar un nuevo circuito genético requiere determinar...',
    'Characterization of genetic circuit architectures from analytical and stochastic models',
    'Designing a new genetic circuit requires determining...',
    'caracterizacion-circuitos-geneticos',
    -- ...
);
```

---

## 🎯 Implementación en Frontend

### 1. Estado Global de Idioma

```javascript
// Almacenar preferencia del usuario
let userLanguage = localStorage.getItem('preferredLanguage') || 'es';

// Función para cambiar idioma
function setLanguage(lang) {
    userLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    renderPapers(); // Re-renderizar papers
}
```

### 2. Componente de Selector de Idioma

```html
<div class="language-selector">
    <button class="lang-btn active" data-lang="es">ES</button>
    <button class="lang-btn" data-lang="en">EN</button>
</div>
```

### 3. Renderizado Inteligente

```javascript
function renderPaper(paper) {
    const content = getPaperContent(paper, userLanguage);
    
    return `
        <article class="paper-card">
            <div class="paper-header">
                <h3>${content.title}</h3>
                ${content.showOriginalWarning ? 
                    '<span class="translation-warning">⚠️ ' + 
                    (content.originalLanguage === 'en' ? 
                        'Traducción no disponible. Mostrando en inglés.' : 
                        'Translation not available. Showing in Spanish.') + 
                    '</span>' : ''}
            </div>
            <div class="paper-abstract">
                ${content.abstract}
            </div>
        </article>
    `;
}
```

---

## ✅ Decisión Final

**Estructura elegida: Opción 1 (Campos Duplicados)**

- `language`: Idioma principal ('es' o 'en')
- `title`, `abstract`, `full_text`: Contenido en idioma principal
- `title_translated`, `abstract_translated`, `full_text_translated`: Traducción (NULL si no existe)

**UI:**
- Selector ES/EN en cada paper
- Mostrar en español por defecto
- Indicador visual si no hay traducción
- Fallback al idioma original si no hay traducción

---

## 📋 Checklist de Implementación

- [ ] Actualizar esquema de base de datos con campos bilingües
- [ ] Actualizar script SQL (setup_supabase.sql)
- [ ] Crear función JavaScript para obtener contenido según idioma
- [ ] Crear componente selector de idioma
- [ ] Implementar lógica de fallback
- [ ] Agregar indicadores visuales de traducción
- [ ] Testing con papers en ambos idiomas

