import { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/shared/config/brand';
import { CreateRoomForm } from '@/features/game-lobby/components';

export const metadata: Metadata = {
  title: `Crear Sala | ${brand.name}`,
  description: 'Crea una sala y empieza a jugar con tus amigos',
};

interface CreateRoomPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CreateRoomPage({ params }: CreateRoomPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <Link
          href={`/${locale}/game`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Crear Sala</h1>
          <p className="text-muted-foreground">
            Configura tu partida y comparte el código con tus amigos
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl p-6 border">
          <CreateRoomForm />
        </div>
      </div>
    </div>
  );
}
