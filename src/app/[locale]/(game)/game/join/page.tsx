import { Metadata } from 'next';
import Link from 'next/link';
import { brand } from '@/shared/config/brand';
import { JoinRoomForm } from '@/features/game-lobby/components';

export const metadata: Metadata = {
  title: `Unirse a Sala | ${brand.name}`,
  description: 'Únete a una sala con el código de tu amigo',
};

interface JoinRoomPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function JoinRoomPage({
  params,
  searchParams,
}: JoinRoomPageProps) {
  const { locale } = await params;
  const { code } = await searchParams;

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
          <h1 className="text-3xl font-bold">Unirse a Sala</h1>
          <p className="text-muted-foreground">
            Ingresa el código que te compartió tu amigo
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-xl p-6 border">
          <JoinRoomForm initialCode={code} />
        </div>
      </div>
    </div>
  );
}
