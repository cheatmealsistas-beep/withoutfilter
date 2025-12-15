-- Migration: Game Content for Without Filter
-- Description: Creates the game_content table for questions, challenges, and other game content

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: game_content
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content type and category
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('question', 'group_vote', 'challenge', 'confession', 'hot_seat')),
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('suave', 'atrevida', 'sin_filtro')),

  -- Content text (Spanish primary)
  text_es TEXT NOT NULL,
  text_en TEXT,  -- Future: English translation

  -- Content metadata
  is_group_target BOOLEAN DEFAULT false NOT NULL,  -- Requires selecting someone from the group
  requires_confession BOOLEAN DEFAULT false NOT NULL,  -- Player must confess something
  is_yes_no BOOLEAN DEFAULT false NOT NULL,  -- Simple yes/no answer (hot_seat)

  -- Challenge-specific fields
  instructions JSONB,  -- {"duration": 30, "physical": true, "props": ["phone"]}

  -- Usage stats
  times_used INTEGER DEFAULT 0 NOT NULL,
  times_skipped INTEGER DEFAULT 0 NOT NULL,

  -- Metadata
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_text_es CHECK (char_length(text_es) >= 10)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_game_content_type_category ON game_content(type, category);
CREATE INDEX IF NOT EXISTS idx_game_content_active ON game_content(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_game_content_random ON game_content(id) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_game_content_updated_at
  BEFORE UPDATE ON game_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read active content
CREATE POLICY "Anyone can read active content"
  ON game_content
  FOR SELECT
  USING (is_active = true);

-- Service role manages content (admin, seeds)
CREATE POLICY "Service role manages content"
  ON game_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA: Initial Questions and Challenges
-- ═══════════════════════════════════════════════════════════════════════════

-- CATEGORIA: SUAVE - Preguntas divertidas pero light
INSERT INTO game_content (type, category, text_es, is_group_target) VALUES
  -- Preguntas personales suaves
  ('question', 'suave', '¿Cuál es la excusa más absurda que has dado para no ir a un plan?', false),
  ('question', 'suave', '¿Cuál es tu guilty pleasure musical que te da vergüenza admitir?', false),
  ('question', 'suave', '¿Cuál es la cosa más random que tienes guardada en tu móvil?', false),
  ('question', 'suave', '¿Cuál fue tu fase más cringe de adolescente?', false),
  ('question', 'suave', '¿Cuál es tu superstición más ridícula?', false),
  ('question', 'suave', '¿Cuál es el sueño más raro que has tenido?', false),
  ('question', 'suave', '¿Cuál es tu talento oculto más inútil?', false),
  ('question', 'suave', '¿Qué serie o película has visto más de 5 veces?', false),

  -- Votaciones grupales suaves
  ('group_vote', 'suave', '¿Quién del grupo sería el peor superviviente en una isla desierta?', true),
  ('group_vote', 'suave', '¿Quién del grupo tiene el mejor sentido del humor?', true),
  ('group_vote', 'suave', '¿Quién del grupo es más probable que llegue tarde a su propia boda?', true),
  ('group_vote', 'suave', '¿Quién del grupo sería el mejor influencer?', true),
  ('group_vote', 'suave', '¿Quién del grupo es más probable que se haga viral por algo random?', true),
  ('group_vote', 'suave', '¿Quién del grupo daría mejor consejo de vida?', true),

  -- Retos suaves
  ('challenge', 'suave', 'Imita a alguien famoso hasta que el grupo adivine quién es', false),
  ('challenge', 'suave', 'Cuenta un chiste malo. Si nadie se ríe, pierdes puntos', false),
  ('challenge', 'suave', 'Haz tu mejor pose de foto de Instagram. El grupo vota si es creíble', false),
  ('challenge', 'suave', 'Describe tu última búsqueda de Google sin mentir', false);

-- CATEGORIA: ATREVIDA - Preguntas más picantes
INSERT INTO game_content (type, category, text_es, is_group_target) VALUES
  -- Preguntas personales atrevidas
  ('question', 'atrevida', '¿Cuál es la mentira más grande que le has dicho a tus padres?', false),
  ('question', 'atrevida', '¿Cuál es la cosa más ilegal que has hecho?', false),
  ('question', 'atrevida', '¿Cuál es tu fantasía que nunca has contado a nadie?', false),
  ('question', 'atrevida', '¿Cuál fue tu peor cita y por qué?', false),
  ('question', 'atrevida', '¿Cuál es el crush más vergonzoso que has tenido?', false),
  ('question', 'atrevida', '¿De qué ex te arrepientes más?', false),
  ('question', 'atrevida', '¿Cuál es la cosa más estúpida que has hecho por amor?', false),
  ('question', 'atrevida', '¿Has fingido un orgasmo? Cuéntanos la historia', false),

  -- Votaciones grupales atrevidas
  ('group_vote', 'atrevida', '¿Quién del grupo es más probable que tenga un OnlyFans secreto?', true),
  ('group_vote', 'atrevida', '¿Quién del grupo es el/la más coqueto/a?', true),
  ('group_vote', 'atrevida', '¿Quién del grupo es más probable que haya stalkeado a un ex recientemente?', true),
  ('group_vote', 'atrevida', '¿Con quién del grupo tendrías una aventura si no hubiera consecuencias?', true),
  ('group_vote', 'atrevida', '¿Quién del grupo besa mejor según su cara?', true),
  ('group_vote', 'atrevida', '¿Quién del grupo es más probable que tenga un sugar daddy/mommy?', true),

  -- Retos atrevidos
  ('challenge', 'atrevida', 'Lee el último DM que enviaste en voz alta', false),
  ('challenge', 'atrevida', 'Enseña la última foto que tienes en la galería (sin trampas)', false),
  ('challenge', 'atrevida', 'Envía un mensaje random a la tercera persona de tu lista de WhatsApp', false),
  ('challenge', 'atrevida', 'Cuenta tu peor vergüenza de borrachera', false);

-- CATEGORIA: SIN FILTRO - Sin límites
INSERT INTO game_content (type, category, text_es, is_group_target) VALUES
  -- Preguntas personales sin filtro
  ('question', 'sin_filtro', '¿Con cuántas personas te has acostado? Y no vale mentir', false),
  ('question', 'sin_filtro', '¿Cuál es tu fetiche más raro?', false),
  ('question', 'sin_filtro', '¿Alguna vez has sido infiel? Cuéntalo todo', false),
  ('question', 'sin_filtro', '¿Cuál es la cosa más turbia que has hecho y de la que te arrepientes?', false),
  ('question', 'sin_filtro', '¿Cuál es tu secreto más oscuro?', false),
  ('question', 'sin_filtro', '¿Has tenido fantasías con alguien de este grupo?', false),
  ('question', 'sin_filtro', '¿Cuál es la cosa más cuestionable moralmente que has hecho?', false),
  ('question', 'sin_filtro', '¿Alguna vez has traicionado a un amigo? ¿Por qué?', false),

  -- Votaciones grupales sin filtro
  ('group_vote', 'sin_filtro', '¿Quién del grupo crees que tiene más secretos turbios?', true),
  ('group_vote', 'sin_filtro', '¿Quién del grupo sería el/la más salvaje en la cama?', true),
  ('group_vote', 'sin_filtro', '¿Quién del grupo es más probable que haya mandado nudes?', true),
  ('group_vote', 'sin_filtro', '¿A quién del grupo te llevarías a un trío?', true),
  ('group_vote', 'sin_filtro', '¿Quién del grupo es el/la más tóxico/a en relaciones?', true),
  ('group_vote', 'sin_filtro', '¿Quién del grupo miente más?', true),

  -- Retos sin filtro
  ('challenge', 'sin_filtro', 'Lee el último mensaje de tu app de citas en voz alta', false),
  ('challenge', 'sin_filtro', 'Confiesa algo que nunca has contado a nadie del grupo', false),
  ('challenge', 'sin_filtro', 'Llama a tu ex y déjale un mensaje de voz (el grupo decide qué dices)', false),
  ('challenge', 'sin_filtro', 'Muestra tu historial de búsqueda de esta semana', false);

-- HOT SEAT: Preguntas rápidas sí/no
INSERT INTO game_content (type, category, text_es, is_yes_no) VALUES
  ('hot_seat', 'suave', '¿Alguna vez has mentido en una entrevista de trabajo?', true),
  ('hot_seat', 'suave', '¿Te has enamorado de alguien que no debías?', true),
  ('hot_seat', 'suave', '¿Alguna vez has fingido no ver a alguien por la calle?', true),
  ('hot_seat', 'atrevida', '¿Has stalkeado a alguien en las últimas 24 horas?', true),
  ('hot_seat', 'atrevida', '¿Has pensado en alguien del grupo de forma no tan inocente?', true),
  ('hot_seat', 'atrevida', '¿Alguna vez has ghosteado a alguien?', true),
  ('hot_seat', 'sin_filtro', '¿Alguna vez te has arrepentido de acostarte con alguien?', true),
  ('hot_seat', 'sin_filtro', '¿Has hecho algo de lo que te avergonzarías si tus padres se enteraran?', true);

-- CONFESIONES
INSERT INTO game_content (type, category, text_es, requires_confession) VALUES
  ('confession', 'suave', 'Confiesa algo que te da vergüenza admitir que te gusta', true),
  ('confession', 'suave', 'Confiesa una mentira piadosa que dijiste recientemente', true),
  ('confession', 'atrevida', 'Confiesa la cosa más loca que has hecho borracho/a', true),
  ('confession', 'atrevida', 'Confiesa tu pensamiento más oscuro sobre alguien del grupo', true),
  ('confession', 'sin_filtro', 'Confiesa algo que podría hacer que alguien del grupo te mire diferente', true),
  ('confession', 'sin_filtro', 'Confiesa el secreto más heavy que guardas de alguien', true);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE game_content IS 'Questions, challenges, and other content for Without Filter game';
COMMENT ON COLUMN game_content.type IS 'Content type: question, group_vote, challenge, confession, hot_seat';
COMMENT ON COLUMN game_content.category IS 'Intensity level: suave, atrevida, sin_filtro';
COMMENT ON COLUMN game_content.is_group_target IS 'If true, player must select someone from the group';
COMMENT ON COLUMN game_content.requires_confession IS 'If true, player must confess something';
COMMENT ON COLUMN game_content.is_yes_no IS 'If true, only yes/no answers allowed (hot_seat)';
COMMENT ON COLUMN game_content.instructions IS 'Challenge-specific instructions (duration, props, etc.)';
