# TODO - Fixes Pendientes

Fixes pendientes de desarrollo (bloqueados por refactor en curso).

---

## Public App / Navbar

### Módulo de contenido en navbar público
- [x] Cuando se activa el módulo "courses/contenido", debe aparecer entrada en el navbar público
  - Se activa automáticamente al publicar un curso (courses.command.ts)
- [ ] El owner debería poder personalizar el nombre de esa entrada (ej: "Cursos", "Academia", "Formación")
- [x] La página `/courses` debe mostrar preview de los cursos creados

**Archivos relacionados:**
- `src/features/public-app/components/public-navbar.tsx`
- `src/app/[locale]/(public)/app/[slug]/courses/page.tsx`
- `src/features/courses/courses.command.ts` (publishCourse)

### Botón "Admin" en navbar
- [x] ~~Eliminar botón "Ir a dashboard" del navbar~~
  - El botón "Admin" es útil para que el owner acceda rápido a su panel
  - NO eliminar - es funcionalidad deseada

**Archivos relacionados:**
- `src/features/public-app/components/public-navbar.tsx`

### Logo del usuario
- [x] El logo configurado por el usuario ahora se sube a Supabase Storage
- [x] Se muestra en navbar público y owner dashboard
- [x] Añadida sección de cambio de logo en Settings del owner

**Archivos relacionados:**
- `src/features/public-app/components/public-navbar.tsx`
- `src/features/owner-dashboard/components/owner-dashboard.tsx`
- `src/features/owner-dashboard/components/organization-settings.tsx`
- `src/features/onboarding/components/steps/step-logo.tsx`
- `src/shared/lib/storage.ts`
- `supabase/migrations/20251213000002_organization_logos_storage.sql`

---

## Page Builder

### Iconos en cards de servicios
- [ ] Permitir al usuario seleccionar iconos para las cards de servicios
- [ ] Ofrecer biblioteca de iconos (Lucide, custom, etc.)

**Archivos relacionados:**
- `src/features/page-builder/components/`
- `src/features/public-app/components/blocks/services-block.tsx`

### Ilustraciones en bloques de texto
- [ ] Permitir añadir ilustraciones/imágenes en los bloques de texto
- [ ] Opción de posición (izquierda, derecha, arriba, abajo)

**Archivos relacionados:**
- `src/features/page-builder/components/`
- `src/features/public-app/components/blocks/`

---

## Compliance (GDPR / ePrivacy / DSA)

### Cookies & Consent (ePrivacy)
- [ ] Banner de cookies con consentimiento previo (opt-in)
- [ ] Crisp, analytics, etc. no deben cargar sin consentimiento
- [ ] Panel de configuración de preferencias de cookies
- [ ] Guardar preferencias del usuario

### GDPR - Derechos del usuario
- [ ] Página de política de privacidad
- [ ] Derecho de acceso (descargar mis datos)
- [ ] Derecho de eliminación (borrar cuenta y todos los datos)
- [ ] Derecho de portabilidad (exportar datos en formato estándar)
- [ ] Derecho de rectificación (editar datos personales)

### GDPR - Transparencia
- [ ] Información clara sobre qué datos se recogen
- [ ] Finalidad del tratamiento de cada dato
- [ ] Base legal del tratamiento
- [ ] Tiempo de retención de datos
- [ ] Terceros con acceso a datos (Supabase, Stripe, Crisp, etc.)

### Términos legales
- [ ] Términos y condiciones del SaaS
- [ ] Términos para owners que usan la plataforma
- [ ] Aviso legal / Imprint

### DSA (Digital Services Act) - si aplica como plataforma
- [ ] Mecanismo de denuncia de contenido ilegal
- [ ] Transparencia en moderación de contenido
- [ ] Punto de contacto para autoridades

**Notas:**
- Supabase debe estar configurado en región EU
- Revisar si Stripe, Vercel, Crisp tienen DPA (Data Processing Agreement)
- Considerar usar Cookiebot, Osano o similar para gestión de cookies

---

## Otros

_(Añadir aquí otros fixes según se detecten)_
