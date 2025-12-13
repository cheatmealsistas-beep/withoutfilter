# Feature: Public App

## Propósito
Renderización de las páginas públicas de las organizaciones. Muestra el contenido creado con el page-builder.

## Estado
✅ **Funcional** - Sistema de renderizado completo.

## Estructura
```
public-app/
├── components/
│   ├── blocks/               # Componentes de renderizado de bloques
│   │   ├── hero-block.tsx
│   │   ├── services-block.tsx
│   │   ├── testimonials-block.tsx
│   │   ├── pricing-block.tsx
│   │   ├── faqs-block.tsx
│   │   ├── cta-block.tsx
│   │   └── index.ts
│   ├── public-blocks.tsx     # Orquestador de bloques
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Dependencias
- **Types**: `shared/types/page-blocks` (tipos de bloques)
- **Tables**: `organizations`, `app_modules`

## Rutas
Las páginas públicas se sirven en:
- `/[locale]/app/[slug]` - Landing principal
- `/[locale]/app/[slug]/[page]` - Páginas secundarias

## Uso
```typescript
import { PublicBlocks } from '@/features/public-app/components';

<PublicBlocks blocks={blocks} settings={settings} />
```

## Notas
- Los bloques son componentes cliente para interactividad
- Los colores del tema se aplican via inline styles
- Cada bloque es responsive por defecto
