# 🚀 COMPLETE AUTOMATION SETUP - Word of the Day Website

## 🎯 What This Does

Creates a **100% automated** Word of the Day website where:
- ✅ New word appears automatically every day at midnight
- ✅ Data stored in Supabase
- ✅ Website auto-deploys on code changes (Vercel)
- ✅ No manual intervention needed
- ✅ Minimalist black & white design (like your image)

---

## 📋 COMPLETE SETUP (30 Minutes)

### ✅ STEP 1: Setup Supabase (10 min)

#### 1.1 Create Supabase Project
1. Go to: https://supabase.com
2. Click "Start your project"
3. Create new organization (or use existing)
4. Create new project:
   - Name: `word-of-the-day`
   - Database Password: [Strong password]
   - Region: Closest to you
5. Wait 2-3 minutes for project to initialize

#### 1.2 Run Database Migration
1. In Supabase Dashboard → SQL Editor
2. Paste this complete SQL:

```sql
-- Create words table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  meaning TEXT NOT NULL,
  example TEXT,
  scheduled_date DATE NOT NULL UNIQUE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS words_scheduled_date_idx 
  ON public.words(scheduled_date);

-- Enable RLS
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved words
CREATE POLICY "Public read access"
  ON public.words FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Insert sample word for today
INSERT INTO public.words (
  word,
  pronunciation,
  part_of_speech,
  meaning,
  example,
  scheduled_date,
  status
) VALUES (
  'self-care',
  'self ker',
  'noun',
  'the practice of taking action to preserve or improve one''s own health.',
  'Taking time for self-care is essential for mental wellbeing.',
  CURRENT_DATE,
  'approved'
) ON CONFLICT (scheduled_date) DO NOTHING;
```

3. Click "Run"
4. Should see "Success"

#### 1.3 Get Supabase Credentials
1. Go to: Settings → API
2. Copy these (keep them safe):
   - **Project URL** (starts with https://)
   - **anon public key** (starts with eyJ)

---

### ✅ STEP 2: Deploy Edge Function (10 min)

#### 2.1 Install Supabase CLI

**On Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

**On Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 2.2 Login to Supabase
```bash
supabase login
```

#### 2.3 Link Your Project
```bash
# In your project directory
cd ai-word-of-the-day-website
supabase link --project-ref YOUR_PROJECT_REF
```

**Find YOUR_PROJECT_REF:**
- In Supabase Dashboard → Settings → General
- Under "Reference ID"

#### 2.4 Create Function Directory
```bash
mkdir -p supabase/functions/generate-daily-word
```

#### 2.5 Copy Function Code
Create file: `supabase/functions/generate-daily-word/index.ts`
Copy the content from `generate-daily-word-function.ts` provided in the fix package.

#### 2.6 Deploy Function
```bash
supabase functions deploy generate-daily-word
```

#### 2.7 Set Environment Variables
```bash
supabase secrets set OPENAI_API_KEY=your_key_here
```

---

### ✅ STEP 3: Setup Automation (5 min)

**Option A: Using Supabase Cron (Recommended)**

1. Go to: Supabase Dashboard → Database → Cron Jobs
2. Click "Create a new cron job"
3. Fill in:
   - **Name:** `generate-daily-word`
   - **Schedule:** `0 0 * * *` (midnight daily)
   - **SQL Command:**
   ```sql
   SELECT net.http_post(
     url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word',
     headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
   );
   ```
4. Replace YOUR_PROJECT_REF and YOUR_ANON_KEY
5. Click "Create"

**Option B: Using External Cron (Alternative)**

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free)

Configure to hit:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word
```
Every day at midnight.

---

### ✅ STEP 4: Update Frontend Code (5 min)

#### 4.1 Replace WordCard Component
Replace `src/components/WordCard.tsx` with `WordCard_Minimalist.tsx`

#### 4.2 Update Environment Variables
Create `.env` in project root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_key
```

#### 4.3 Test Locally
```bash
npm install
npm run dev
```

Visit: http://localhost:5173
Should see today's word!

---

### ✅ STEP 5: Deploy to Vercel (Auto-deploy) (5 min)

