ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS human_glyph_set_id text NOT NULL DEFAULT 'numeric',
  ADD COLUMN IF NOT EXISTS opponent_glyph_set_id text NOT NULL DEFAULT 'numeric',
  ADD COLUMN IF NOT EXISTS human_glyph_values jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS opponent_glyph_values jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.game_sessions
SET human_glyph_values = glyph_values,
    opponent_glyph_values = glyph_values
WHERE jsonb_array_length(glyph_values) > 0
  AND jsonb_array_length(human_glyph_values) = 0
  AND jsonb_array_length(opponent_glyph_values) = 0;

ALTER TABLE public.game_sessions
  ADD CONSTRAINT game_sessions_human_glyph_values_array_check CHECK (jsonb_typeof(human_glyph_values) = 'array'),
  ADD CONSTRAINT game_sessions_opponent_glyph_values_array_check CHECK (jsonb_typeof(opponent_glyph_values) = 'array');
