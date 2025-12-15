import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  mono?: boolean;
}

/**
 * Without Filter Logo - Emoji de fuego estilizado
 */
export function ModularyLogo({
  className = '',
  size = 40,
  showText = false,
  mono = false
}: LogoProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ height: size }}
    >
      <span style={{ fontSize: size * 0.8 }}>🔥</span>
      {showText && (
        <span className="font-bold text-foreground">Without Filter</span>
      )}
    </div>
  );
}

/**
 * Icon version (no text)
 */
export function ModularyIcon({
  className = '',
  size = 24,
  mono = false
}: Omit<LogoProps, 'showText'>) {
  return <ModularyLogo className={className} size={size} showText={false} mono={mono} />;
}
