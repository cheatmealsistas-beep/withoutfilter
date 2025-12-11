/**
 * Modulary Landing Page Content
 * Platform for coaches, trainers, creators, and therapists to build apps without code
 */

import type {
  HeroContent,
  ProblemSectionContent,
  TargetUsersSectionContent,
  SolutionSectionContent,
  AISectionContent,
  UseCasesSectionContent,
  ModulesSectionContent,
  HowItWorksContent,
  PricingContent,
  FAQContent,
  SectionContent
} from '../types/sections';

// ============================================
// HERO SECTION
// ============================================
export const modularityHero: SectionContent<HeroContent> = {
  id: 'hero-modulary',
  enabled: true,
  order: 1,
  content: {
    headline: {
      en: 'Your Knowledge, Unified.',
      es: 'Tu Conocimiento, Unificado.'
    },
    headlineHighlight: {
      en: 'No Code Required.',
      es: 'Sin Necesidad de Código.'
    },
    subheadline: {
      en: 'Stop juggling 10 tools. Build your branded app where courses, clients, and content live in one place—ready in minutes.',
      es: 'Deja de lidiar con 10 herramientas. Crea tu app personalizada donde cursos, clientes y contenido viven en un solo lugar—lista en minutos.'
    },
    ctaPrimary: {
      text: {
        en: 'Build Your App in 10 Minutes',
        es: 'Crea Tu App en 10 Minutos'
      },
      href: '/register',
      style: 'default'
    },
    ctaSecondary: {
      text: {
        en: 'See How It Works',
        es: 'Ver Cómo Funciona'
      },
      href: '#how-it-works',
      style: 'outline'
    },
    socialProofText: {
      en: 'Join 1,000+ coaches and creators who unified their workflow',
      es: 'Únete a más de 1,000 coaches y creadores que unificaron su flujo de trabajo'
    },
    illustration: {
      type: 'fragmentation-to-unity'
    }
  }
};

// ============================================
// PROBLEM SECTION
// ============================================
export const modularityProblem: SectionContent<ProblemSectionContent> = {
  id: 'problem',
  enabled: true,
  order: 2,
  content: {
    headline: {
      en: 'The Challenge Professionals Face',
      es: 'El Desafío que Enfrentan los Profesionales'
    },
    subheadline: {
      en: 'Building custom solutions shouldn\'t require a development team',
      es: 'Crear soluciones personalizadas no debería requerir un equipo de desarrollo'
    },
    problems: [
      {
        id: 'technical-barriers',
        icon: 'Code',
        title: {
          en: 'Technical Barriers',
          es: 'Barreras Técnicas'
        },
        description: {
          en: 'Need a developer for every small change or new feature you want to add',
          es: 'Necesitas un desarrollador para cada pequeño cambio o nueva funcionalidad'
        }
      },
      {
        id: 'expensive-development',
        icon: 'DollarSign',
        title: {
          en: 'Expensive Development',
          es: 'Desarrollo Costoso'
        },
        description: {
          en: 'Hiring developers costs thousands. Agencies charge even more for basic apps.',
          es: 'Contratar desarrolladores cuesta miles. Las agencias cobran aún más por apps básicas.'
        }
      },
      {
        id: 'generic-solutions',
        icon: 'Package',
        title: {
          en: 'Generic Solutions',
          es: 'Soluciones Genéricas'
        },
        description: {
          en: 'Existing platforms force you into templates that don\'t fit your unique workflow',
          es: 'Las plataformas existentes te obligan a usar plantillas que no se ajustan a tu flujo'
        }
      },
      {
        id: 'slow-iterations',
        icon: 'Clock',
        title: {
          en: 'Slow Iterations',
          es: 'Iteraciones Lentas'
        },
        description: {
          en: 'Weeks or months to make changes. Your ideas lose momentum.',
          es: 'Semanas o meses para hacer cambios. Tus ideas pierden impulso.'
        }
      }
    ]
  }
};

