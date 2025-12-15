import { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/shared/config/brand';
import { Button } from '@/shared/components/ui/button';

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

interface GameHomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function GameHomePage({ params }: GameHomePageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo / Title */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {brand.name}
          </h1>
          <p className="text-xl text-muted-foreground">{brand.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-muted-foreground">
          Preguntas incómodas, retos atrevidos y mucha diversión.
          <br />
          Sin descargas. Juega desde el móvil.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Link href={`/${locale}/game/create`} className="block">
            <Button size="lg" className="w-full text-lg py-6">
              Crear Sala
            </Button>
          </Link>

          <Link href={`/${locale}/game/join`} className="block">
            <Button size="lg" variant="outline" className="w-full text-lg py-6">
              Unirse a Sala
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="pt-8 grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <span className="text-3xl">🎲</span>
            <p className="text-muted-foreground">3-12 jugadores</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl">⚡</span>
            <p className="text-muted-foreground">Sin descargas</p>
          </div>
          <div className="space-y-2">
            <span className="text-3xl">🔥</span>
            <p className="text-muted-foreground">+50 preguntas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
