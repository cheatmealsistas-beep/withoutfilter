'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

interface ShareRoomProps {
  code: string;
}

export function ShareRoom({ code }: ShareRoomProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/es/game/join?code=${code}`
      : '';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Without Filter',
          text: `¡Únete a mi partida de Without Filter! Código: ${code}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border text-center space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Código de sala</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl font-bold tracking-widest font-mono">
            {code}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-muted-foreground"
          >
            {copied ? '✓' : '📋'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={handleShare} variant="outline" size="sm">
          📤 Compartir
        </Button>
        <Button onClick={handleCopyLink} variant="outline" size="sm">
          🔗 Copiar enlace
        </Button>
      </div>

      {copied && (
        <p className="text-sm text-green-600 animate-in fade-in">
          ¡Copiado al portapapeles!
        </p>
      )}
    </div>
  );
}