// ============================================
// TARGET USERS SECTION
// ============================================
export const modularityTargetUsers: SectionContent<TargetUsersSectionContent> = {
  id: 'target-users',
  enabled: true,
  order: 3,
  content: {
    headline: {
      en: 'Built for Professionals Like You',
      es: 'Creado para Profesionales Como Tú'
    },
    subheadline: {
      en: 'Whether you\'re coaching, training, creating content, or providing therapy—Modulary adapts to your needs',
      es: 'Ya sea que hagas coaching, entrenamiento, creación de contenido o terapia—Modulary se adapta a ti'
    },
    users: [
      {
        id: 'coaches',
        icon: 'Users',
        title: {
          en: 'Coaches',
          es: 'Coaches'
        },
        description: {
          en: 'Create personalized coaching apps with client portals, progress tracking, and automated workflows.',
          es: 'Crea apps de coaching personalizadas con portales de clientes, seguimiento de progreso y flujos automatizados.'
        }
      },
      {
        id: 'trainers',
        icon: 'Dumbbell',
        title: {
          en: 'Trainers & Fitness Pros',
          es: 'Entrenadores y Profesionales del Fitness'
        },
        description: {
          en: 'Build workout apps with exercise libraries, nutrition tracking, and client communication tools.',
          es: 'Construye apps de entrenamiento con bibliotecas de ejercicios, seguimiento nutricional y herramientas de comunicación.'
        }
      },
      {
        id: 'creators',
        icon: 'Sparkles',
        title: {
          en: 'Content Creators',
          es: 'Creadores de Contenido'
        },
        description: {
          en: 'Launch membership platforms, course delivery systems, and community spaces for your audience.',
          es: 'Lanza plataformas de membresía, sistemas de entrega de cursos y espacios comunitarios para tu audiencia.'
        }
      },
      {
        id: 'therapists',
        icon: 'Heart',
        title: {
          en: 'Therapists & Wellness',
          es: 'Terapeutas y Bienestar'
        },
        description: {
          en: 'Develop HIPAA-compliant tools for session notes, client progress, and secure communication.',
          es: 'Desarrolla herramientas compatibles con HIPAA para notas de sesión, progreso del cliente y comunicación segura.'
        }
      }
    ]
  }
};

// ============================================
// SOLUTION SECTION
// ============================================
export const modularitySolution: SectionContent<SolutionSectionContent> = {
  id: 'solution',
  enabled: true,
  order: 4,
  content: {
    headline: {
      en: 'Your Vision, Your App—No Code Required',
      es: 'Tu Visión, Tu App—Sin Código Requerido'
    },
    subheadline: {
      en: 'Modulary gives you the power to build professional-grade applications with a simple, intuitive interface',
      es: 'Modulary te da el poder de construir aplicaciones profesionales con una interfaz simple e intuitiva'
    },
    benefits: [
      {
        id: 'visual-builder',
        icon: 'Layout',
        title: {
          en: 'Visual Builder',
          es: 'Constructor Visual'
        },
        description: {
          en: 'Drag-and-drop interface to design your app exactly how you want it',
          es: 'Interfaz de arrastrar y soltar para diseñar tu app exactamente como la quieres'
        }
      },
      {
        id: 'pre-built-modules',
        icon: 'Blocks',
        title: {
          en: 'Pre-Built Modules',
          es: 'Módulos Pre-Construidos'
        },
        description: {
          en: 'Authentication, payments, forms, dashboards—all ready to use out of the box',
          es: 'Autenticación, pagos, formularios, dashboards—todo listo para usar desde el inicio'
        }
      },
      {
        id: 'instant-deployment',
        icon: 'Zap',
        title: {
          en: 'Instant Deployment',
          es: 'Despliegue Instantáneo'
        },
        description: {
          en: 'Publish your app to the web with one click. No servers, no configuration.',
          es: 'Publica tu app en la web con un clic. Sin servidores, sin configuración.'
        }
      },
      {
        id: 'fully-customizable',
        icon: 'Palette',
        title: {
          en: 'Fully Customizable',
          es: 'Totalmente Personalizable'
        },
        description: {
          en: 'Brand colors, fonts, layouts—make it truly yours without touching code',
          es: 'Colores de marca, tipografías, diseños—hazlo realmente tuyo sin tocar código'
        }
      }
    ],
    cta: {
      text: {
        en: 'Explore Features',
        es: 'Explorar Funcionalidades'
      },
      href: '#modules'
    }
  }
};

