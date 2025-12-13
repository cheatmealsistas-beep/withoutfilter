# Feature: Owner Dashboard

## Propósito
Panel de administración para propietarios de organizaciones. Permite gestionar su app pública, ver métricas y configurar opciones.

## Estado
🚧 **Work in Progress** - Dashboard básico funcional.

## Estructura
```
owner-dashboard/
├── components/
│   ├── owner-dashboard.tsx   # Dashboard principal
│   └── index.ts
├── types/
│   └── index.ts
├── owner-dashboard.query.ts  # Queries de datos
└── index.ts
```

## Acceso
- Ruta: `/[locale]/app/[slug]/admin`
- Requiere: Usuario autenticado + ser owner de la organización

## Datos Mostrados
- Stats: visitas, módulos activos, estado de trial
- Quick actions: personalizar, módulos, settings, contenido
- Banner de trial si aplica

## Traducciones
Ubicación: `app/[locale]/(public)/app/[slug]/admin/copies/`

## Deuda Técnica
- [ ] Añadir gráficos de analytics
- [ ] Implementar panel de usuarios/miembros
- [ ] Añadir gestión de dominio personalizado
