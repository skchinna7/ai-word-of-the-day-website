-- EMERGENCY DATABASE FIX
-- Copy this ENTIRE thing and run in Supabase SQL Editor

-- Drop existing table if it exists (fresh start)
DROP TABLE IF EXISTS public.words CASCADE;

-- Create table
CREATE TABLE public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  phonetic TEXT,
  definition TEXT NOT NULL,
  scheduled_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE to read
CREATE POLICY "Allow public read" 
  ON public.words 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Allow EVERYONE to insert
CREATE POLICY "Allow public insert" 
  ON public.words 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Allow EVERYONE to update
CREATE POLICY "Allow public update" 
  ON public.words 
  FOR UPDATE 
  TO anon, authenticated 
  USING (true);

-- Add test word
INSERT INTO public.words (word, phonetic, definition, status)
VALUES (
  'self-care',
  'self ker',
  'the practice of taking action to preserve or improve one''s own health.',
  'approved'
);

-- Add another word
INSERT INTO public.words (word, phonetic, definition, status)
VALUES (
  'serendipity',
  'ser-ən-ˈdi-pə-tē',
  'the occurrence of events by chance in a happy or beneficial way.',
  'approved'
);

-- Verify it worked
SELECT 
  word, 
  phonetic, 
  definition, 
  created_at 
FROM public.words;

-- Should see 2 words above
-- If you see them, it worked! ✅