// ============================================
// AI CAPABILITIES SECTION
// ============================================
export const modularityAI: SectionContent<AISectionContent> = {
  id: 'ai-capabilities',
  enabled: true,
  order: 5,
  content: {
    badge: {
      text: {
        en: 'AI-Powered',
        es: 'Potenciado por IA'
      },
      variant: 'secondary'
    },
    headline: {
      en: 'Intelligence Built In',
      es: 'Inteligencia Integrada'
    },
    subheadline: {
      en: 'Let AI handle the heavy lifting while you focus on your clients',
      es: 'Deja que la IA maneje el trabajo pesado mientras tú te enfocas en tus clientes'
    },
    capabilities: [
      {
        id: 'smart-suggestions',
        icon: 'Sparkles',
        title: {
          en: 'Smart Suggestions',
          es: 'Sugerencias Inteligentes'
        },
        description: {
          en: 'AI suggests the best modules and layouts based on your profession and goals',
          es: 'La IA sugiere los mejores módulos y diseños basados en tu profesión y objetivos'
        }
      },
      {
        id: 'auto-content',
        icon: 'FileText',
        title: {
          en: 'Content Generation',
          es: 'Generación de Contenido'
        },
        description: {
          en: 'Generate forms, emails, and copy tailored to your brand voice',
          es: 'Genera formularios, emails y textos adaptados a la voz de tu marca'
        },
        badge: {
          en: 'Beta',
          es: 'Beta'
        }
      },
      {
        id: 'workflow-automation',
        icon: 'Zap',
        title: {
          en: 'Workflow Automation',
          es: 'Automatización de Flujos'
        },
        description: {
          en: 'Set up automated sequences—onboarding, reminders, follow-ups—without code',
          es: 'Configura secuencias automatizadas—onboarding, recordatorios, seguimientos—sin código'
        }
      },
      {
        id: 'smart-analytics',
        icon: 'BarChart3',
        title: {
          en: 'Smart Analytics',
          es: 'Analíticas Inteligentes'
        },
        description: {
          en: 'AI-powered insights show what\'s working and where to improve engagement',
          es: 'Insights potenciados por IA muestran qué funciona y dónde mejorar el engagement'
        }
      }
    ]
  }
};

// ============================================
// USE CASES SECTION
// ============================================
export const modularityUseCases: SectionContent<UseCasesSectionContent> = {
  id: 'use-cases',
  enabled: true,
  order: 6,
  content: {
    headline: {
      en: 'Infinite Possibilities',
      es: 'Posibilidades Infinitas'
    },
    subheadline: {
      en: 'See how professionals are using Modulary to transform their services',
      es: 'Ve cómo los profesionales están usando Modulary para transformar sus servicios'
    },
    layout: 'grid',
    useCases: [
      {
        id: 'coaching-portal',
        title: {
          en: 'Coaching Client Portal',
          es: 'Portal de Clientes de Coaching'
        },
        description: {
          en: 'Secure client dashboard with goal tracking, progress reports, and 1:1 messaging',
          es: 'Dashboard seguro de clientes con seguimiento de objetivos, reportes de progreso y mensajería 1:1'
        },
        icon: 'Target',
        tags: [
          { en: 'Coaching', es: 'Coaching' },
          { en: 'Dashboard', es: 'Dashboard' }
        ]
      },
      {
        id: 'fitness-app',
        title: {
          en: 'Workout & Nutrition App',
          es: 'App de Entrenamiento y Nutrición'
        },
        description: {
          en: 'Custom exercise library, meal plans, progress photos, and client check-ins',
          es: 'Biblioteca de ejercicios personalizada, planes de comida, fotos de progreso y check-ins de clientes'
        },
        icon: 'Activity',
        tags: [
          { en: 'Fitness', es: 'Fitness' },
          { en: 'Tracking', es: 'Seguimiento' }
        ]
      },
      {
        id: 'course-platform',
        title: {
          en: 'Online Course Platform',
          es: 'Plataforma de Cursos Online'
        },
        description: {
          en: 'Host video lessons, quizzes, assignments, and certificates—all in one place',
          es: 'Hospeda lecciones en video, quizzes, tareas y certificados—todo en un lugar'
        },
        icon: 'GraduationCap',
        tags: [
          { en: 'Education', es: 'Educación' },
          { en: 'Content', es: 'Contenido' }
        ]
      },
      {
        id: 'therapy-tools',
        title: {
          en: 'Therapy Session Manager',
          es: 'Gestor de Sesiones de Terapia'
        },
        description: {
          en: 'HIPAA-compliant notes, scheduling, homework assignments, and secure file sharing',
          es: 'Notas compatibles con HIPAA, programación, tareas y compartición segura de archivos'
        },
        icon: 'ClipboardList',
        tags: [
          { en: 'Healthcare', es: 'Salud' },
          { en: 'Compliance', es: 'Cumplimiento' }
        ]
      },
      {
        id: 'membership-site',
        title: {
          en: 'Membership Community',
          es: 'Comunidad de Membresía'
        },
        description: {
          en: 'Recurring subscriptions, exclusive content, forums, and member directories',
          es: 'Suscripciones recurrentes, contenido exclusivo, foros y directorios de miembros'
        },
        icon: 'Users2',
        tags: [
          { en: 'Community', es: 'Comunidad' },
          { en: 'Subscription', es: 'Suscripción' }
        ]
      },
      {
        id: 'booking-system',
        title: {
          en: 'Booking & Scheduling',
          es: 'Reservas y Programación'
        },
        description: {
          en: 'Calendar integration, automated reminders, payments, and rescheduling tools',
          es: 'Integración de calendario, recordatorios automáticos, pagos y herramientas de reprogramación'
        },
        icon: 'Calendar',
        tags: [
          { en: 'Scheduling', es: 'Programación' },
          { en: 'Automation', es: 'Automatización' }
        ]
      }
    ]
  }
};

