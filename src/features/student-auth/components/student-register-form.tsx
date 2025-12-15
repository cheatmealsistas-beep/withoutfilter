'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { getErrorMessage } from '@/shared/errors';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { studentRegisterAction } from '../student-auth.actions';

interface StudentRegisterFormProps {
  locale: string;
  slug: string;
  appName: string;
  logoUrl?: string | null;
}

export function StudentRegisterForm({ locale, slug, appName, logoUrl }: StudentRegisterFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';

  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      formData.append('locale', locale);
      formData.append('slug', slug);
      formData.append('redirect', redirectTo);
      return studentRegisterAction(prevState as null, formData);
    },
    null
  );

  // Show success message if email verification is required
  if (state?.success && state?.messageKey === 'checkEmailVerification') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {logoUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={logoUrl}
                alt={appName}
                className="h-12 w-auto object-contain"
              />
            </div>
          )}
          <CardTitle>¡Revisa tu email!</CardTitle>
          <CardDescription>
            Te hemos enviado un enlace de confirmación a <strong>{state.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Haz clic en el enlace del email para activar tu cuenta y acceder a {appName}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {logoUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={logoUrl}
              alt={appName}
              className="h-12 w-auto object-contain"
            />
          </div>
        )}
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>
          Regístrate gratis para acceder a {appName}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {getErrorMessage(state.error.code, locale)}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              defaultValue={state?.email ?? ''}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{' '}
            <Link
              href={`/${locale}/app/${slug}/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
