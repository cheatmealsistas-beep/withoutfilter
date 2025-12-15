'use client';

import { useEffect, useState } from 'react';
import type { GameState } from '../types';
import { TIMING } from '../types';
import { useGameSession } from '../hooks/use-game-session';
import { RoundTimer } from './round-timer';
import { QuestionCard } from './question-card';
import { AnswerInput } from './answer-input';
import { VotingPanel } from './voting-panel';
import { PlayerScores } from './player-scores';

type GameBoardProps = {
  roomId: string;
  playerId: string;
  initialGameState: GameState;
  locale: string;
};

export function GameBoard({
  roomId,
  playerId,
  initialGameState,
  locale,
}: GameBoardProps) {
  const { gameState, refreshGameState } = useGameSession({
    roomId,
    playerId,
    initialState: initialGameState,
  });

  const [showingQuestion, setShowingQuestion] = useState(
    gameState?.phase === 'showing_question'
  );

  // Handle phase transitions
  useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === 'showing_question') {
      setShowingQuestion(true);

      // Auto-transition to answering after showing question
      const timer = setTimeout(() => {
        setShowingQuestion(false);
        // Trigger phase change via action
        handlePhaseChange();
      }, TIMING.SHOWING_QUESTION * 1000);

      return () => clearTimeout(timer);
    } else {
      setShowingQuestion(false);
    }
  }, [gameState?.phase, gameState?.currentRound]);

  const handlePhaseChange = async () => {
    const formData = new FormData();
    formData.append('sessionId', gameState?.sessionId || '');
    formData.append('locale', locale);
    formData.append('roomCode', gameState?.roomCode || '');

    const { setAnsweringPhaseAction } = await import('../game-session.actions');
    await setAnsweringPhaseAction(formData);
  };

  const handleAnswer = async (answer: string) => {
    if (!gameState) return;

    const formData = new FormData();
    formData.append('sessionId', gameState.sessionId);
    formData.append('playerId', playerId);
    formData.append('answer', answer);
    formData.append('locale', locale);
    formData.append('roomCode', gameState.roomCode);

    const { submitAnswerAction } = await import('../game-session.actions');
    await submitAnswerAction(formData);
  };

  const handleVote = async (targetPlayerId: string) => {
    if (!gameState) return;

    const formData = new FormData();
    formData.append('sessionId', gameState.sessionId);
    formData.append('voterId', playerId);
    formData.append('targetPlayerId', targetPlayerId);
    formData.append('locale', locale);
    formData.append('roomCode', gameState.roomCode);

    const { submitVoteAction } = await import('../game-session.actions');
    await submitVoteAction(formData);
  };

  const handleNextRound = async () => {
    if (!gameState) return;

    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('sessionId', gameState.sessionId);
    formData.append('locale', locale);
    formData.append('roomCode', gameState.roomCode);

    const { advanceRoundAction } = await import('../game-session.actions');
    await advanceRoundAction(formData);
  };

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Cargando juego...</p>
        </div>
      </div>
    );
  }

  const isHotSeatPlayer = gameState.hotSeatPlayer?.id === playerId;
  const content = gameState.content;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Ronda {gameState.currentRound}/{gameState.totalRounds}
          </div>

          {!showingQuestion && gameState.phase === 'answering' && (
            <RoundTimer
              initialTime={gameState.timeRemaining}
              size="sm"
              onTimeUp={handleNextRound}
            />
          )}

          <div className="text-sm font-medium">
            {gameState.roomCode}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Question card - always visible */}
          {content && (
            <QuestionCard
              content={content}
              hotSeatPlayer={gameState.hotSeatPlayer}
            />
          )}

          {/* Phase-specific content */}
          {showingQuestion && (
            <div className="text-center py-8">
              <div className="text-2xl font-medium text-muted-foreground">
                ¡Prepárense!
              </div>
              <div className="text-6xl mt-4">🔥</div>
            </div>
          )}

          {!showingQuestion && gameState.phase === 'answering' && content && (
            <div className="py-4">
              {/* Different UIs based on content type */}
              {content.type === 'question' && isHotSeatPlayer && (
                <AnswerInput
                  onSubmit={handleAnswer}
                  hasAnswered={gameState.hasAnswered}
                  placeholder="Escribe tu respuesta..."
                />
              )}

              {content.type === 'question' && !isHotSeatPlayer && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👀</div>
                  <p className="text-muted-foreground">
                    Esperando la respuesta de {gameState.hotSeatPlayer?.display_name}...
                  </p>
                </div>
              )}

              {content.type === 'group_vote' && (
                <VotingPanel
                  players={gameState.players}
                  currentPlayerId={playerId}
                  onVote={handleVote}
                  hasVoted={gameState.hasVoted}
                  votes={gameState.votes}
                />
              )}

              {content.type === 'challenge' && !isHotSeatPlayer && (
                <VotingPanel
                  players={gameState.players}
                  currentPlayerId={playerId}
                  onVote={handleVote}
                  hasVoted={gameState.hasVoted}
                  votes={gameState.votes}
                  isChallenge
                />
              )}

              {content.type === 'challenge' && isHotSeatPlayer && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-xl font-medium mb-2">¡Es tu turno!</p>
                  <p className="text-muted-foreground">
                    Completa el reto mientras los demás observan
                  </p>
                </div>
              )}

              {content.type === 'hot_seat' && isHotSeatPlayer && (
                <AnswerInput
                  onSubmit={handleAnswer}
                  hasAnswered={gameState.hasAnswered}
                  isHotSeat
                />
              )}

              {content.type === 'hot_seat' && !isHotSeatPlayer && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⚡</div>
                  <p className="text-muted-foreground">
                    {gameState.hotSeatPlayer?.display_name} debe responder rápido...
                  </p>
                </div>
              )}

              {content.type === 'confession' && isHotSeatPlayer && (
                <AnswerInput
                  onSubmit={handleAnswer}
                  hasAnswered={gameState.hasAnswered}
                  placeholder="Confiesa algo..."
                />
              )}

              {content.type === 'confession' && !isHotSeatPlayer && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤫</div>
                  <p className="text-muted-foreground">
                    Esperando la confesión de {gameState.hotSeatPlayer?.display_name}...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results phase */}
          {gameState.phase === 'showing_results' && (
            <div className="text-center py-8 space-y-6">
              <h2 className="text-2xl font-bold">Resultados de la ronda</h2>

              {content?.type === 'group_vote' && (
                <VotingPanel
                  players={gameState.players}
                  currentPlayerId={playerId}
                  onVote={() => {}}
                  hasVoted={true}
                  votes={gameState.votes}
                  showResults
                />
              )}

              {content?.type === 'question' && gameState.answers[gameState.hotSeatPlayer?.id || ''] && (
                <div className="p-6 rounded-xl bg-card border max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {gameState.hotSeatPlayer?.display_name} respondió:
                  </p>
                  <p className="text-xl font-medium">
                    &ldquo;{gameState.answers[gameState.hotSeatPlayer?.id || '']}&rdquo;
                  </p>
                </div>
              )}

              <button
                onClick={handleNextRound}
                className="py-3 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {gameState.currentRound >= gameState.totalRounds
                  ? 'Ver resultados finales'
                  : 'Siguiente ronda'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer with scores */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t p-4">
        <PlayerScores
          players={gameState.players}
          currentPlayerId={playerId}
          hotSeatPlayerId={gameState.hotSeatPlayer?.id}
          compact
        />
      </footer>
    </div>
  );
}
