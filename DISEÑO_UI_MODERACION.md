# Diseño UI/UX y Sistema de Moderación

## 🎨 Diseño de la Sección Blog

### Estructura Visual (Basada en imagen "Our Team")

```
┌─────────────────────────────────────────────────┐
│  BLOG / PUBLICACIONES CIENTÍFICAS              │
│  "Nuestras investigaciones y publicaciones"     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  [Preview de 3 papers más recientes]           │
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐                 │
│  │Paper1│  │Paper2│  │Paper3│                 │
│  │[IMG] │  │[IMG] │  │[IMG] │                 │
│  │Título│  │Título│  │Título│                 │
│  │Autor │  │Autor │  │Autor │                 │
│  └──────┘  └──────┘  └──────┘                 │
│                                                 │
│  ┌───────────────────────────────────────┐     │
│  │      [Ver más publicaciones ▼]        │     │
│  └───────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘

[Al hacer click en "Ver más", se despliega hacia abajo...]

┌─────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────┐   │
│  │  📄 Paper 1 - Título                    │   │
│  │  👤 Por: Andrés Díaz, María García      │   │
│  │  📅 Enero 2024                          │   │
│  │  🔗 [Icono enlace] Ver publicación      │   │
│  │                                         │   │
│  │  [Carrusel de imágenes]                 │   │
│  │  ◀ [IMG1] [IMG2] [IMG3] ▶              │   │
│  │                                         │   │
│  │  ❤️ 12  💬 5  👁️ 150                   │   │
│  │                                         │   │
│  │  Resumen del paper...                   │   │
│  │                                         │   │
│  │  ────────────────────────────────────   │   │
│  │  💬 Comentarios (5)                     │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ Juan Pérez: Excelente trabajo...│   │   │
│  │  │ Hace 2 días                     │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────┐   │   │
│  │  │ Ana López: Muy interesante...    │   │   │
│  │  │ Hace 5 días                      │   │   │
│  │  └─────────────────────────────────┘   │   │
│  │                                         │   │
│  │  [Formulario nuevo comentario]          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  📄 Paper 2 - Título                    │   │
│  │  ... (misma estructura)                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Más papers...]                                │
└─────────────────────────────────────────────────┘
```

---

## 🖱️ Elementos Clickeables

### 1. **Imágenes del Carrusel**
- **Acción**: Click en cualquier imagen → Redirige a página individual del paper
- **URL**: `/blog/ecologia-virus-neotropicales`
- **Comportamiento**: 
  - Hover: Cursor pointer + ligero zoom
  - Click: Navegación a página completa

### 2. **Título del Paper**
- **Acción**: Click en título → Redirige a página individual
- **Estilo**: 
  - Color: Azul/verde (link)
  - Hover: Subrayado
  - Cursor: pointer

### 3. **Icono de Enlace**
- **Ubicación**: Al lado del título o en la esquina superior derecha de la tarjeta
- **Icono**: 🔗 o icono SVG de "external link"
- **Acción**: Click → Redirige a página individual
- **Tooltip**: "Ver publicación completa"

### 4. **Botón "Ver más publicaciones"**
- **Acción**: Despliega/colapsa lista completa
- **Animación**: Smooth scroll down/up
- **Estado**: 
  - Cerrado: "Ver más publicaciones ▼"
  - Abierto: "Ocultar publicaciones ▲"

---

## 📱 Estructura de Tarjetas (Estilo Instagram)

### Tarjeta Individual de Paper

