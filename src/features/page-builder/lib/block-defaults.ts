import type {
  BlockType,
  HeroBlock,
  ServicesBlock,
  TestimonialsBlock,
  PricingBlock,
  FaqsBlock,
  CtaBlock,
  PageBlock,
} from '../types';

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a default Hero block
 */
export function createDefaultHeroBlock(order: number): HeroBlock {
  return {
    id: generateId(),
    type: 'hero',
    order,
    isVisible: true,
    content: {
      headline: 'Bienvenido a mi página',
      description: 'Descubre lo que puedo ofrecerte',
      ctaText: 'Contactar',
      ctaUrl: '#contacto',
    },
  };
}

/**
 * Create a default Services block
 */
export function createDefaultServicesBlock(order: number): ServicesBlock {
  return {
    id: generateId(),
    type: 'services',
    order,
    isVisible: true,
    content: {
      headline: 'Mis Servicios',
      subheadline: 'Soluciones adaptadas a tus necesidades',
      services: [
        {
          id: generateId(),
          icon: 'Sparkles',
          title: 'Servicio 1',
          description: 'Descripción breve del primer servicio que ofreces.',
        },
        {
          id: generateId(),
          icon: 'Zap',
          title: 'Servicio 2',
          description: 'Descripción breve del segundo servicio que ofreces.',
        },
        {
          id: generateId(),
          icon: 'Heart',
          title: 'Servicio 3',
          description: 'Descripción breve del tercer servicio que ofreces.',
        },
      ],
    },
  };
}

/**
 * Create a default Testimonials block
 */
export function createDefaultTestimonialsBlock(order: number): TestimonialsBlock {
  return {
    id: generateId(),
    type: 'testimonials',
    order,
    isVisible: true,
    content: {
      headline: 'Lo que dicen mis clientes',
      testimonials: [
        {
          id: generateId(),
          quote: 'Una experiencia increíble. Totalmente recomendado.',
          authorName: 'María García',
          authorRole: 'Emprendedora',
          rating: 5,
        },
        {
          id: generateId(),
          quote: 'Profesionalidad y resultados garantizados.',
          authorName: 'Carlos López',
          authorRole: 'CEO',
          rating: 5,
        },
      ],
    },
  };
}

/**
 * Create a default Pricing block
 */
export function createDefaultPricingBlock(order: number): PricingBlock {
  return {
    id: generateId(),
    type: 'pricing',
    order,
    isVisible: true,
    content: {
      headline: 'Planes y Precios',
      subheadline: 'Elige el plan que mejor se adapte a ti',
      tiers: [
        {
          id: generateId(),
          name: 'Básico',
          price: '29€/mes',
          description: 'Perfecto para empezar',
          features: ['Característica 1', 'Característica 2', 'Característica 3'],
          ctaText: 'Empezar',
          isHighlighted: false,
        },
        {
          id: generateId(),
          name: 'Pro',
          price: '79€/mes',
          description: 'Para profesionales',
          features: [
            'Todo lo del plan Básico',
            'Característica premium 1',
            'Característica premium 2',
            'Soporte prioritario',
          ],
          ctaText: 'Elegir Pro',
          isHighlighted: true,
        },
      ],
    },
  };
}

/**
 * Create a default FAQs block
 */
export function createDefaultFaqsBlock(order: number): FaqsBlock {
  return {
    id: generateId(),
    type: 'faqs',
    order,
    isVisible: true,
    content: {
      headline: 'Preguntas Frecuentes',
      faqs: [
        {
          id: generateId(),
          question: '¿Cómo puedo empezar?',
          answer:
            'Es muy sencillo. Solo tienes que contactarme y agendaremos una primera sesión para conocer tus necesidades.',
        },
        {
          id: generateId(),
          question: '¿Cuánto tiempo tarda en verse resultados?',
          answer:
            'Depende de cada caso, pero normalmente los primeros resultados se ven en las primeras semanas.',
        },
        {
          id: generateId(),
          question: '¿Ofrecéis garantía?',
          answer:
            'Sí, ofrecemos garantía de satisfacción. Si no estás contento, te devolvemos el dinero.',
        },
      ],
    },
  };
}

/**
 * Create a default CTA block
 */
export function createDefaultCtaBlock(order: number): CtaBlock {
  return {
    id: generateId(),
    type: 'cta',
    order,
    isVisible: true,
    content: {
      headline: '¿Listo para empezar?',
      description: 'Da el primer paso hacia tus objetivos',
      primaryCtaText: 'Contactar ahora',
      primaryCtaUrl: '#contacto',
      style: 'centered',
    },
  };
}

/**
 * Create a default block based on type
 */
export function createDefaultBlock(type: BlockType, order: number): PageBlock {
  switch (type) {
    case 'hero':
      return createDefaultHeroBlock(order);
    case 'services':
      return createDefaultServicesBlock(order);
    case 'testimonials':
      return createDefaultTestimonialsBlock(order);
    case 'pricing':
      return createDefaultPricingBlock(order);
    case 'faqs':
      return createDefaultFaqsBlock(order);
    case 'cta':
      return createDefaultCtaBlock(order);
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}
