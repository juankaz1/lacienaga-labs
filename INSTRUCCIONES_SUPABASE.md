# 📋 Instrucciones para Configurar Supabase - Paso a Paso

## ✅ Ya tienes:
- ✅ Proyecto creado en Supabase: `blog-pubs-web`
- ✅ Project URL: `https://geuvgqmkgclvtxijwejl.supabase.co`
- ✅ API Key: `sb_publishable_1_o-nCXbLm9H4zu3-Cul7Q_vidiiEq_`

---

## 🔧 Paso 1: Ejecutar SQL para Crear Tablas

1. **En Supabase Dashboard:**
   - En el menú lateral izquierdo, haz clic en **"SQL Editor"** (ícono de `</>` o "Database" → "SQL Editor")
   
2. **Crear un nuevo query:**
   - Haz clic en **"New query"** o el botón **"+"**
   
3. **Copiar y pegar el script:**
   - Abre el archivo `setup_supabase.sql` en tu editor
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pégalo en el SQL Editor de Supabase (Ctrl+V)
   
4. **Ejecutar:**
   - Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)
   - Deberías ver un mensaje de éxito: "Success. No rows returned"
   
5. **Verificar:**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver las tablas creadas: `authors`, `papers`, `paper_authors`, `paper_images`, `comments`, `tags`, `paper_tags`

---

## 📊 Paso 2: Insertar Datos Iniciales

1. **En SQL Editor:**
   - Crea otro nuevo query (botón **"+"**)
   
2. **Copiar y pegar:**
   - Abre el archivo `insert_datos_iniciales.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   
3. **Ejecutar:**
   - Haz clic en **"Run"**
   - Deberías ver mensajes de éxito
   
4. **Verificar:**
   - Ve a **"Table Editor"** → **"authors"**
   - Deberías ver 3 autores
   - Ve a **"Table Editor"** → **"papers"**
   - Deberías ver 6 papers

---

## 🔑 Paso 3: Configurar Credenciales en el Código

**Ya está hecho!** Las credenciales ya están actualizadas en `blog.js`:
- ✅ URL: `https://geuvgqmkgclvtxijwejl.supabase.co`
- ✅ API Key: `sb_publishable_1_o-nCXbLm9H4zu3-Cul7Q_vidiiEq_`

---

## 🖼️ Paso 4: Imágenes (Opcional - Por Ahora)

**Por ahora, las imágenes se cargan desde carpetas locales** (`images_papers/`).

**Más adelante puedes:**
1. Crear un bucket en Supabase Storage llamado `paper-images`
2. Subir las imágenes
3. Insertar las URLs en la tabla `paper_images`

**Por ahora, NO necesitas hacer nada con las imágenes.**

---

## ❤️ Paso 4.5: Activar Likes + (Opcional) Imagen en Comentarios

1. En Supabase → **SQL Editor** → **New query**
2. Copia y pega el contenido de `supabase_migration_likes_comments.sql`
3. Ejecuta **Run**

Esto crea:
- Tabla `likes` (1 like por navegador usando `client_id`)
- Columna opcional `comments.image_url` (por si luego subimos imágenes a Storage)

---

## ✅ Paso 5: Probar

1. **Abre `index.html` en tu navegador**
2. **Abre la consola del navegador (F12)**
3. **Busca:**
   - `[blog.js] Script cargado...`
   - `[initBlog] Iniciando blog...`
   - `[initBlog] Papers cargados: 6`
   
4. **Deberías ver:**
   - ✅ 2 papers en el preview
   - ✅ Botón "Ver más publicaciones"
   - ✅ Al hacer clic, ver los otros 4 papers
   - ✅ Likes se guardan (el contador sube y queda persistente en DB)
   - ✅ Comentarios se guardan (requiere nombre + email; email no se muestra públicamente)

---

## 🐛 Si algo no funciona:

### Error: "Supabase no configurado"
- Verifica que las credenciales en `blog.js` sean correctas
- Verifica que el proyecto esté activo en Supabase

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Verifica que las políticas RLS estén configuradas (ya están en `setup_supabase.sql`)

### No se muestran papers
- Verifica en Supabase → Table Editor → papers que los papers tengan `status = 'published'`
- Revisa la consola del navegador para errores

### Las imágenes no se cargan
- Por ahora, las imágenes se cargan desde carpetas locales
- Verifica que las carpetas `images_papers/` existan y tengan las imágenes

---

## 📝 Resumen de Archivos:

1. **`setup_supabase.sql`** → Ejecutar PRIMERO (crea tablas)
2. **`insert_datos_iniciales.sql`** → Ejecutar SEGUNDO (inserta datos)
3. **`blog.js`** → Ya tiene las credenciales configuradas ✅

---

## 🎯 Siguiente Paso:

Una vez que hayas ejecutado los SQLs y verificado que los datos estén en Supabase, **prueba abriendo `index.html`** y deberías ver los papers cargándose desde Supabase en lugar de los datos de ejemplo.

