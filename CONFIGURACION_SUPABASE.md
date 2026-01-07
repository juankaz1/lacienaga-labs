# Configuración de Supabase

## 📋 Pasos para Configurar Supabase

### 1. Crear Cuenta y Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Anota tu:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (la encontrarás en Settings > API)

### 2. Ejecutar Script SQL

1. En Supabase, ve a **SQL Editor**
2. Copia el contenido de `setup_supabase.sql`
3. Pega y ejecuta el script
4. Verifica que se hayan creado las tablas

### 3. Configurar Storage (para imágenes)

1. Ve a **Storage** en el menú lateral
2. Crea un nuevo bucket llamado `paper-images`
3. Configura las políticas:
   - **Public Access**: Habilitado (para que las imágenes sean públicas)
   - O crea políticas RLS si prefieres más control

### 4. Configurar Credenciales en el Código

Edita `blog.js` y reemplaza:

```javascript
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';
```

Con tus credenciales reales:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key-aqui';
```

### 5. Insertar Datos Iniciales

Usa el SQL Editor para insertar:

#### Autores:
```sql
INSERT INTO authors (name, slug, email) VALUES
('Andrés Felipe Diaz Delgadillo', 'andres-felipe-diaz-delgadillo', 'afdiaz@lacienagalabs.com'),
('Juan Carlos Linares Rugeles', 'juan-carlos-linares-rugeles', NULL),
('Ramón Orlando Alvarez Burgos', 'ramon-orlando-alvarez-burgos', NULL);
```

#### Papers:
Ver `DATOS_PAPERS_ESTRUCTURADOS.md` para los INSERTs completos.

### 6. Subir Imágenes

1. Ve a **Storage** > `paper-images`
2. Sube las imágenes de cada paper
3. Copia las URLs públicas
4. Inserta en la tabla `paper_images`:

```sql
INSERT INTO paper_images (paper_id, image_url, caption, alt_text, display_order)
VALUES (
    'uuid-del-paper',
    'https://xxxxx.supabase.co/storage/v1/object/public/paper-images/imagen1.jpg',
    'Descripción de la imagen',
    'Texto alternativo',
    0
);
```

## 🔒 Seguridad

Las políticas RLS ya están configuradas en el script SQL:
- ✅ Lectura pública de papers publicados
- ✅ Lectura pública de comentarios aprobados
- ✅ Creación pública de comentarios (se publican inmediatamente)
- ✅ Actualización/eliminación permitida (puedes restringir después)

## ✅ Verificación

1. Abre `index.html` en el navegador
2. Ve a la sección "Publicaciones"
3. Deberías ver los papers cargándose desde Supabase
4. Si no funciona, revisa la consola del navegador (F12) para errores

## 🐛 Troubleshooting

### Error: "Supabase no configurado"
- Verifica que hayas reemplazado `TU_SUPABASE_URL` y `TU_SUPABASE_ANON_KEY`

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Verifica que el proyecto esté activo en Supabase

### No se muestran papers
- Verifica que los papers tengan `status = 'published'`
- Revisa la consola del navegador para errores
- Verifica las políticas RLS en Supabase

### Imágenes no se cargan
- Verifica que el bucket `paper-images` exista
- Verifica que las URLs en `paper_images` sean correctas
- Verifica que el bucket tenga acceso público o políticas RLS correctas

