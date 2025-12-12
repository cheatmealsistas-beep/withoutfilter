-- Migration: Courses feature
-- Description: Courses, modules, lessons, and enrollments for learning management

-- ============================================
-- TABLA: courses
-- ============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,

  -- Estado y visibilidad
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  -- public: cualquiera puede ver e inscribirse (gratuito)
  -- private: solo usuarios invitados por owner (pago externo)

  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,

  UNIQUE(organization_id, slug)
);

-- ============================================
-- TABLA: course_modules (agrupación opcional)
-- ============================================
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: lessons
-- ============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,  -- NULL = lección suelta

  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Tipo y contenido
  type TEXT NOT NULL DEFAULT 'video' CHECK (
    type IN ('video', 'text', 'pdf', 'audio', 'quiz', 'assignment')
  ),
  content JSONB DEFAULT '{}',
  -- video: { embed_url, provider }
  -- text: { html, blocks }
  -- pdf: { file_url, file_name, file_size }
  -- audio: { file_url, embed_url, duration_seconds }
  -- quiz: { questions: [{ question, options, correct_index }], passing_score }
  -- assignment: { instructions_html, submission_type }

  duration_minutes INTEGER,
  display_order INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(course_id, slug)
);

-- ============================================
-- TABLA: course_enrollments
-- ============================================
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'self_enrolled')),
  -- manual: invitado por owner/admin
  -- self_enrolled: auto-inscrito en curso público

  enrolled_by UUID REFERENCES auth.users(id),  -- NULL si self_enrolled

  enrolled_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,  -- NULL = acceso permanente

  -- Tracking de lecciones vistas (UX, no progreso %)
  viewed_lessons UUID[] DEFAULT '{}',
  last_viewed_lesson_id UUID,
  last_viewed_at TIMESTAMPTZ,

  completed_at TIMESTAMPTZ,

  UNIQUE(course_id, user_id)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_courses_org ON courses(organization_id);
CREATE INDEX idx_courses_org_status ON courses(organization_id, status);
CREATE INDEX idx_courses_published ON courses(organization_id, status) WHERE status = 'published';
CREATE INDEX idx_courses_public ON courses(status, visibility) WHERE status = 'published' AND visibility = 'public';
CREATE INDEX idx_courses_slug ON courses(organization_id, slug);

CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, display_order);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id) WHERE module_id IS NOT NULL;
CREATE INDEX idx_lessons_order ON lessons(course_id, display_order);
CREATE INDEX idx_lessons_course_module_order ON lessons(course_id, module_id, display_order);

CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_active ON course_enrollments(user_id, status) WHERE status = 'active';
CREATE INDEX idx_enrollments_course_status ON course_enrollments(course_id, status);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COURSES RLS
-- ============================================

-- Público puede ver cursos publicados Y públicos
CREATE POLICY "Public can view public published courses" ON courses
  FOR SELECT USING (status = 'published' AND visibility = 'public');

-- Usuarios inscritos pueden ver cursos privados donde están enrolled
CREATE POLICY "Enrolled users can view private courses" ON courses
  FOR SELECT USING (
    status = 'published' AND visibility = 'private' AND
    id IN (
      SELECT course_id FROM course_enrollments
      WHERE user_id = auth.uid() AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Miembros de la org ven todos los cursos de su org
CREATE POLICY "Org members can view all org courses" ON courses
  FOR SELECT USING (organization_id IN (SELECT user_organizations()));

-- Owners/admins pueden gestionar cursos
CREATE POLICY "Owners and admins can manage courses" ON courses
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role full access courses" ON courses
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COURSE_MODULES RLS
-- ============================================

-- Público puede ver módulos de cursos públicos publicados
CREATE POLICY "Public can view modules of public courses" ON course_modules
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses WHERE status = 'published' AND visibility = 'public')
  );

-- Usuarios inscritos pueden ver módulos de sus cursos
CREATE POLICY "Enrolled users can view modules" ON course_modules
  FOR SELECT USING (
    course_id IN (
      SELECT course_id FROM course_enrollments
      WHERE user_id = auth.uid() AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Miembros de la org ven todos los módulos
CREATE POLICY "Org members can view all modules" ON course_modules
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses WHERE organization_id IN (SELECT user_organizations()))
  );

-- Owners/admins pueden gestionar módulos
CREATE POLICY "Owners and admins can manage modules" ON course_modules
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM courses c
      JOIN organization_members om ON om.organization_id = c.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role full access modules" ON course_modules
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- LESSONS RLS
-- ============================================

