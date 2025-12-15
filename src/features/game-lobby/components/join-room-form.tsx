'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { joinRoomAction } from '../game-lobby.actions';
import { avatarEmojis, type JoinRoomState } from '../types';

interface JoinRoomFormProps {
  initialCode?: string;
}

export function JoinRoomForm({ initialCode }: JoinRoomFormProps) {
  const locale = useLocale();
  const [state, action, pending] = useActionState<JoinRoomState | null, FormData>(
    joinRoomAction,
    null
  );
  const [selectedAvatar, setSelectedAvatar] = useState('😎');
  const [code, setCode] = useState(initialCode || '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus on code input if no initial code
  useEffect(() => {
    if (!initialCode && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [initialCode]);

  // Handle code input (6 separate inputs for better UX)
  const handleCodeChange = (index: number, value: string) => {
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (char.length > 1) {
      // Pasted value - distribute across inputs
      const chars = char.split('').slice(0, 6);
      let newCode = code.split('');
      chars.forEach((c, i) => {
        if (index + i < 6) {
          newCode[index + i] = c;
        }
      });
      setCode(newCode.join(''));
      // Focus on next empty or last input
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else if (char) {
      // Single character
      let newCode = code.split('');
      newCode[index] = char;
      setCode(newCode.join(''));
      // Move to next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      let newCode = code.split('');
      newCode[index - 1] = '';
      setCode(newCode.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="playerAvatar" value={selectedAvatar} />

      {/* Room Code */}
      <div className="space-y-2">
        <Label>Código de sala</Label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={6}
              value={code[index] || ''}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold uppercase bg-muted border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="·"
            />
          ))}
        </div>
        {code.length === 6 && (
          <p className="text-center text-sm text-muted-foreground">
            Código: {code}
          </p>
        )}
      </div>

      {/* Player Name */}
      <div className="space-y-2">
        <Label htmlFor="playerName">Tu nombre</Label>
        <Input
          id="playerName"
          name="playerName"
          placeholder="Ej: María"
          required
          minLength={2}
          maxLength={30}
          className="text-lg"
        />
      </div>

      {/* Avatar Selection */}
      <div className="space-y-2">
        <Label>Tu avatar</Label>
        <div className="grid grid-cols-8 gap-2">
          {avatarEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedAvatar(emoji)}
              className={`text-2xl p-2 rounded-lg transition-all ${
                selectedAvatar === emoji
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full text-lg"
        disabled={pending || code.length !== 6}
      >
        {pending ? 'Uniéndose...' : 'Unirse a la Sala'}
      </Button>
    </form>
  );
}
