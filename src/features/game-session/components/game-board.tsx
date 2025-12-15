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
  isHost: boolean;
};

export function GameBoard({
  roomId,
  playerId,
  initialGameState,
  locale,
  isHost,
}: GameBoardProps) {
  const { gameState, isConnected } = useGameSession({
    roomId,
    playerId,
    initialState: initialGameState,
  });

  const [showingQuestion, setShowingQuestion] = useState(
    gameState?.phase === 'showing_question'
  );
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Handle phase transitions - only for showing_question -> answering
  // ONLY the host triggers the server action to avoid race conditions
  useEffect(() => {
    if (!gameState) return;

    if (gameState.phase === 'showing_question') {
      setShowingQuestion(true);

      // Auto-transition to answering after showing question
      // All clients show the countdown, but ONLY host triggers the DB update
      const timer = setTimeout(() => {
        setShowingQuestion(false);
        // Only host triggers the phase change action to prevent race conditions
        if (isHost) {
          handlePhaseChange();
        }
      }, TIMING.SHOWING_QUESTION * 1000);

      return () => clearTimeout(timer);
    } else {
      setShowingQuestion(false);
    }
  }, [gameState?.phase, gameState?.currentRound, isHost]);

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

  const handleShowResults = async () => {
    if (!gameState || !isHost) return;

    setIsAdvancing(true);
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('sessionId', gameState.sessionId);
    formData.append('locale', locale);
    formData.append('roomCode', gameState.roomCode);

    // This only changes phase to showing_results - does NOT advance round
    const { showResultsAction } = await import('../game-session.actions');
    await showResultsAction(formData);
    setIsAdvancing(false);
  };

  const handleNextRound = async () => {
    if (!gameState || !isHost) return;

    setIsAdvancing(true);
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('sessionId', gameState.sessionId);
    formData.append('locale', locale);
    formData.append('roomCode', gameState.roomCode);

    const { advanceRoundAction } = await import('../game-session.actions');
    await advanceRoundAction(formData);
    setIsAdvancing(false);
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
            />
          )}

          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              }`}
              title={isConnected ? 'Conectado' : 'Reconectando...'}
            />
            {isHost && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
            <span className="text-sm font-medium">
              {gameState.roomCode}
            </span>
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
                  {gameState.hasAnswered && (
                    <p className="text-sm text-green-600 mt-2">
                      ¡{gameState.hotSeatPlayer?.display_name} ya respondió!
                    </p>
                  )}
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

              {/* Host button to show results */}
              {isHost && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleShowResults}
                    disabled={isAdvancing}
                    className="py-3 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isAdvancing ? 'Cargando...' : 'Ver Resultados'}
                  </button>
                </div>
              )}

              {/* Non-host waiting message */}
              {!isHost && (
                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground">
                    Esperando a que el host muestre los resultados...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results phase - stays until host clicks next */}
          {gameState.phase === 'showing_results' && (
            <div className="text-center py-8 space-y-6">
              <h2 className="text-2xl font-bold">🎉 Resultados</h2>

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

              {content?.type === 'question' && (
                <div className="p-6 rounded-xl bg-card border max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {gameState.hotSeatPlayer?.display_name} respondió:
                  </p>
                  <p className="text-xl font-medium">
                    {gameState.answers[gameState.hotSeatPlayer?.id || '']
                      ? `"${gameState.answers[gameState.hotSeatPlayer?.id || '']}"`
                      : '(Sin respuesta)'}
                  </p>
                </div>
              )}

              {content?.type === 'confession' && (
                <div className="p-6 rounded-xl bg-card border max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {gameState.hotSeatPlayer?.display_name} confesó:
                  </p>
                  <p className="text-xl font-medium">
                    {gameState.answers[gameState.hotSeatPlayer?.id || '']
                      ? `"${gameState.answers[gameState.hotSeatPlayer?.id || '']}"`
                      : '(Sin confesión)'}
                  </p>
                </div>
              )}

              {/* Only host can advance */}
              {isHost ? (
                <button
                  onClick={handleNextRound}
                  disabled={isAdvancing}
                  className="py-3 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isAdvancing
                    ? 'Cargando...'
                    : gameState.currentRound >= gameState.totalRounds
                      ? 'Ver resultados finales'
                      : 'Siguiente ronda →'}
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Esperando a que el host continúe...
                </p>
              )}
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