-- Público puede ver lecciones free preview de cursos públicos
CREATE POLICY "Public can view free preview lessons of public courses" ON lessons
  FOR SELECT USING (
    is_published = true AND is_free_preview = true AND
    course_id IN (SELECT id FROM courses WHERE status = 'published' AND visibility = 'public')
  );

-- Usuarios inscritos pueden ver lecciones publicadas de sus cursos
CREATE POLICY "Enrolled users can view published lessons" ON lessons
  FOR SELECT USING (
    is_published = true AND
    course_id IN (
      SELECT course_id FROM course_enrollments
      WHERE user_id = auth.uid() AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Miembros de la org ven todas las lecciones
CREATE POLICY "Org members can view all lessons" ON lessons
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses WHERE organization_id IN (SELECT user_organizations()))
  );

-- Owners/admins pueden gestionar lecciones
CREATE POLICY "Owners and admins can manage lessons" ON lessons
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM courses c
      JOIN organization_members om ON om.organization_id = c.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role full access lessons" ON lessons
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- ENROLLMENTS RLS
-- ============================================

-- Usuarios ven sus propios enrollments
CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden actualizar su progreso (viewed_lessons)
CREATE POLICY "Users can update own viewed lessons" ON course_enrollments
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usuarios pueden auto-inscribirse en cursos públicos
CREATE POLICY "Users can self enroll in public courses" ON course_enrollments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    source = 'self_enrolled' AND
    enrolled_by IS NULL AND
    course_id IN (SELECT id FROM courses WHERE status = 'published' AND visibility = 'public')
  );

-- Owners/admins pueden gestionar enrollments (invitar usuarios)
CREATE POLICY "Owners and admins can manage enrollments" ON course_enrollments
  FOR ALL USING (
    course_id IN (
      SELECT c.id FROM courses c
      JOIN organization_members om ON om.organization_id = c.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role full access enrollments" ON course_enrollments
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIONES HELPER
-- ============================================

-- Función para verificar si un usuario tiene acceso a un curso
CREATE OR REPLACE FUNCTION user_has_course_access(p_course_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  v_course RECORD;
BEGIN
  -- Obtener info del curso
  SELECT status, visibility, organization_id INTO v_course
  FROM courses WHERE id = p_course_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Curso no publicado: solo org members
  IF v_course.status != 'published' THEN
    RETURN EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = v_course.organization_id AND user_id = p_user_id
    );
  END IF;

  -- Curso público: todos tienen acceso
  IF v_course.visibility = 'public' THEN
    RETURN true;
  END IF;

  -- Curso privado: verificar enrollment o membership
  RETURN EXISTS (
    SELECT 1 FROM course_enrollments
    WHERE course_id = p_course_id AND user_id = p_user_id
    AND status = 'active' AND (expires_at IS NULL OR expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = v_course.organization_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE courses IS 'Courses belonging to an organization';
COMMENT ON TABLE course_modules IS 'Optional grouping of lessons within a course';
COMMENT ON TABLE lessons IS 'Individual lessons: video, text, pdf, audio, quiz, assignment';
COMMENT ON TABLE course_enrollments IS 'User access to courses (invited or self-enrolled)';

COMMENT ON COLUMN courses.status IS 'Lifecycle: draft (hidden), published (active), archived (hidden but preserved)';
COMMENT ON COLUMN courses.visibility IS 'public: anyone can see/enroll (free), private: only invited users (paid externally)';

COMMENT ON COLUMN lessons.module_id IS 'NULL = standalone lesson not grouped in any module';
COMMENT ON COLUMN lessons.type IS 'Content type: video, text, pdf, audio, quiz, assignment';
COMMENT ON COLUMN lessons.content IS 'JSON content varying by type';
COMMENT ON COLUMN lessons.is_free_preview IS 'If true, visible to non-enrolled users as marketing preview';

COMMENT ON COLUMN course_enrollments.source IS 'manual = invited by owner, self_enrolled = public course signup';
COMMENT ON COLUMN course_enrollments.enrolled_by IS 'User who invited (NULL if self_enrolled)';
COMMENT ON COLUMN course_enrollments.expires_at IS 'NULL = permanent access';
COMMENT ON COLUMN course_enrollments.viewed_lessons IS 'Array of lesson IDs user has opened (UX tracking)';

COMMENT ON FUNCTION user_has_course_access IS 'Check if user can access a course (public, enrolled, or org member)';