```html
<article class="paper-card">
  <!-- Header -->
  <div class="paper-header">
    <h3 class="paper-title">
      <a href="/blog/ecologia-virus-neotropicales">
        Ecología de Virus Neotropicales
      </a>
      <a href="/blog/ecologia-virus-neotropicales" class="link-icon">
        🔗
      </a>
    </h3>
    <div class="paper-meta">
      <span class="authors">👤 Por: Andrés Díaz, María García</span>
      <span class="date">📅 Enero 2024</span>
    </div>
  </div>

  <!-- Carrusel de Imágenes -->
  <div class="paper-carousel">
    <button class="carousel-prev">◀</button>
    <div class="carousel-images">
      <a href="/blog/ecologia-virus-neotropicales">
        <img src="image1.jpg" alt="..." />
      </a>
      <a href="/blog/ecologia-virus-neotropicales">
        <img src="image2.jpg" alt="..." />
      </a>
      <a href="/blog/ecologia-virus-neotropicales">
        <img src="image3.jpg" alt="..." />
      </a>
    </div>
    <button class="carousel-next">▶</button>
    <div class="carousel-indicators">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>

  <!-- Reacciones (bajo las fotos) -->
  <div class="paper-reactions">
    <button class="reaction-btn like">
      ❤️ <span class="count">12</span>
    </button>
    <button class="reaction-btn comment">
      💬 <span class="count">5</span>
    </button>
    <button class="reaction-btn view">
      👁️ <span class="count">150</span>
    </button>
  </div>

  <!-- Resumen -->
  <div class="paper-abstract">
    <p>Este estudio explora la ecología de virus en ecosistemas neotropicales...</p>
  </div>

  <!-- Comentarios Preview -->
  <div class="paper-comments-preview">
    <h4>💬 Comentarios (5)</h4>
    <div class="comment-item">
      <strong>Juan Pérez:</strong> Excelente trabajo...
      <span class="comment-date">Hace 2 días</span>
    </div>
    <div class="comment-item">
      <strong>Ana López:</strong> Muy interesante...
      <span class="comment-date">Hace 5 días</span>
    </div>
    <a href="/blog/ecologia-virus-neotropicales#comments" class="view-all-comments">
      Ver todos los comentarios →
    </a>
  </div>

  <!-- Formulario Comentario (opcional en preview) -->
  <div class="comment-form-preview">
    <input type="text" placeholder="Escribe un comentario..." />
    <button>Publicar</button>
  </div>
</article>
```

---

## 🎯 Página Individual del Paper

### URL: `/blog/:slug`

```
┌─────────────────────────────────────────────────┐
│  ← Volver al blog                               │
│                                                 │
│  Título del Paper                               │
│  🔗 [Icono enlace]                              │
│                                                 │
│  Por: Andrés Díaz, María García, Juan Pérez    │
│  📅 Publicado: Enero 2024                      │
│  📄 Journal: Nature                            │
│  🔗 DOI: 10.1234/example                       │
│                                                 │
│  [Carrusel completo de imágenes]                │
│  ◀ [IMG1] [IMG2] [IMG3] [IMG4] [IMG5] ▶       │
│                                                 │
│  ❤️ 12  💬 5  👁️ 150                          │
│                                                 │
│  ────────────────────────────────────────────   │
│                                                 │
│  Resumen                                         │
│  ────────────────────────────────────────────   │
│  [Abstract completo del paper]                  │
│                                                 │
│  [Texto extendido opcional]                    │
│                                                 │
│  📄 [Descargar PDF completo]                   │
│                                                 │
│  ────────────────────────────────────────────   │
│                                                 │
│  💬 Comentarios (5)                             │
│  ────────────────────────────────────────────   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Juan Pérez                               │   │
│  │ Hace 2 días                             │   │
│  │                                         │   │
│  │ Excelente trabajo. Me gustaría saber   │   │
│  │ más sobre...                            │   │
│  │                                         │   │
│  │ [Responder]                             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Ana López                                │   │
│  │ Hace 5 días                             │   │
│  │                                         │   │
│  │ Muy interesante la metodología...       │   │
│  │                                         │   │
│  │ [Responder]                             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ────────────────────────────────────────────   │
│                                                 │
│  Deja un comentario                             │
│  ┌─────────────────────────────────────────┐   │
│  │ Nombre: [___________]                    │   │
│  │ Email:  [___________]                    │   │
│  │ Web:    [___________] (opcional)        │   │
│  │                                         │   │
│  │ Comentario:                             │   │
│  │ [_____________________________]         │   │
│  │ [_____________________________]         │   │
│  │                                         │   │
│  │ [☑️ No soy un robot] [Publicar]        │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Sistema de Moderación de Comentarios

### Flujo de Moderación

```
1. Usuario envía comentario
   ↓
2. Validación Frontend (longitud, email, etc.)
   ↓
3. Envío a Supabase/Firebase
   ↓
4. Comentario guardado con status = 'pending'
   ↓
5. (Opcional) Notificación email a admin
   ↓
6. Admin revisa (mensual o cuando pueda)
   ↓
7. Admin aprueba/rechaza desde:
   - Panel de Supabase/Firebase
   - Interfaz admin en el sitio
   - Directamente en la base de datos
