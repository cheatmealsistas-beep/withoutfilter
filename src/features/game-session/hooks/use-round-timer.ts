'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

type UseRoundTimerOptions = {
  initialTime: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
};

export function useRoundTimer({
  initialTime,
  onTimeUp,
  autoStart = true,
}: UseRoundTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update ref when callback changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when initial time changes
  useEffect(() => {
    setTimeRemaining(initialTime);
    if (autoStart) {
      setIsRunning(true);
    }
  }, [initialTime, autoStart]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          setIsRunning(false);
          if (onTimeUpRef.current) {
            onTimeUpRef.current();
          }
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTimeRemaining(newTime ?? initialTime);
    setIsRunning(false);
  }, [initialTime]);

  const restart = useCallback((newTime?: number) => {
    setTimeRemaining(newTime ?? initialTime);
    setIsRunning(true);
  }, [initialTime]);

  // Format time as MM:SS
  const formattedTime = `${Math.floor(timeRemaining / 60)
    .toString()
    .padStart(2, '0')}:${(timeRemaining % 60).toString().padStart(2, '0')}`;

  // Progress percentage (0-100)
  const progress = initialTime > 0
    ? ((initialTime - timeRemaining) / initialTime) * 100
    : 0;

  return {
    timeRemaining,
    formattedTime,
    progress,
    isRunning,
    isTimeUp: timeRemaining <= 0,
    start,
    pause,
    reset,
    restart,
  };
}
