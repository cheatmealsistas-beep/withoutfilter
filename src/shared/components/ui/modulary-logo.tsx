import React from 'react';

interface ModularyLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  mono?: boolean;
}

/**
 * Modulary Logo - 3 módulos interconectados formando "M" abstracta
 * Diseño: bloques verticales con esquinas redondeadas
 * Color: Sky Blue (#0EA5E9) → Purple (#8B5CF6) con gradiente en el centro
 */
export function ModularyLogo({
  className = '',
  size = 40,
  showText = false,
  mono = false
}: ModularyLogoProps) {
  const logoWidth = showText ? size * 3.5 : size;
  const logoHeight = size;
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <svg
      width={logoWidth}
      height={logoHeight}
      viewBox={showText ? "0 0 140 40" : "0 0 40 40"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Modulary Logo"
    >
      <defs>
        <linearGradient id={`modularyGradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={mono ? "currentColor" : "#0EA5E9"} />
          <stop offset="100%" stopColor={mono ? "currentColor" : "#8B5CF6"} />
        </linearGradient>
      </defs>

      {/* Módulo izquierdo */}
      <rect
        x="2"
        y="14"
        width="10"
        height="22"
        rx="4"
        fill={mono ? "currentColor" : "#0EA5E9"}
      />

      {/* Módulo central (más alto) - con gradiente */}
      <rect
        x="15"
        y="4"
        width="10"
        height="32"
        rx="4"
        fill={mono ? "currentColor" : `url(#modularyGradient-${uniqueId})`}
      />

      {/* Módulo derecho */}
      <rect
        x="28"
        y="14"
        width="10"
        height="22"
        rx="4"
        fill={mono ? "currentColor" : "#8B5CF6"}
      />

      {showText && (
        <text
          x="48"
          y="27"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="18"
          fontWeight="600"
          fill="currentColor"
          letterSpacing="-0.02em"
        >
          Modulary
        </text>
      )}
    </svg>
  );
}

/**
 * ModularyIcon - Versión icono del logo (sin texto)
 */
export function ModularyIcon({
  className = '',
  size = 24,
  mono = false
}: Omit<ModularyLogoProps, 'showText'>) {
  return <ModularyLogo className={className} size={size} showText={false} mono={mono} />;
}
