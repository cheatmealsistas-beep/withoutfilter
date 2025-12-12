'use client';

import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, UserX, Trash2, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { getCourseEnrollments } from '../courses.query';
import { revokeEnrollmentAction, deleteEnrollmentAction } from '../courses.actions';
import type { EnrollmentWithUser } from '../types';

interface CourseEnrollmentsManagerProps {
  courseId: string;
  orgSlug: string;
  courseSlug: string;
  locale: string;
}

export function CourseEnrollmentsManager({
  courseId,
  orgSlug,
  courseSlug,
}: CourseEnrollmentsManagerProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<EnrollmentWithUser | null>(
    null
  );
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadEnrollments = async () => {
    setIsLoading(true);
    const { data, error } = await getCourseEnrollments(courseId);
    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setEnrollments(data || []);
  };

  useEffect(() => {
    loadEnrollments();
  }, [courseId]);

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) {
      toast.error('El email es obligatorio');
      return;
    }

    // TODO: Implement finding user by email and enrolling them
    // For now, show a message that this feature is coming
    toast.info(
      'Proximamente: Podras invitar estudiantes por email. Por ahora, el estudiante debe registrarse primero.'
    );
    setIsAddDialogOpen(false);
    setNewStudentEmail('');
  };

  const handleRevoke = async (enrollment: EnrollmentWithUser) => {
    setIsLoading(true);
    const result = await revokeEnrollmentAction(enrollment.id, orgSlug, courseSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Acceso revocado');
      loadEnrollments();
    }
  };

  const handleDelete = async () => {
    if (!enrollmentToDelete) return;

    setIsLoading(true);
    const result = await deleteEnrollmentAction(enrollmentToDelete.id, orgSlug, courseSlug);
    setIsLoading(false);
    setEnrollmentToDelete(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Inscripcion eliminada');
      loadEnrollments();
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading && enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Cargando estudiantes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estudiantes inscritos</CardTitle>
              <CardDescription>
                {enrollments.length === 0
                  ? 'Aun no hay estudiantes inscritos'
                  : `${enrollments.length} estudiante${enrollments.length === 1 ? '' : 's'}`}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar estudiante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Invita a tus primeros estudiantes para que puedan acceder al curso.
              </p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invitar estudiante
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 group"
                >
                  <Avatar>
                    <AvatarImage src={enrollment.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(enrollment.user.full_name, enrollment.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {enrollment.user.full_name || enrollment.user.email}
                    </p>
                    {enrollment.user.full_name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {enrollment.user.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={enrollment.status === 'active' ? 'default' : 'secondary'}
                    >
                      {enrollment.status === 'active' && 'Activo'}
                      {enrollment.status === 'expired' && 'Expirado'}
                      {enrollment.status === 'revoked' && 'Revocado'}
                    </Badge>
                    <Badge variant="outline">
                      {enrollment.source === 'manual' ? 'Invitado' : 'Auto-inscrito'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {enrollment.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleRevoke(enrollment)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Revocar acceso
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEnrollmentToDelete(enrollment)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar inscripcion
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar estudiante</DialogTitle>
            <DialogDescription>
              Introduce el email del estudiante que quieres invitar al curso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-email">Email del estudiante</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="estudiante@ejemplo.com"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              El estudiante recibira acceso inmediato al curso. Si aun no tiene cuenta,
              debera registrarse primero con este email.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddStudent} disabled={isAdding}>
              {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Invitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!enrollmentToDelete}
        onOpenChange={() => setEnrollmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar inscripcion</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que quieres eliminar la inscripcion de{' '}
              {enrollmentToDelete?.user.full_name || enrollmentToDelete?.user.email}?
              El estudiante perdera todo su progreso en el curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