// ============================================
// MODULES SECTION
// ============================================
export const modularityModules: SectionContent<ModulesSectionContent> = {
  id: 'modules',
  enabled: true,
  order: 7,
  content: {
    headline: {
      en: 'Pre-Built Components, Infinite Combinations',
      es: 'Componentes Pre-Construidos, Combinaciones Infinitas'
    },
    subheadline: {
      en: 'Pick the modules you need and connect them together—no coding required',
      es: 'Elige los módulos que necesitas y conéctalos—sin código requerido'
    },
    modules: [
      {
        id: 'auth-module',
        name: {
          en: 'Authentication & Users',
          es: 'Autenticación y Usuarios'
        },
        description: {
          en: 'Secure login, user profiles, role management',
          es: 'Inicio de sesión seguro, perfiles de usuario, gestión de roles'
        },
        icon: 'Shield',
        category: {
          en: 'Core',
          es: 'Core'
        },
        badge: {
          en: 'Essential',
          es: 'Esencial'
        }
      },
      {
        id: 'payments-module',
        name: {
          en: 'Payments & Subscriptions',
          es: 'Pagos y Suscripciones'
        },
        description: {
          en: 'Stripe integration, recurring billing, invoices',
          es: 'Integración con Stripe, facturación recurrente, facturas'
        },
        icon: 'CreditCard',
        category: {
          en: 'Commerce',
          es: 'Comercio'
        },
        badge: {
          en: 'Popular',
          es: 'Popular'
        }
      },
      {
        id: 'forms-module',
        name: {
          en: 'Forms & Surveys',
          es: 'Formularios y Encuestas'
        },
        description: {
          en: 'Custom forms, conditional logic, file uploads',
          es: 'Formularios personalizados, lógica condicional, carga de archivos'
        },
        icon: 'FileInput',
        category: {
          en: 'Data Collection',
          es: 'Recolección de Datos'
        }
      },
      {
        id: 'messaging-module',
        name: {
          en: 'Messaging & Chat',
          es: 'Mensajería y Chat'
        },
        description: {
          en: 'Real-time chat, notifications, in-app messaging',
          es: 'Chat en tiempo real, notificaciones, mensajería en app'
        },
        icon: 'MessageSquare',
        category: {
          en: 'Communication',
          es: 'Comunicación'
        }
      },
      {
        id: 'content-module',
        name: {
          en: 'Content Library',
          es: 'Biblioteca de Contenido'
        },
        description: {
          en: 'Video hosting, documents, images, gated content',
          es: 'Hospedaje de video, documentos, imágenes, contenido restringido'
        },
        icon: 'FolderOpen',
        category: {
          en: 'Content',
          es: 'Contenido'
        }
      },
      {
        id: 'calendar-module',
        name: {
          en: 'Calendar & Booking',
          es: 'Calendario y Reservas'
        },
        description: {
          en: 'Appointment scheduling, reminders, time zones',
          es: 'Programación de citas, recordatorios, zonas horarias'
        },
        icon: 'CalendarClock',
        category: {
          en: 'Scheduling',
          es: 'Programación'
        }
      },
      {
        id: 'analytics-module',
        name: {
          en: 'Analytics & Reports',
          es: 'Analíticas y Reportes'
        },
        description: {
          en: 'User insights, engagement metrics, custom reports',
          es: 'Insights de usuarios, métricas de engagement, reportes personalizados'
        },
        icon: 'LineChart',
        category: {
          en: 'Analytics',
          es: 'Analíticas'
        },
        badge: {
          en: 'New',
          es: 'Nuevo'
        }
      },
      {
        id: 'workflow-module',
        name: {
          en: 'Workflow Automation',
          es: 'Automatización de Flujos'
        },
        description: {
          en: 'Triggers, actions, email sequences, webhooks',
          es: 'Triggers, acciones, secuencias de email, webhooks'
        },
        icon: 'Workflow',
        category: {
          en: 'Automation',
          es: 'Automatización'
        }
      }
    ],
    cta: {
      text: {
        en: 'See All Modules',
        es: 'Ver Todos los Módulos'
      },
      href: '/modules'
    }
  }
};

