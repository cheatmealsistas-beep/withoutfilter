import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand } from '@/shared/config/brand';
import { getRoomWithPlayers } from '@/features/game-lobby';

export const metadata: Metadata = {
  title: `Jugando | ${brand.name}`,
};

interface PlayPageProps {
  params: Promise<{ locale: string; code: string }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { locale, code } = await params;

  // Get room data
  const { data: room, error } = await getRoomWithPlayers(code.toUpperCase());

  if (error || !room) {
    notFound();
  }

  // TODO: Implement game session feature
  // For now, show a placeholder

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🎮</div>
        <h1 className="text-3xl font-bold">Partida en curso</h1>
        <p className="text-muted-foreground">
          Sala: <span className="font-mono font-bold">{code}</span>
        </p>
        <p className="text-muted-foreground">
          {room.players.length} jugadores conectados
        </p>

        {/* Placeholder for game content */}
        <div className="bg-card rounded-xl p-8 border">
          <p className="text-lg">
            El motor de juego está en desarrollo.
            <br />
            <span className="text-sm text-muted-foreground">
              Próximamente: preguntas, retos y votaciones
            </span>
          </p>
        </div>

        {/* Players */}
        <div className="flex flex-wrap gap-2 justify-center">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
            >
              <span>{player.avatar_emoji}</span>
              <span className="text-sm font-medium">{player.display_name}</span>
              <span className="text-xs text-muted-foreground">
                {player.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
