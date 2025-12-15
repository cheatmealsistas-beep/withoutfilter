'use client';

import { useState } from 'react';

type AnswerInputProps = {
  onSubmit: (answer: string) => void;
  hasAnswered: boolean;
  isHotSeat?: boolean;
  placeholder?: string;
};

export function AnswerInput({
  onSubmit,
  hasAnswered,
  isHotSeat = false,
  placeholder = 'Escribe tu respuesta...',
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (answer.trim() && !hasAnswered) {
      setIsSubmitting(true);
      onSubmit(answer.trim());
    }
  };

  // For yes/no hot seat questions
  if (isHotSeat) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <p className="text-center text-muted-foreground mb-4">
          Responde rápido
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (!hasAnswered) {
                setIsSubmitting(true);
                onSubmit('Sí');
              }
            }}
            disabled={hasAnswered || isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              hasAnswered
                ? 'border-muted opacity-50'
                : 'border-muted hover:border-green-500 hover:bg-green-500/10'
            }`}
          >
            <div className="text-4xl mb-2">👍</div>
            <div className="font-medium text-xl">Sí</div>
          </button>

          <button
            onClick={() => {
              if (!hasAnswered) {
                setIsSubmitting(true);
                onSubmit('No');
              }
            }}
            disabled={hasAnswered || isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              hasAnswered
                ? 'border-muted opacity-50'
                : 'border-muted hover:border-red-500 hover:bg-red-500/10'
            }`}
          >
            <div className="text-4xl mb-2">👎</div>
            <div className="font-medium text-xl">No</div>
          </button>
        </div>

        {hasAnswered && (
          <p className="text-center text-sm text-muted-foreground">
            ¡Respuesta enviada!
          </p>
        )}
      </div>
    );
  }

  // Regular text answer
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {hasAnswered ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-muted-foreground">
            ¡Respuesta enviada! Esperando a los demás...
          </p>
        </div>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 rounded-xl border bg-background resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {answer.length}/500
            </span>

            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="py-2 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