// ============================================
// HOW IT WORKS SECTION
// ============================================
export const modularityHowItWorks: SectionContent<HowItWorksContent> = {
  id: 'how-it-works',
  enabled: true,
  order: 8,
  content: {
    headline: {
      en: 'From Idea to Live App in Minutes',
      es: 'De la Idea a App en Vivo en Minutos'
    },
    subheadline: {
      en: 'Our proven 3-step process gets you up and running fast',
      es: 'Nuestro proceso probado de 3 pasos te pone en marcha rápidamente'
    },
    layout: 'numbered',
    steps: [
      {
        id: 'step-1',
        number: '1',
        title: {
          en: 'Choose Your Template',
          es: 'Elige Tu Plantilla'
        },
        description: {
          en: 'Start with a pre-designed template for your profession or create from scratch. Either way, you\'re minutes away from launch.',
          es: 'Empieza con una plantilla pre-diseñada para tu profesión o crea desde cero. De cualquier forma, estás a minutos del lanzamiento.'
        },
        icon: 'LayoutTemplate'
      },
      {
        id: 'step-2',
        number: '2',
        title: {
          en: 'Customize & Configure',
          es: 'Personaliza y Configura'
        },
        description: {
          en: 'Drag-and-drop modules, adjust branding, set up workflows. AI helps you every step of the way.',
          es: 'Arrastra y suelta módulos, ajusta el branding, configura flujos. La IA te ayuda en cada paso del camino.'
        },
        icon: 'Wrench'
      },
      {
        id: 'step-3',
        number: '3',
        title: {
          en: 'Publish & Grow',
          es: 'Publica y Crece'
        },
        description: {
          en: 'One click to go live. Your app is deployed, secure, and ready for users. Scale as you grow—no limits.',
          es: 'Un clic para ir en vivo. Tu app está desplegada, segura y lista para usuarios. Escala a medida que creces—sin límites.'
        },
        icon: 'Rocket'
      }
    ]
  }
};

// ============================================
// PRICING SECTION
// ============================================
export const modularityPricing: SectionContent<PricingContent> = {
  id: 'pricing',
  enabled: true,
  order: 9,
  content: {
    headline: {
      en: 'Simple, Transparent Pricing',
      es: 'Precios Simples y Transparentes'
    },
    subheadline: {
      en: 'Start free, scale as you grow. No hidden fees.',
      es: 'Empieza gratis, escala a medida que creces. Sin tarifas ocultas.'
    },
    stripePricingTableId: process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || '',
    stripePricingTablePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    badge: {
      text: {
        en: '14-day free trial',
        es: 'Prueba gratis de 14 días'
      },
      variant: 'secondary'
    }
  }
};

