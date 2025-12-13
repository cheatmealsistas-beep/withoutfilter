'use client';

import { useMemo } from 'react';

interface BrandColorProviderProps {
  children: React.ReactNode;
  primaryColor: string;
}

/**
 * Converts a hex color to HSL values for Tailwind CSS variables
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Provides brand colors to all child components via CSS variables.
 * This overrides the default Tailwind `primary` color with the owner's brand color.
 */
export function BrandColorProvider({ children, primaryColor }: BrandColorProviderProps) {
  const hsl = useMemo(() => hexToHSL(primaryColor), [primaryColor]);

  // Tailwind uses HSL format without the hsl() wrapper: "h s% l%"
  const primaryHSL = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

  // Create a lighter version for foreground (text on primary background)
  // If the color is dark (l < 50), use white text; otherwise use dark text
  const foregroundHSL = hsl.l < 50 ? '0 0% 100%' : '0 0% 0%';

  return (
    <div
      style={{
        // Override Tailwind CSS variables for primary color
        '--primary': primaryHSL,
        '--primary-foreground': foregroundHSL,
        // Also provide the hex value for inline styles
        '--brand-color': primaryColor,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
