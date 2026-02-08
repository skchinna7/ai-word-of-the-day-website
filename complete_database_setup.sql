-- ============================================
-- AI WORD OF THE DAY - COMPLETE DATABASE SETUP
-- ============================================
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard → SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  daily_word_email BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  achievement_alerts BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public',
  show_learning_stats BOOLEAN DEFAULT true,
  allow_data_collection BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Words Table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  meaning TEXT NOT NULL,
  ai_meaning TEXT,
  example TEXT,
  pronunciation TEXT,
  part_of_speech TEXT,
  etymology TEXT,
  synonyms TEXT[],
  antonyms TEXT[],
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scheduled_date)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search History Table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Subscriptions Table
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  is_active BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS words_scheduled_date_idx ON public.words(scheduled_date);
CREATE INDEX IF NOT EXISTS words_status_idx ON public.words(status);
CREATE INDEX IF NOT EXISTS words_word_idx ON public.words(word);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS email_subscriptions_email_idx ON public.email_subscriptions(email);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON public.analytics(created_at);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Words Policies
DROP POLICY IF EXISTS "Anyone can view approved words" ON public.words;
CREATE POLICY "Anyone can view approved words"
  ON public.words FOR SELECT
  TO anon, authenticated
  USING (status = 'approved' OR status = 'published');

DROP POLICY IF EXISTS "Authenticated users can view all words" ON public.words;
CREATE POLICY "Authenticated users can view all words"
  ON public.words FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create words" ON public.words;
CREATE POLICY "Authenticated users can create words"
  ON public.words FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own pending words" ON public.words;
CREATE POLICY "Users can update their own pending words"
  ON public.words FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by AND status = 'pending');

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Search History Policies
DROP POLICY IF EXISTS "Users can view own search history" ON public.search_history;
CREATE POLICY "Users can view own search history"
  ON public.search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create search history" ON public.search_history;
CREATE POLICY "Users can create search history"
  ON public.search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Email Subscriptions Policies
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscriptions;
CREATE POLICY "Anyone can subscribe"
  ON public.email_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view by token" ON public.email_subscriptions;
CREATE POLICY "Anyone can view by token"
  ON public.email_subscriptions FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can update by token" ON public.email_subscriptions;
CREATE POLICY "Anyone can update by token"
  ON public.email_subscriptions FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Analytics Policies
DROP POLICY IF EXISTS "Anyone can create analytics" ON public.analytics;
CREATE POLICY "Anyone can create analytics"
  ON public.analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.analytics;
CREATE POLICY "Authenticated users can view analytics"
  ON public.analytics FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 5. CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- User Profiles updated_at trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Words updated_at trigger
DROP TRIGGER IF EXISTS update_words_updated_at ON public.words;
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Email Subscriptions updated_at trigger
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON public.email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON public.email_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 7. INSERT SAMPLE DATA (Optional)
-- ============================================

-- Insert sample word for today
INSERT INTO public.words (
  word,
  meaning,
  ai_meaning,
  example,
  pronunciation,
  part_of_speech,
  scheduled_date,
  status
) VALUES (
  'Serendipity',
  'The occurrence of events by chance in a happy or beneficial way.',
  'Serendipity is the delightful experience of finding something valuable or pleasant when you weren''t looking for it. It''s like discovering a $20 bill in an old jacket pocket or meeting your best friend while lost in a new city.',
  'It was pure serendipity that I met my future business partner at that random coffee shop.',
  '/ˌser-ən-ˈdi-pə-tē/',
  'noun',
  CURRENT_DATE,
  'approved'
) ON CONFLICT (scheduled_date) DO NOTHING;

-- ============================================
-- 8. VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================

-- Next steps:
-- 1. Create admin user in Supabase Authentication
-- 2. Configure environment variables in Vercel
-- 3. Deploy your application
-- 4. Test login and admin access