#### 5.1 Connect GitHub Repository
1. Push code to GitHub:
```bash
git add .
git commit -m "Setup automated word of the day"
git push origin main
```

#### 5.2 Deploy to Vercel
1. Go to: https://vercel.com
2. Click "New Project"
3. Import `skchinna7/ai-word-of-the-day-website`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

#### 5.3 Configure Domain
1. Vercel Dashboard → Domains
2. Add: `www.wotd.in`
3. Configure DNS at your registrar

---

## 🎉 AUTOMATION IS COMPLETE!

### How It Works:

1. **Every Day at Midnight:**
   - Supabase cron job triggers
   - Edge function runs
   - Selects random word from pool
   - Inserts into database with today's date

2. **When User Visits Website:**
   - React app fetches today's word
   - Displays in minimalist black design
   - All automatic!

3. **When You Update Code:**
   - Push to GitHub
   - Vercel automatically deploys
   - Site updates in 1-2 minutes

---

## 🔧 TESTING THE AUTOMATION

### Test Edge Function Manually:
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Should return:
```json
{
  "success": true,
  "message": "Word created successfully",
  "word": {...}
}
```

### Test Cron Job:
1. Go to: Supabase Dashboard → Database → Cron Jobs
2. Click "Run now" next to your job
3. Check words table - should have new entry

---

## 📊 MONITORING

### Check Daily Words:
```sql
-- In Supabase SQL Editor
SELECT * FROM words 
ORDER BY scheduled_date DESC 
LIMIT 7;
```

### View Cron Job History:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname = 'generate-daily-word'
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🎨 CUSTOMIZATION

### Add More Words:
Edit `generate-daily-word-function.ts`:
```typescript
const WORD_POOL = [
  {
    word: 'YourWord',
    pronunciation: 'pronunciation',
    part_of_speech: 'noun',
    meaning: 'definition here',
    example: 'example sentence',
  },
  // Add more...
]
```

Redeploy:
```bash
supabase functions deploy generate-daily-word
```

### Change Design:
Edit `WordCard_Minimalist.tsx`:
- Colors (currently black background)
- Font sizes
- Layout

### Change Schedule:
Modify cron expression:
- `0 0 * * *` = Midnight daily
- `0 12 * * *` = Noon daily  
- `0 9 * * 1` = Monday 9 AM

---

## 🆘 TROUBLESHOOTING

### No Word Appears:
```bash
# Check database
SELECT * FROM words WHERE scheduled_date = CURRENT_DATE;

# If empty, run function manually:
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Cron Not Running:
1. Check Supabase Dashboard → Database → Cron Jobs
2. Verify job is enabled
3. Check job run history for errors

### Frontend Not Loading:
1. Check browser console (F12)
2. Verify environment variables in Vercel
3. Clear cache (Ctrl+Shift+Delete)

---

## 📝 MAINTENANCE

### Completely Hands-Off:
Once setup, the system runs automatically. No daily work needed!

### Weekly Check (Optional):
- Verify words are generating
- Check website is live
- Review analytics (if setup)

### Monthly Tasks (Optional):
- Add new words to pool
- Review user feedback
- Update dependencies

---

## 🎯 SUCCESS CHECKLIST

After setup, verify:

- [ ] Database table exists
- [ ] Sample word visible
- [ ] Edge function deployed
- [ ] Cron job scheduled
- [ ] Frontend deployed to Vercel
- [ ] Custom domain working
- [ ] New word appears tomorrow

---

## 🚀 YOU'RE DONE!

Your website is now:
✅ **100% Automated**
✅ **Self-maintaining**
✅ **Auto-deploying**
✅ **Production ready**

New words will appear every day automatically at midnight.

---

## 📞 QUICK REFERENCE

**Supabase Dashboard:** https://supabase.com/dashboard
**Vercel Dashboard:** https://vercel.com/dashboard
**Your Site:** https://www.wotd.in

**Test Function:**
```bash
https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word
```

**Cron Schedule:** Daily at 00:00 UTC

**That's it! Enjoy your automated Word of the Day website! 🎉**
