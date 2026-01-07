# Plan de Implementación - Blog de Papers

## 📋 Información que Necesito de Ti

Para empezar la implementación, necesito:

### 1. **Información de los 3 Integrantes**
- Nombre completo
- Email (opcional)
- Bio breve (opcional)
- Foto de perfil (opcional)
- Slug para URL (ej: "andres-diaz")

### 2. **Información de los 9 Papers**
Para cada paper necesito:
- **Título completo**
- **Slug para URL** (ej: "ecologia-virus-neotropicales")
- **Abstract/Resumen** (texto completo)
- **Texto extendido** (opcional, si quieren más detalle)
- **DOI** (si tienen)
- **Journal/Revista** donde se publicó
- **Fecha de publicación**
- **Link al PDF** (si está disponible online)
- **Autores** (cuáles de los 3 integrantes, y en qué orden)
- **Imágenes** (cuántas y qué mostrar en cada una)
  - URLs o archivos de las imágenes
  - Captions/descripciones para cada imagen
  - Alt text para accesibilidad

### 3. **Imágenes**
- ¿Tienes las imágenes ya subidas a algún lugar?
- ¿O prefieres que las suba a Supabase Storage?
- ¿Qué imágenes quieres para cada paper?

---

## 🚀 Plan de Implementación Paso a Paso

### Fase 1: Setup Supabase (30 min)
- [x] Crear script SQL con todas las tablas
- [ ] Crear cuenta en Supabase (tú)
- [ ] Ejecutar script SQL en Supabase
- [ ] Configurar Storage bucket para imágenes

### Fase 2: Insertar Datos Iniciales (1-2 horas)
- [ ] Insertar 3 autores
- [ ] Insertar 9 papers
- [ ] Relacionar papers con autores
- [ ] Subir imágenes a Storage
- [ ] Relacionar imágenes con papers

### Fase 3: Frontend - Sección Blog en index.html (2-3 horas)
- [ ] Agregar sección "Blog" en el HTML
- [ ] Preview de 3 papers más recientes
- [ ] Botón "Ver más publicaciones"
- [ ] Animación de despliegue

### Fase 4: Frontend - Tarjetas Estilo Instagram (3-4 horas)
- [ ] Diseño de tarjetas
- [ ] Carrusel de imágenes
- [ ] Reacciones (❤️ 💬 👁️)
- [ ] Resumen del paper
- [ ] Preview de comentarios
- [ ] Elementos clickeables (imágenes, título, icono)

### Fase 5: Frontend - Página Individual (2-3 horas)
- [ ] Crear página `/blog/:slug`
- [ ] Carrusel completo de imágenes
- [ ] Información completa del paper
- [ ] Sección de comentarios
- [ ] Formulario de comentarios

### Fase 6: Integración con Supabase (2-3 horas)
- [ ] Configurar Supabase client en JavaScript
- [ ] Cargar papers desde la API
- [ ] Cargar comentarios
- [ ] Enviar nuevos comentarios
- [ ] Manejo de errores

### Fase 7: Seguridad y Validación (1-2 horas)
- [ ] Validación frontend
- [ ] reCAPTCHA (opcional)
- [ ] Rate limiting (opcional)
- [ ] Sanitización de HTML

### Fase 8: Testing y Ajustes (1-2 horas)
- [ ] Probar en diferentes navegadores
- [ ] Probar responsive (mobile, tablet, desktop)
- [ ] Probar funcionalidad de comentarios
- [ ] Ajustes de diseño

**Total estimado: 12-18 horas de desarrollo**

---

## 📝 Formato para Enviar la Información

Puedes enviarme la información en cualquier formato que te sea cómodo. Por ejemplo:

### Opción 1: Texto Simple
```
PAPER 1:
Título: Ecología de Virus Neotropicales
Slug: ecologia-virus-neotropicales
Abstract: [texto completo]
Autores: Andrés Díaz (1), María García (2)
Fecha: 2024-01-15
Journal: Nature
DOI: 10.1234/example
PDF: https://...
Imágenes:
  - image1.jpg (caption: "Muestra de campo")
  - image2.jpg (caption: "Análisis de datos")
```

### Opción 2: Archivo JSON
```json
{
  "authors": [
    {
      "name": "Andrés Felipe Díaz",
      "email": "afdiaz@lacienagalabs.com",
      "slug": "andres-diaz"
    }
  ],
  "papers": [
    {
      "title": "Ecología de Virus Neotropicales",
      "slug": "ecologia-virus-neotropicales",
      "abstract": "...",
      "authors": ["andres-diaz"],
      "publication_date": "2024-01-15"
    }
  ]
}
```

### Opción 3: Documento Word/Google Docs
- Puedes crear un documento con toda la información y compartirlo

---

## 🎯 ¿Cómo Prefieres Proceder?

**Opción A: Me das toda la información ahora**
- Inserte todo en Supabase
- Implemento el frontend completo
- Te muestro el resultado final

**Opción B: Implemento con datos de ejemplo primero**
- Creo la estructura completa
- Uso datos de ejemplo (que luego reemplazas)
- Tú insertas los datos reales después

**Opción C: Paso a paso**
- Implemento una parte
- Tú me das la información de esa parte
- Continuamos con la siguiente

---

## 💡 Recomendación

Te recomiendo la **Opción B**:
1. Implemento todo con datos de ejemplo
2. Te muestro cómo funciona
3. Tú me das los datos reales
4. Reemplazo los datos de ejemplo
5. ¡Listo!

Esto te permite ver cómo quedará antes de preparar toda la información.

---

¿Qué prefieres? ¿Tienes la información lista o prefieres que empiece con datos de ejemplo?

