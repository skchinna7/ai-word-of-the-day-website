-- SIMPLE DATABASE SETUP FOR WORD OF THE DAY
-- Run this in Supabase SQL Editor

-- Create words table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  phonetic TEXT,
  definition TEXT NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public read
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.words
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert" ON public.words
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Add first word
INSERT INTO public.words (word, phonetic, definition, scheduled_date, status)
VALUES (
  'self-care',
  'self ker',
  'the practice of taking action to preserve or improve one''s own health.',
  CURRENT_DATE,
  'approved'
) ON CONFLICT DO NOTHING;

-- Add a few more sample words for testing
INSERT INTO public.words (word, phonetic, definition, scheduled_date, status)
VALUES 
(
  'serendipity',
  'ser-ən-ˈdi-pə-tē',
  'the occurrence of events by chance in a happy or beneficial way.',
  CURRENT_DATE + INTERVAL '1 day',
  'approved'
),
(
  'resilience',
  'ri-ˈzil-yən(t)s',
  'the capacity to recover quickly from difficulties; toughness.',
  CURRENT_DATE + INTERVAL '2 days',
  'approved'
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup complete! ✅' as message;
