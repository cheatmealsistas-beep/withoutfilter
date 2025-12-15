import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { brand } from '@/shared/config/brand';
import { getRoomWithPlayers } from '@/features/game-lobby';
import { RoomLobby } from '@/features/game-lobby/components';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: `Sala de Espera | ${brand.name}`,
};

interface RoomPageProps {
  params: Promise<{ locale: string; code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { locale, code } = await params;

  // Get room data
  const { data: room, error } = await getRoomWithPlayers(code.toUpperCase());

  if (error || !room) {
    notFound();
  }

  // If game already started, redirect to play
  if (room.status === 'playing') {
    redirect(`/${locale}/game/${code}/play`);
  }

  // If game finished, redirect to results
  if (room.status === 'finished') {
    redirect(`/${locale}/game/${code}/results`);
  }

  // Get current player from cookie or find by some identifier
  // For now, get the first player (this would normally use session/cookie)
  const cookieStore = await cookies();
  const playerIdCookie = cookieStore.get(`player_${code}`);

  // Find current player
  let currentPlayer = room.players.find((p) => p.id === playerIdCookie?.value);

  // If no player found by cookie, this user hasn't joined yet
  if (!currentPlayer) {
    // Redirect to join page with code
    redirect(`/${locale}/game/join?code=${code}`);
  }

  return <RoomLobby room={room} currentPlayer={currentPlayer} />;
}
