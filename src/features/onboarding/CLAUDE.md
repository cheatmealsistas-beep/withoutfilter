# Feature: Onboarding

## Descripción

Wizard de onboarding multi-paso para profesionales (coaches, terapeutas, formadores, creadores, mentores) que crea su primera "app" en Modulary con URL personalizada y contenido default.

## Flujo del Usuario

```
Registro → Wizard (5 pasos) → Preview + Editor → Pricing/Checkout
                ↓ (skip)                              ↓
            Dashboard → Banner "Completa tu perfil"   ├── Pagar → Dashboard (plan activo)
                                                      └── Free trial → Dashboard (trial activo)
```

## Pasos del Wizard

| Paso | Pantalla | Datos | Guarda en |
|------|----------|-------|-----------|
| 0 | Bienvenida | `full_name` | `profiles.full_name` |
| 1 | Tipo profesional | `professional_type` | `profiles.professional_type` |
| 2 | Crear app | `app_name`, `slug` | Nueva `organization` (is_personal=false) |
| 3 | Logo (opcional) | `logo_url` | `organizations.logo_url` |
| 4 | Preview + Editor | Contenido home | `app_modules.content` (type='home') |

## Estructura de Archivos

```
src/features/onboarding/
├── CLAUDE.md                     # Este archivo
├── index.ts                      # Exports públicos
├── types/index.ts                # Zod schemas + tipos
├── onboarding.query.ts           # SELECT operations
├── onboarding.command.ts         # INSERT/UPDATE/DELETE
├── onboarding.handler.ts         # Business logic + validation
├── onboarding.actions.ts         # Server Actions
└── components/
    ├── index.ts
    ├── wizard-shell.tsx          # Container con progress bar
    ├── wizard-progress.tsx       # Barra de progreso animada
    ├── wizard-navigation.tsx     # Botones back/skip
    ├── slug-input.tsx            # Input con validación real-time
    └── steps/
        ├── index.ts
        ├── step-welcome.tsx      # Paso 0: nombre
        ├── step-professional-type.tsx  # Paso 1: tipo
        ├── step-app-setup.tsx    # Paso 2: app + slug
        ├── step-logo.tsx         # Paso 3: logo
        └── step-preview-editor.tsx  # Paso 4: preview + editar home
```

## Base de Datos

### Campos añadidos a profiles
- `professional_type`: coach, therapist, trainer, content_creator, mentor, other
- `onboarding_completed_at`: Timestamp cuando completó
- `onboarding_skipped_at`: Timestamp cuando saltó
- `onboarding_step`: Paso actual (0-4)

### Campos añadidos a organizations
- `logo_url`: URL del logo
- `tagline`: Tagline de la app
- `primary_color`: Color primario

### Nueva tabla app_modules
- `id`, `organization_id`, `type`, `is_enabled`, `is_public`, `display_order`, `content`
- Trigger `create_default_app_modules()` crea 8 módulos al crear app

## Decisiones de Arquitectura

| Decisión | Opción | Razón |
|----------|--------|-------|
| Persistencia | DB por paso | Resume desde cualquier dispositivo |
| Preview | Split view | Mejor UX para edición en tiempo real |
| Home default | Por tipo profesional | Personalización automática |
| Módulos | Trigger crea defaults | Consistencia garantizada |

## Testing Checklist

- [ ] Happy path: Registro → Wizard completo → Pricing
- [ ] Skip: Registro → Skip → Dashboard con banner
- [ ] Resume: Empezar → Salir → Volver → Continúa desde paso guardado
- [ ] Slug: Validación real-time, slug tomado muestra error
- [ ] Home: Contenido default según tipo profesional
- [ ] Preview: Edición en tiempo real con auto-save
- [ ] Mobile: Responsive con tabs Edit/Preview
- [ ] A11y: Navegable con teclado

## Deuda Técnica

- [ ] Upload de logo a Supabase Storage (actualmente solo preview local)
- [ ] Integrar traducciones en componentes (los archivos JSON existen)

## Troubleshooting

**Usuario no ve wizard después de registro:**
- Verificar que `onboarding_completed_at` y `onboarding_skipped_at` son NULL
- Verificar redirección en `(app)/layout.tsx`

**Módulos no se crean al crear app:**
- Verificar trigger `on_organization_created_modules` existe
- Verificar que `is_personal = false` en la nueva organization

**Slug siempre aparece como "tomado":**
- Verificar RLS permite SELECT en organizations
- Verificar conexión a Supabase
