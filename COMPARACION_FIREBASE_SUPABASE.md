# Comparación Detallada: Firebase vs Supabase

## 📊 Planes Gratuitos - Comparación Directa

### Firebase (Plan Spark - Gratuito)
- **Base de datos (Firestore)**: 
  - 1 GB almacenamiento
  - 50,000 lecturas/día
  - 20,000 escrituras/día
  - 20,000 eliminaciones/día
- **Storage (archivos/imágenes)**:
  - 5 GB almacenamiento
  - 1 GB descarga/día
- **Autenticación**: 10,000 usuarios autenticados
- **Hosting**: 10 GB almacenamiento, 360 MB/día transferencia
- **Funciones Cloud**: 125,000 invocaciones/mes

### Supabase (Plan Free)
- **Base de datos (PostgreSQL)**:
  - 500 MB almacenamiento
  - Sin límite de operaciones (dentro del almacenamiento)
- **Storage (archivos/imágenes)**:
  - 1 GB almacenamiento
  - 5 GB transferencia/mes
- **Autenticación**: 50,000 usuarios activos mensuales
- **Proyectos**: 2 proyectos gratuitos
- **API requests**: Sin límite específico (dentro de recursos)

## 🔒 Seguridad - Prevención de Inyecciones

### Firebase Security Rules
```javascript
// Ejemplo de reglas de seguridad Firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Comentarios: solo lectura pública, escritura con validación
    match /comments/{commentId} {
      allow read: if true; // Público puede leer
      allow create: if request.resource.data.keys().hasAll(['paper_id', 'author_name', 'content'])
                   && request.resource.data.content.size() > 0
                   && request.resource.data.content.size() < 5000
                   && request.resource.data.author_name.size() > 0
                   && request.resource.data.author_name.size() < 100;
      allow update, delete: if false; // Solo creación, no edición/eliminación
    }
  }
}
```

**Protección contra inyecciones:**
- ✅ Firestore automáticamente escapa datos
- ✅ Reglas de seguridad previenen acceso no autorizado
- ✅ Validación de tipos de datos
- ⚠️ Necesitas validar manualmente en el frontend
- ⚠️ NoSQL = menos riesgo de SQL injection (no aplica)

### Supabase Row Level Security (RLS)
```sql
-- Ejemplo de política RLS para comentarios
CREATE POLICY "Comentarios públicos lectura"
ON comments FOR SELECT
USING (status = 'approved');

CREATE POLICY "Comentarios creación pública"
ON comments FOR INSERT
WITH CHECK (
  length(content) > 0 AND length(content) < 5000
  AND length(author_name) > 0 AND length(author_name) < 100
  AND author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Prevención SQL Injection: Supabase usa consultas parametrizadas automáticamente
```

**Protección contra inyecciones:**
- ✅ PostgreSQL con consultas parametrizadas (automático)
- ✅ Row Level Security (RLS) para control granular
- ✅ Validación a nivel de base de datos (constraints)
- ✅ Sanitización automática en la API
- ✅ Puedes agregar triggers para validación adicional

## 💰 Costos a Largo Plazo

### Firebase (Plan Blaze - Pago por uso)
- **Problema**: Costos impredecibles
- **Ejemplo**: Si tienes 100,000 lecturas/día = $0.06/día × 30 = $1.80/mes solo en lecturas
- **Escalado**: Puede volverse costoso rápidamente
- **Ventaja**: Solo pagas lo que usas

### Supabase (Plan Pro - $25/mes)
- **Ventaja**: Costos predecibles
- **Incluye**: 8 GB DB, 100 GB storage, 50 GB transferencia
- **Escalado**: Sabes exactamente cuánto pagarás
- **Desventaja**: Tienes que pagar aunque no uses todo

## 🏗️ Arquitectura y Hosting

### Opción 1: Mantener GitHub Pages + Backend
- **Frontend**: GitHub Pages (gratis, ilimitado)
- **Backend**: Firebase o Supabase
- **Ventaja**: Separación clara, fácil de mantener
- **Desventaja**: CORS puede ser un tema (pero se resuelve)

### Opción 2: Firebase Hosting + Firebase Backend
- **Todo integrado**: Frontend + Backend en Firebase
- **Ventaja**: Todo en un solo lugar, fácil deploy
- **Desventaja**: Pierdes GitHub Pages (aunque puedes mantenerlo para desarrollo)

### Opción 3: Supabase + GitHub Pages
- **Frontend**: GitHub Pages
- **Backend**: Supabase
- **Ventaja**: Código abierto, más control
- **Desventaja**: Dos servicios separados

## 🎯 Recomendación para Tu Caso

### Para 9 papers iniciales (creciendo a más):

**Firebase sería mejor si:**
- Quieres todo integrado (hosting + backend)
- Prefieres NoSQL (más flexible para cambios)
- Te sientes cómodo con el ecosistema Google
- No te preocupa mucho el costo a largo plazo

**Supabase sería mejor si:**
- Quieres mantener GitHub Pages
- Prefieres SQL (mejor para relaciones complejas)
- Quieres costos predecibles
- Te importa el código abierto

### Mi Recomendación: **Supabase**

**Razones:**
1. ✅ Mantienes GitHub Pages (ya funciona bien)
2. ✅ PostgreSQL es mejor para relaciones (papers → autores → comentarios)
3. ✅ Costos predecibles ($0 ahora, $25/mes cuando crezcas)
4. ✅ Row Level Security es muy potente para seguridad
5. ✅ SQL injection no es problema (consultas parametrizadas automáticas)
6. ✅ API REST automática (no necesitas escribir backend)

## 🔐 Medidas de Seguridad Adicionales (Ambas Plataformas)

1. **Validación en Frontend**:
   - Sanitizar HTML (usar DOMPurify)
   - Validar emails con regex
   - Limitar longitud de campos

2. **Rate Limiting**:
   - Limitar comentarios por IP
   - Implementar CAPTCHA (reCAPTCHA v3)

3. **Moderación**:
   - Comentarios en estado "pending" por defecto
   - Revisión manual antes de aprobar
   - Blacklist de palabras

4. **Monitoreo**:
   - Logs de comentarios sospechosos
   - Alertas por actividad inusual