```

### Opciones de Moderación

#### Opción 1: Panel de Supabase (Más Fácil)
- **Acceso**: Dashboard de Supabase → Table Editor
- **Ventaja**: No necesitas código adicional
- **Proceso**:
  1. Ir a tabla `comments`
  2. Filtrar por `status = 'pending'`
  3. Revisar cada comentario
  4. Cambiar `status` a `'approved'` o `'rejected'`
  5. Guardar

#### Opción 2: Interfaz Admin en el Sitio
- **URL**: `/admin/comments` (protegida con contraseña)
- **Ventaja**: Más cómodo, no salir del sitio
- **Funcionalidad**:
  - Lista de comentarios pendientes
  - Botones: "Aprobar" / "Rechazar" / "Marcar como Spam"
  - Vista previa del comentario
  - Link al paper relacionado

#### Opción 3: Directamente en Base de Datos
- **Acceso**: SQL Editor de Supabase
- **Ventaja**: Para cambios masivos
- **Ejemplo**:
```sql
-- Aprobar todos los comentarios de un paper
UPDATE comments 
SET status = 'approved' 
WHERE paper_id = 'uuid-del-paper' 
  AND status = 'pending';

-- Rechazar comentario específico
UPDATE comments 
SET status = 'rejected' 
WHERE id = 'uuid-del-comentario';
```

### Protección Anti-Spam

#### 1. **reCAPTCHA v3** (Recomendado)
```javascript
// En el formulario de comentarios
<script src="https://www.google.com/recaptcha/api.js"></script>
<div class="g-recaptcha" data-sitekey="TU_SITE_KEY"></div>

// Validar en el backend antes de guardar
```

#### 2. **Rate Limiting**
- Máximo 3 comentarios por IP por hora
- Implementar en Supabase Edge Function o Firebase Cloud Function

#### 3. **Validación de Contenido**
```sql
-- Política RLS que valida contenido
CREATE POLICY "Comentarios validación"
ON comments FOR INSERT
WITH CHECK (
  -- No spam words (ejemplo básico)
  content !~* '(spam|viagra|casino)'
  AND length(trim(content)) BETWEEN 10 AND 5000
);
```

#### 4. **Blacklist de IPs**
```sql
-- Tabla opcional para IPs bloqueadas
CREATE TABLE blocked_ips (
    ip_address INET PRIMARY KEY,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notificaciones (Opcional)

#### Email cuando hay comentarios pendientes
- **Frecuencia**: Diaria o semanal
- **Contenido**: 
  - "Tienes 5 comentarios pendientes de revisión"
  - Link directo al panel de moderación

#### Implementación con Supabase Edge Function
```typescript
// Edge Function que envía email semanal
// Se ejecuta con cron job
```

---

## 📋 Checklist de Implementación

### Fase 1: Base de Datos
- [ ] Crear tablas en Supabase/Firebase
- [ ] Configurar políticas de seguridad (RLS/Security Rules)
- [ ] Insertar datos iniciales (3 autores, 9 papers)
- [ ] Subir imágenes a Storage

### Fase 2: Frontend - Listado
- [ ] Sección "Blog" en index.html
- [ ] Preview de 3 papers más recientes
- [ ] Botón "Ver más" con animación
- [ ] Tarjetas estilo Instagram con carrusel
- [ ] Elementos clickeables (imágenes, título, icono)

### Fase 3: Frontend - Página Individual
- [ ] Página `/blog/:slug`
- [ ] Carrusel completo de imágenes
- [ ] Sección de comentarios
- [ ] Formulario de comentarios
- [ ] Sistema de respuestas anidadas

### Fase 4: Integración Backend
- [ ] Conectar con Supabase/Firebase API
- [ ] Cargar papers desde base de datos
- [ ] Enviar comentarios
- [ ] Cargar comentarios aprobados

### Fase 5: Moderación
- [ ] Panel de administración (opcional)
- [ ] Configurar reCAPTCHA
- [ ] Rate limiting
- [ ] Notificaciones (opcional)

### Fase 6: Seguridad
- [ ] Validación frontend
- [ ] Validación backend (RLS/Security Rules)
- [ ] Sanitización de HTML
- [ ] Protección CORS

---

## 🎨 Consideraciones de UX

### Responsive Design
- **Desktop**: 3 columnas de papers
- **Tablet**: 2 columnas
- **Mobile**: 1 columna, carrusel táctil

### Performance
- **Lazy loading**: Cargar imágenes cuando se ven
- **Paginación**: Máximo 10 papers por página
- **Caché**: Cachear papers en el frontend

### Accesibilidad
- **Alt text** en todas las imágenes
- **ARIA labels** en botones
- **Navegación por teclado**
- **Contraste** de colores adecuado

