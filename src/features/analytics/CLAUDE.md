# Feature: Analytics

## Propósito
Tracking de page views y eventos de usuario para analytics internos. Captura métricas de uso sin depender de servicios externos.

## Estado
✅ **Funcional** - Feature básica implementada.

## Estructura
```
analytics/
├── use-page-tracking.ts    # Hook para tracking de páginas
└── (sin CQRS - solo hooks)
```

## Dependencias
- **Tables**: `page_views`
- **APIs externas**: Ninguna
- **Features**: `attribution` (para datos de UTM)

## Notas
- Feature ligera que solo tiene un hook de tracking
- Los datos se envían a `/api/track`
- El cleanup de datos antiguos se hace via cron job en Supabase
