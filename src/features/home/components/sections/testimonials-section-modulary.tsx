import { Quote, Star } from 'lucide-react';

interface TestimonialsSectionModularyProps {
  locale: string;
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

/**
 * Testimonials Section - Modulary Style
 * Social proof with real user testimonials
 */
export function TestimonialsSectionModulary({ locale }: TestimonialsSectionModularyProps) {
  const headline = locale === 'es'
    ? 'Lo Que Dicen Nuestros Usuarios'
    : 'What Our Users Say';

  const subheadline = locale === 'es'
    ? 'Profesionales reales que transformaron su negocio con Modulary'
    : 'Real professionals who transformed their business with Modulary';

  const testimonials: Testimonial[] = locale === 'es'
    ? [
        {
          id: '1',
          quote: 'Antes usaba 5 herramientas diferentes. Ahora tengo todo en un solo lugar. Mis clientes están encantados y yo ahorro horas cada semana.',
          author: 'María González',
          role: 'Coach de vida',
          avatar: 'MG',
          rating: 5
        },
        {
          id: '2',
          quote: 'Pensé que necesitaría un desarrollador para tener mi propia app. Con Modulary la creé en una tarde. Increíble.',
          author: 'Carlos Ruiz',
          role: 'Entrenador personal',
          avatar: 'CR',
          rating: 5
        },
        {
          id: '3',
          quote: 'El soporte es excepcional. Cada vez que tengo una duda, me responden en minutos. Así da gusto trabajar.',
          author: 'Ana Martín',
          role: 'Terapeuta ocupacional',
          avatar: 'AM',
          rating: 5
        }
      ]
    : [
        {
          id: '1',
          quote: 'I used to juggle 5 different tools. Now everything is in one place. My clients love it and I save hours every week.',
          author: 'Sarah Johnson',
          role: 'Life Coach',
          avatar: 'SJ',
          rating: 5
        },
        {
          id: '2',
          quote: 'I thought I would need a developer for my own app. With Modulary I built it in an afternoon. Amazing.',
          author: 'Mike Chen',
          role: 'Personal Trainer',
          avatar: 'MC',
          rating: 5
        },
        {
          id: '3',
          quote: 'Support is exceptional. Every time I have a question, they respond in minutes. This is how work should be.',
          author: 'Emily Watson',
          role: 'Occupational Therapist',
          avatar: 'EW',
          rating: 5
        }
      ];

  return (
    <section className="py-24 md:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subheadline}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative bg-background rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-medium text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {locale === 'es' ? 'Valoración media de nuestros usuarios' : 'Average rating from our users'}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background border border-border/50">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">4.9</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
