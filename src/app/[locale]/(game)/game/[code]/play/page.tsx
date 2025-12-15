import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { brand } from '@/shared/config/brand';
import { getRoomWithPlayers } from '@/features/game-lobby';
import { getGameState, GameBoard } from '@/features/game-session';

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

  // If room is not playing, redirect to lobby
  if (room.status === 'waiting') {
    redirect(`/${locale}/game/${code}`);
  }

  // If room is finished, redirect to results
  if (room.status === 'finished') {
    redirect(`/${locale}/game/${code}/results`);
  }

  // Get current player from cookie
  const cookieStore = await cookies();
  const playerIdCookie = cookieStore.get(`player_${code}`);

  if (!playerIdCookie?.value) {
    redirect(`/${locale}/game/join?code=${code}`);
  }

  const currentPlayer = room.players.find((p) => p.id === playerIdCookie.value);

  if (!currentPlayer) {
    redirect(`/${locale}/game/join?code=${code}`);
  }

  // Get game state
  const gameState = await getGameState(room.id, currentPlayer.id);

  if (!gameState) {
    // Game session not started yet, wait
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl animate-pulse">🎲</div>
          <h1 className="text-2xl font-bold">Preparando partida...</h1>
          <p className="text-muted-foreground">
            El juego comenzará en breve
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameBoard
      roomId={room.id}
      playerId={currentPlayer.id}
      initialGameState={gameState}
      locale={locale}
      isHost={currentPlayer.is_host}
    />
  );
}
