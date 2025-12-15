import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { brand } from '@/shared/config/brand';
import { Button } from '@/shared/components/ui/button';

export async function generateMetadata() {
  return {
    title: brand.seo.defaultTitle,
    description: brand.seo.defaultDescription,
  };
}

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span>🎲</span>
            <span>El juego para adultos que rompe el hielo</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              {brand.name}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Preguntas incómodas, retos atrevidos y mucha diversión.
            <br />
            <span className="font-medium text-foreground">
              Sin descargas. Juega desde el móvil.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href={`/${locale}/game/create`}>
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Crear Sala Gratis
              </Button>
            </Link>
            <Link href={`/${locale}/game/join`}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 w-full sm:w-auto"
              >
                Unirse con Código
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-sm text-muted-foreground pt-4">
            ✨ 100% gratis · Sin registro · Juega en segundos
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="📱"
              title="1. Crea una sala"
              description="Elige tu nombre, las categorías que quieras jugar y comparte el código con tus amigos."
            />
            <FeatureCard
              emoji="👥"
              title="2. Únete con amigos"
              description="Tus amigos entran con el código desde su móvil. Sin descargas, sin cuentas."
            />
            <FeatureCard
              emoji="🎉"
              title="3. ¡A jugar!"
              description="Preguntas, retos y votaciones. El que más puntos consiga, gana."
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Elige tu nivel de atrevimiento
          </h2>
          <p className="text-muted-foreground mb-12">
            Desde preguntas para romper el hielo hasta las más sin filtro
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <CategoryCard
              emoji="😊"
              name="Suave"
              description="Preguntas divertidas para romper el hielo. Ideal para empezar."
              color="bg-green-100 dark:bg-green-900/20 border-green-300"
            />
            <CategoryCard
              emoji="🔥"
              name="Atrevida"
              description="Preguntas más picantes y personales. Las cosas se ponen interesantes."
              color="bg-orange-100 dark:bg-orange-900/20 border-orange-300"
            />
            <CategoryCard
              emoji="💀"
              name="Sin Filtro"
              description="Sin límites. Solo para valientes y grupos de mucha confianza."
              color="bg-red-100 dark:bg-red-900/20 border-red-300"
            />
          </div>
        </div>
      </section>

      {/* Game Types Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Tipos de juego
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <GameTypeCard
              emoji="❓"
              title="Preguntas Personales"
              description="El jugador debe responder honestamente. '¿Cuál fue tu peor cita?'"
            />
            <GameTypeCard
              emoji="🗳️"
              title="Votación Grupal"
              description="Todos votan. '¿Quién del grupo es más probable que...?'"
            />
            <GameTypeCard
              emoji="🎯"
              title="Retos"
              description="Cumple el reto o pierde puntos. 'Imita a alguien del grupo'"
            />
            <GameTypeCard
              emoji="🤫"
              title="Confesiones"
              description="Confiesa algo que nunca hayas contado. ¿Te atreves?"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            ¿Listos para jugar?
          </h2>
          <p className="text-xl text-muted-foreground">
            Crea una sala en segundos y comparte el código con tus amigos.
          </p>
          <Link href={`/${locale}/game/create`}>
            <Button size="lg" className="text-lg px-12 py-6">
              Crear Sala Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>{brand.copyright}</p>
          <p className="mt-2">
            Hecho con 🔥 para adultos que saben divertirse
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-xl bg-card border">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function CategoryCard({
  emoji,
  name,
  description,
  color,
}: {
  emoji: string;
  name: string;
  description: string;
  color: string;
}) {
  return (
    <div className={`p-6 rounded-xl border ${color}`}>
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function GameTypeCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card border">
      <div className="text-3xl">{emoji}</div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
