import type { BlockType, PageBlock } from '@/shared/types/page-blocks';

/**
 * Module types that support the page builder
 */
export const editableModuleTypes = [
  'home',
  'about',
  'services',
  'contact',
] as const;

export type EditableModuleType = (typeof editableModuleTypes)[number];

/**
 * Configuration for each module type
 */
export interface ModuleConfig {
  label: string;
  description: string;
  availableBlocks: BlockType[];
  defaultBlocks: PageBlock[];
}

/**
 * Generate unique IDs for blocks
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Module configurations with available blocks and defaults
 */
export const moduleConfigs: Record<EditableModuleType, ModuleConfig> = {
  home: {
    label: 'Página de inicio',
    description: 'Tu página principal con hero, servicios y más',
    availableBlocks: ['hero', 'services', 'testimonials', 'pricing', 'faqs', 'cta'],
    defaultBlocks: [
      {
        id: generateId(),
        type: 'hero',
        order: 0,
        isVisible: true,
        content: {
          headline: 'Bienvenido a tu espacio',
          description: 'Descubre todo lo que tenemos para ofrecerte',
          ctaText: 'Comenzar',
          ctaUrl: '#services',
        },
      },
      {
        id: generateId(),
        type: 'services',
        order: 1,
        isVisible: true,
        content: {
          headline: 'Nuestros servicios',
          subheadline: 'Todo lo que necesitas en un solo lugar',
          services: [
            { id: generateId(), icon: 'Sparkles', title: 'Servicio 1', description: 'Descripción del servicio' },
            { id: generateId(), icon: 'Target', title: 'Servicio 2', description: 'Descripción del servicio' },
            { id: generateId(), icon: 'Zap', title: 'Servicio 3', description: 'Descripción del servicio' },
          ],
        },
      },
      {
        id: generateId(),
        type: 'cta',
        order: 2,
        isVisible: true,
        content: {
          headline: '¿Listo para empezar?',
          description: 'Contáctanos y te ayudaremos',
          primaryCtaText: 'Contactar',
          primaryCtaUrl: '#contact',
          style: 'centered',
        },
      },
    ],
  },

  about: {
    label: 'Sobre mí',
    description: 'Información personal o de tu negocio',
    availableBlocks: ['hero', 'services', 'testimonials', 'faqs', 'cta'],
    defaultBlocks: [
      {
        id: generateId(),
        type: 'hero',
        order: 0,
        isVisible: true,
        content: {
          headline: 'Sobre mí',
          description: 'Conoce mi historia y lo que me apasiona',
          ctaText: 'Contactar',
          ctaUrl: '#contact',
        },
      },
      {
        id: generateId(),
        type: 'services',
        order: 1,
        isVisible: true,
        content: {
          headline: 'Mi experiencia',
          subheadline: 'Áreas en las que me especializo',
          services: [
            { id: generateId(), icon: 'Award', title: 'Experiencia', description: 'Años de experiencia en el sector' },
            { id: generateId(), icon: 'Users', title: 'Clientes', description: 'Clientes satisfechos' },
            { id: generateId(), icon: 'Target', title: 'Proyectos', description: 'Proyectos completados' },
          ],
        },
      },
      {
        id: generateId(),
        type: 'cta',
        order: 2,
        isVisible: true,
        content: {
          headline: '¿Quieres saber más?',
          description: 'Estoy aquí para ayudarte',
          primaryCtaText: 'Contactar',
          primaryCtaUrl: '#contact',
          style: 'centered',
        },
      },
    ],
  },

  services: {
    label: 'Servicios',
    description: 'Lista detallada de tus servicios',
    availableBlocks: ['hero', 'services', 'pricing', 'testimonials', 'faqs', 'cta'],
    defaultBlocks: [
      {
        id: generateId(),
        type: 'hero',
        order: 0,
        isVisible: true,
        content: {
          headline: 'Mis servicios',
          description: 'Soluciones adaptadas a tus necesidades',
          ctaText: 'Ver precios',
          ctaUrl: '#pricing',
        },
      },
      {
        id: generateId(),
        type: 'services',
        order: 1,
        isVisible: true,
        content: {
          headline: 'Lo que ofrezco',
          subheadline: 'Servicios profesionales de calidad',
          services: [
            { id: generateId(), icon: 'Briefcase', title: 'Consultoría', description: 'Asesoramiento personalizado' },
            { id: generateId(), icon: 'PenTool', title: 'Diseño', description: 'Soluciones creativas' },
            { id: generateId(), icon: 'Code', title: 'Desarrollo', description: 'Implementación técnica' },
            { id: generateId(), icon: 'Headphones', title: 'Soporte', description: 'Ayuda continua' },
          ],
        },
      },
      {
        id: generateId(),
        type: 'pricing',
        order: 2,
        isVisible: true,
        content: {
          headline: 'Planes y precios',
          subheadline: 'Elige el plan que mejor se adapte a ti',
          tiers: [
            {
              id: generateId(),
              name: 'Básico',
              price: '99€',
              description: 'Para empezar',
              features: ['Característica 1', 'Característica 2', 'Soporte por email'],
              ctaText: 'Elegir',
              isHighlighted: false,
            },
            {
              id: generateId(),
              name: 'Profesional',
              price: '199€',
              description: 'Más popular',
              features: ['Todo del básico', 'Característica premium', 'Soporte prioritario'],
              ctaText: 'Elegir',
              isHighlighted: true,
            },
          ],
        },
      },
      {
        id: generateId(),
        type: 'cta',
        order: 3,
        isVisible: true,
        content: {
          headline: '¿Necesitas algo personalizado?',
          description: 'Cuéntame tu proyecto y te preparo un presupuesto',
          primaryCtaText: 'Solicitar presupuesto',
          primaryCtaUrl: '#contact',
          style: 'centered',
        },
      },
    ],
  },

  contact: {
    label: 'Contacto',
    description: 'Información de contacto y formulario',
    availableBlocks: ['hero', 'faqs', 'cta'],
    defaultBlocks: [
      {
        id: generateId(),
        type: 'hero',
        order: 0,
        isVisible: true,
        content: {
          headline: 'Contacta conmigo',
          description: 'Estoy aquí para ayudarte. Escríbeme y te responderé lo antes posible.',
        },
      },
      {
        id: generateId(),
        type: 'faqs',
        order: 1,
        isVisible: true,
        content: {
          headline: 'Preguntas frecuentes',
          faqs: [
            { id: generateId(), question: '¿Cuál es el tiempo de respuesta?', answer: 'Normalmente respondo en menos de 24 horas.' },
            { id: generateId(), question: '¿Ofrecen consulta gratuita?', answer: 'Sí, la primera consulta es sin compromiso.' },
            { id: generateId(), question: '¿Cómo puedo agendar una llamada?', answer: 'Puedes usar el formulario de contacto o escribirme directamente por email.' },
          ],
        },
      },
    ],
  },
};