// ============================================
// FAQ SECTION
// ============================================
export const modularityFAQ: SectionContent<FAQContent> = {
  id: 'faq',
  enabled: true,
  order: 10,
  content: {
    headline: {
      en: 'Frequently Asked Questions',
      es: 'Preguntas Frecuentes'
    },
    layout: 'accordion',
    items: [
      {
        id: 'faq-1',
        question: {
          en: 'Do I really not need any coding skills?',
          es: '¿Realmente no necesito habilidades de programación?'
        },
        answer: {
          en: 'Absolutely not. Modulary is designed for non-technical professionals. If you can use a computer, you can build with Modulary. Our visual builder and pre-made modules handle all the technical complexity.',
          es: 'Absolutamente no. Modulary está diseñado para profesionales no técnicos. Si puedes usar una computadora, puedes construir con Modulary. Nuestro constructor visual y módulos pre-hechos manejan toda la complejidad técnica.'
        }
      },
      {
        id: 'faq-2',
        question: {
          en: 'Can I customize everything to match my brand?',
          es: '¿Puedo personalizar todo para que coincida con mi marca?'
        },
        answer: {
          en: 'Yes! You control colors, fonts, logos, layouts, and content. While we provide templates to speed things up, every element is customizable. Your app will look and feel uniquely yours.',
          es: 'Sí! Controlas colores, tipografías, logos, diseños y contenido. Aunque proporcionamos plantillas para acelerar, cada elemento es personalizable. Tu app se verá y sentirá únicamente tuya.'
        }
      },
      {
        id: 'faq-3',
        question: {
          en: 'How secure is my data and my clients\' data?',
          es: '¿Qué tan seguros están mis datos y los de mis clientes?'
        },
        answer: {
          en: 'Security is our top priority. All data is encrypted, we\'re SOC2 compliant, and HIPAA-compliant options are available for healthcare professionals. We handle backups, updates, and security patches automatically.',
          es: 'La seguridad es nuestra prioridad principal. Todos los datos están encriptados, cumplimos con SOC2, y opciones compatibles con HIPAA están disponibles para profesionales de la salud. Manejamos respaldos, actualizaciones y parches de seguridad automáticamente.'
        }
      },
      {
        id: 'faq-4',
        question: {
          en: 'What happens if I need help or get stuck?',
          es: '¿Qué pasa si necesito ayuda o me atasco?'
        },
        answer: {
          en: 'Our support team is available 24/7 via chat. Plus, you\'ll have access to video tutorials, documentation, and a community forum. Many users also book 1:1 onboarding sessions to get up and running faster.',
          es: 'Nuestro equipo de soporte está disponible 24/7 por chat. Además, tendrás acceso a tutoriales en video, documentación y un foro comunitario. Muchos usuarios también reservan sesiones de onboarding 1:1 para empezar más rápido.'
        }
      },
      {
        id: 'faq-5',
        question: {
          en: 'Can I export my data or switch platforms later?',
          es: '¿Puedo exportar mis datos o cambiar de plataforma más tarde?'
        },
        answer: {
          en: 'Yes. You own your data. You can export everything at any time in standard formats (CSV, JSON). We believe in no lock-in—if Modulary isn\'t right for you, your data comes with you.',
          es: 'Sí. Tú eres dueño de tus datos. Puedes exportar todo en cualquier momento en formatos estándar (CSV, JSON). Creemos en no bloqueo—si Modulary no es para ti, tus datos van contigo.'
        }
      },
      {
        id: 'faq-6',
        question: {
          en: 'How does pricing scale as I grow?',
          es: '¿Cómo escalan los precios a medida que crezco?'
        },
        answer: {
          en: 'You only pay for what you use. Start free, then upgrade as you add more users, clients, or features. No surprise charges—our pricing page shows exactly what you\'ll pay at each tier.',
          es: 'Solo pagas por lo que usas. Empieza gratis, luego actualiza a medida que añades más usuarios, clientes o funcionalidades. Sin cargos sorpresa—nuestra página de precios muestra exactamente lo que pagarás en cada nivel.'
        }
      },
      {
        id: 'faq-7',
        question: {
          en: 'Can I integrate with tools I already use?',
          es: '¿Puedo integrar con herramientas que ya uso?'
        },
        answer: {
          en: 'Absolutely. Modulary connects with popular tools like Stripe, Zapier, Google Calendar, Zoom, and more. If we don\'t have a direct integration, our API and webhook system lets you connect almost anything.',
          es: 'Absolutamente. Modulary se conecta con herramientas populares como Stripe, Zapier, Google Calendar, Zoom y más. Si no tenemos una integración directa, nuestro sistema de API y webhooks te permite conectar casi cualquier cosa.'
        }
      }
    ],
    showContactCTA: true
  }
};

// ============================================
// EXPORT ALL CONTENT
// ============================================
export const modularityContent = {
  hero: modularityHero,
  problem: modularityProblem,
  targetUsers: modularityTargetUsers,
  solution: modularitySolution,
  ai: modularityAI,
  useCases: modularityUseCases,
  modules: modularityModules,
  howItWorks: modularityHowItWorks,
  pricing: modularityPricing,
  faq: modularityFAQ
};
