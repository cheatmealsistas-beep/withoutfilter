# Feature: Page Builder

## Propósito
Editor visual para construir landing pages con bloques predefinidos. Permite a los usuarios crear páginas sin código.

## Estado
🚧 **Work in Progress** - Editor funcional, faltan algunas funcionalidades.

## Estructura
```
page-builder/
├── components/
│   ├── editors/              # Editores de cada tipo de bloque
│   │   ├── hero-editor.tsx
│   │   ├── services-editor.tsx
│   │   └── ...
│   ├── preview/
│   │   └── page-preview.tsx  # Vista previa
│   └── block-palette.tsx     # Paleta de bloques
├── types/
│   └── index.ts              # Re-exporta de shared/types/page-blocks
└── index.ts
```

## Tipos de Bloques
- `hero`: Cabecera principal con CTA
- `services`: Grid de servicios/características
- `testimonials`: Testimonios de clientes
- `pricing`: Tabla de precios
- `faqs`: Preguntas frecuentes (accordion)
- `cta`: Call-to-action

## Arquitectura
- Los tipos de bloques están en `shared/types/page-blocks.ts`
- Los componentes de renderizado están en `features/public-app/components/blocks`
- Este feature solo contiene los editores

## Almacenamiento
El contenido se guarda en `app_modules.content` con formato:
```json
{
  "version": 2,
  "settings": { "primaryColor": "#6366f1", "secondaryColor": "#ffffff" },
  "draft": { "blocks": [...], "lastModified": "..." },
  "published": { "blocks": [...], "publishedAt": "..." }
}
```

## Notas
- Soporta draft/published workflow
- Los editores usan React Hook Form + Zod
