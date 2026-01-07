// ============================================================================
// Supabase Config (EJEMPLO)
// ============================================================================
// Copia este archivo como `supabase-config.js` y rellena tus valores.
//
// IMPORTANTE:
// - Esto NO es secreto en GitHub Pages (frontend). Es normal que sea público.
// - Usa una key pública (anon o publishable) + RLS en Supabase.
// - NUNCA uses la `service_role` key en el frontend.
// ============================================================================

window.SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';

// Opción A (recomendada por compatibilidad): anon public key (JWT largo que empieza por "eyJ...")
window.SUPABASE_ANON_KEY = 'TU_ANON_PUBLIC_KEY';

// Opción B (si tu proyecto usa publishable keys): también funciona si Supabase lo recomienda en tu panel
// window.SUPABASE_ANON_KEY = 'sb_publishable_...';


