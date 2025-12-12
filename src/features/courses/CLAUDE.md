# Feature: Courses

## Descripción
Sistema de gestión de cursos para organizaciones. Permite a owners crear cursos con módulos y lecciones, y gestionar el acceso de estudiantes.

## Estructura
```
/src/features/courses/
├── CLAUDE.md              # Este archivo
├── index.ts               # Exports públicos
├── types/index.ts         # Zod schemas + TS types
├── courses.query.ts       # SELECT operations
├── courses.command.ts     # INSERT/UPDATE/DELETE
├── courses.handler.ts     # Business logic + validation
├── courses.actions.ts     # Server Actions
└── components/            # UI específica (por crear)
```

## Modelo de Datos

### Jerarquía
```
Organization
└── Course (public/private, draft/published/archived)
    ├── CourseModule (opcional, para agrupar)
    │   └── Lesson
    └── Lesson (standalone, sin módulo)
```

### Tablas
- `courses` - Cursos de una org
- `course_modules` - Agrupación opcional de lecciones
- `lessons` - Contenido (video, text, pdf, audio, quiz, assignment)
- `course_enrollments` - Acceso de usuarios a cursos

### Tipos de Lección
| Tipo | Contenido JSON |
|------|----------------|
| video | `{ embed_url, provider }` |
| text | `{ html }` |
| pdf | `{ file_url, file_name, file_size }` |
| audio | `{ file_url, embed_url, duration_seconds }` |
| quiz | `{ questions: [...], passing_score }` |
| assignment | `{ instructions_html, submission_type }` |

## Visibilidad y Acceso

| visibility | Quién ve | Inscripción |
|------------|----------|-------------|
| public | Todos | Auto-inscripción |
| private | Solo invitados | Owner invita manualmente |

**Importante**: Cursos privados son **invisibles** para usuarios no invitados (404).

## Rutas

### Admin (Owner)
- `/app/[slug]/admin/courses` - Lista de cursos
- `/app/[slug]/admin/courses/new` - Crear curso (wizard)
- `/app/[slug]/admin/courses/[courseSlug]` - Editar curso

### Público (Alumno)
- `/app/[slug]/courses` - Catálogo
- `/app/[slug]/courses/[courseSlug]` - Detalle/landing
- `/app/[slug]/learn/[courseSlug]` - Área de aprendizaje
- `/app/[slug]/learn/[courseSlug]/[lessonSlug]` - Lección

## Server Actions

### Courses
- `createCourseAction` - Crear curso
- `updateCourseAction` - Actualizar curso
- `publishCourseAction` - Publicar
- `unpublishCourseAction` - Despublicar
- `archiveCourseAction` - Archivar
- `deleteCourseAction` - Eliminar (solo draft/archived)
- `reorderCoursesAction` - Reordenar

### Modules
- `createModuleAction` - Crear módulo
- `updateModuleAction` - Actualizar
- `deleteModuleAction` - Eliminar (lecciones quedan standalone)
- `reorderModulesAction` - Reordenar

### Lessons
- `createLessonAction` - Crear lección
- `updateLessonAction` - Actualizar
- `publishLessonAction` - Publicar
- `unpublishLessonAction` - Despublicar
- `deleteLessonAction` - Eliminar
- `reorderLessonsAction` - Reordenar (puede mover entre módulos)

### Enrollments
- `enrollUserAction` - Invitar usuario (owner)
- `selfEnrollAction` - Auto-inscripción (cursos públicos)
- `revokeEnrollmentAction` - Revocar acceso
- `deleteEnrollmentAction` - Eliminar enrollment
- `markLessonViewedAction` - Marcar lección vista (UX tracking)

## RLS Policies

### courses
- Public: ver publicados + públicos
- Enrolled: ver privados donde están inscritos
- Org members: ver todos los de su org
- Owners/admins: gestionar

### lessons
- Public: ver free_preview de cursos públicos
- Enrolled: ver publicadas de sus cursos
- Org members: ver todas
- Owners/admins: gestionar

### course_enrollments
- Users: ver propios, actualizar viewed_lessons
- Users: auto-inscribirse en públicos
- Owners/admins: gestionar

## Progreso (Fase Actual)

- NO se trackea % de completado
- SÍ se guardan `viewed_lessons[]` para UX
- `last_viewed_lesson_id` para "continuar donde lo dejaste"

## TODO / Próximas Fases

- [ ] Componentes UI del admin
- [ ] Wizard de creación de curso
- [ ] Editor de lecciones por tipo
- [ ] Gestión de estudiantes
- [ ] Catálogo público
- [ ] Player de lecciones
- [ ] Certificados (futuro)
- [ ] Progreso % (futuro)
- [ ] Quizzes con evaluación (futuro)

## Testing

```bash
npm run test -- features/courses
```

### Casos a Testear
- [ ] Crear curso con slug válido/inválido
- [ ] Publicar curso sin lecciones
- [ ] Eliminar curso publicado (debe fallar)
- [ ] Auto-inscripción en curso público
- [ ] Acceso a curso privado sin invitación (404)
- [ ] Reordenar lecciones entre módulos

## Decisiones de Arquitectura

1. **Módulos opcionales**: Una lección puede existir sin módulo (`module_id = NULL`)
2. **Soft delete via status**: Cursos archivados no se eliminan físicamente
3. **Viewed tracking simple**: Array de UUIDs en lugar de tabla separada (escala hasta ~1000 lecciones)
4. **Sin storage propio**: Videos/PDFs/Audios son embeds/URLs externas
