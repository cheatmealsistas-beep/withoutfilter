'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { selfEnrollAction } from '../courses.actions';
import type { CourseVisibility } from '../types';

interface CourseEnrollButtonProps {
  courseId: string;
  visibility: CourseVisibility;
  orgSlug: string;
  locale: string;
  isAuthenticated: boolean;
  courseSlug: string;
}

export function CourseEnrollButton({
  courseId,
  visibility,
  orgSlug,
  locale,
  isAuthenticated,
  courseSlug,
}: CourseEnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to app-specific login, not global login
      router.push(`/${locale}/app/${orgSlug}/login?redirect=/courses/${courseSlug}`);
      return;
    }

    if (visibility === 'private') {
      toast.error('Este curso requiere una invitacion para acceder');
      return;
    }

    setIsLoading(true);
    const result = await selfEnrollAction(courseId, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Te has inscrito correctamente');
    router.push(`/${locale}/app/${orgSlug}/learn/${courseSlug}`);
  };

  if (!isAuthenticated) {
    return (
      <Button className="w-full" size="lg" onClick={handleEnroll}>
        <LogIn className="h-4 w-4 mr-2" />
        Inicia sesion para inscribirte
      </Button>
    );
  }

  if (visibility === 'private') {
    return (
      <Button className="w-full" size="lg" disabled>
        Requiere invitacion
      </Button>
    );
  }

  return (
    <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      Inscribirme gratis
    </Button>
  );
}
