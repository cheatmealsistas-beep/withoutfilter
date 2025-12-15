'use client';

import { useRoundTimer } from '../hooks/use-round-timer';

type RoundTimerProps = {
  initialTime: number;
  onTimeUp?: () => void;
  size?: 'sm' | 'md' | 'lg';
};

export function RoundTimer({
  initialTime,
  onTimeUp,
  size = 'md',
}: RoundTimerProps) {
  const { timeRemaining, formattedTime, progress, isTimeUp } = useRoundTimer({
    initialTime,
    onTimeUp,
  });

  const sizeClasses = {
    sm: 'text-xl w-16 h-16',
    md: 'text-3xl w-24 h-24',
    lg: 'text-5xl w-32 h-32',
  };

  const isLowTime = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress ring */}
      <svg
        className={`transform -rotate-90 ${sizeClasses[size]}`}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={`${(1 - progress / 100) * 283} 283`}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${
            isCritical
              ? 'text-red-500'
              : isLowTime
              ? 'text-yellow-500'
              : 'text-primary'
          }`}
        />
      </svg>

      {/* Time display */}
      <div
        className={`absolute inset-0 flex items-center justify-center font-mono font-bold ${
          sizeClasses[size].split(' ')[0]
        } ${
          isCritical
            ? 'text-red-500 animate-pulse'
            : isLowTime
            ? 'text-yellow-500'
            : 'text-foreground'
        }`}
      >
        {isTimeUp ? '00:00' : formattedTime}
      </div>
    </div>
  );
}
