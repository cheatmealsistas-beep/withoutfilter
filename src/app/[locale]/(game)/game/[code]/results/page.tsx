import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { brand } from '@/shared/config/brand';
import { getRoomWithPlayers } from '@/features/game-lobby';
import { Button } from '@/shared/components/ui/button';

export const metadata: Metadata = {
  title: `Resultados | ${brand.name}`,
};

interface ResultsPageProps {
  params: Promise<{ locale: string; code: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { locale, code } = await params;

  // Get room data
  const { data: room, error } = await getRoomWithPlayers(code.toUpperCase());

  if (error || !room) {
    notFound();
  }

  // Sort players by score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Winner */}
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">🏆</div>
          <h1 className="text-3xl font-bold">¡Partida terminada!</h1>

          {winner && (
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl p-6 border border-yellow-300 dark:border-yellow-700">
              <p className="text-sm text-muted-foreground mb-2">Ganador</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl">{winner.avatar_emoji}</span>
                <div>
                  <p className="text-2xl font-bold">{winner.display_name}</p>
                  <p className="text-lg text-yellow-600 dark:text-yellow-400 font-medium">
                    {winner.score} puntos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Clasificación</h2>
          </div>
          <div className="divide-y">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-4 ${
                  index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                }`}
              >
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <span className="text-2xl">{player.avatar_emoji}</span>
                <span className="flex-1 font-medium">{player.display_name}</span>
                <span className="font-bold">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/${locale}/game/create`}>
            <Button size="lg" className="w-full">
              Nueva Partida
            </Button>
          </Link>
          <Link href={`/${locale}/game`}>
            <Button size="lg" variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