/**
 * Check if a module type is editable with the page builder
 */
export function isEditableModule(moduleType: string): moduleType is EditableModuleType {
  return editableModuleTypes.includes(moduleType as EditableModuleType);
}

/**
 * Get the configuration for a module type
 */
export function getModuleConfig(moduleType: EditableModuleType): ModuleConfig {
  return moduleConfigs[moduleType];
}

/**
 * Get default content for a module type
 */
export function getDefaultModuleContent(moduleType: EditableModuleType): {
  version: 2;
  settings: { primaryColor: string; secondaryColor: string };
  draft: { blocks: PageBlock[]; lastModified: string };
  published: null;
} {
  const config = moduleConfigs[moduleType];

  // Generate fresh IDs for each call to avoid duplicates
  const blocks = config.defaultBlocks.map((block, index) => ({
    ...block,
    id: crypto.randomUUID(),
    order: index,
    content: {
      ...block.content,
      // Regenerate IDs for nested items
      ...(block.type === 'services' && {
        services: (block.content as { services: Array<{ id: string; icon: string; title: string; description: string }> }).services.map(s => ({
          ...s,
          id: crypto.randomUUID(),
        })),
      }),
      ...(block.type === 'pricing' && {
        tiers: (block.content as { tiers: Array<{ id: string; name: string; price: string; description?: string; features: string[]; ctaText: string; isHighlighted: boolean }> }).tiers.map(t => ({
          ...t,
          id: crypto.randomUUID(),
        })),
      }),
      ...(block.type === 'faqs' && {
        faqs: (block.content as { faqs: Array<{ id: string; question: string; answer: string }> }).faqs.map(f => ({
          ...f,
          id: crypto.randomUUID(),
        })),
      }),
      ...(block.type === 'testimonials' && {
        testimonials: (block.content as { testimonials: Array<{ id: string; quote: string; authorName: string; authorRole?: string }> }).testimonials?.map(t => ({
          ...t,
          id: crypto.randomUUID(),
        })),
      }),
    },
  })) as PageBlock[];

  return {
    version: 2,
    settings: {
      primaryColor: '#6366f1',
      secondaryColor: '#ffffff',
    },
    draft: {
      blocks,
      lastModified: new Date().toISOString(),
    },
    published: null,
  };
}
