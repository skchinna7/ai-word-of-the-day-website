# 🚀 PRODUCTION DEPLOYMENT FIX GUIDE

## 🎯 Complete Step-by-Step Solution

This guide will fix your production deployment issues and get your site live at www.wotd.in

---

## 📋 CRITICAL ISSUES IDENTIFIED IN YOUR CODE

### Issue 1: Duplicate Import in AuthContext.tsx ❌
**Location:** `src/context/AuthContext.tsx` lines 3-4
```typescript
// WRONG - Duplicate imports
import { supabase } from '../lib/supabaseClient';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
```

**Fix:** Remove the duplicate. See fixed version in provided files.

### Issue 2: Missing Environment Variable Validation ❌
Your app doesn't properly validate if Supabase credentials are set correctly.

**Fix:** Added new `envConfig.ts` file with validation.

### Issue 3: Missing Error Handling in Auth Checks ❌
Auth checks don't handle errors properly when Supabase fails.

**Fix:** Updated `supabaseClient.tsx` with better error handling.

---

## 🔧 STEP-BY-STEP FIX PROCESS

### ✅ STEP 1: Replace Fixed Files

**Replace these files in your project with the fixed versions provided:**

1. **src/context/AuthContext.tsx** → Use `AuthContext.tsx` (fixed)
2. **src/lib/supabaseClient.tsx** → Use `supabaseClient.tsx` (fixed)
3. **Add new file:** `src/lib/envConfig.ts` → Use `envConfig.ts`

### ✅ STEP 2: Set Up Environment Variables Locally

1. **Create `.env` file in your project root:**
   ```bash
   # Copy from .env.example
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Go to: https://supabase.com/dashboard
   - Select your project (or create new one)
   - Click: **Settings** → **API**
   - Copy:
     - **Project URL** → Put in `VITE_SUPABASE_URL`
     - **anon public key** → Put in `VITE_SUPABASE_ANON_KEY`

3. **Edit `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
   ```

### ✅ STEP 3: Update Supabase Client Import

**Check all files that import supabaseClient and update them:**

Find files with:
```typescript
import { supabase } from '../lib/supabaseClient';
```

Update to also import the helper:
```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
```

Then add safety checks before using supabase:
```typescript
if (!supabase || !isSupabaseConfigured) {
  console.error('Supabase not configured');
  return;
}
```

### ✅ STEP 4: Configure Supabase Database

**Run these SQL commands in Supabase SQL Editor:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** (left sidebar)
4. Run this migration:

```sql
-- Create user_profiles table if not exists
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

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create words table
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  ai_meaning TEXT,
  example TEXT,
  pronunciation TEXT,
  part_of_speech TEXT,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for words
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- Public can read approved words
CREATE POLICY "Anyone can view approved words"
  ON public.words FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Only admins can insert/update/delete
-- (You'll need to add admin checking via a function)

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS words_scheduled_date_idx 
  ON public.words(scheduled_date);
```

### ✅ STEP 5: Create Admin User in Supabase

1. In Supabase Dashboard: **Authentication** → **Users**
2. Click: **Add User** (green button)
3. Fill in:
   - **Email:** `admin@wotd.in`
   - **Password:** `Admin@123!` (use a strong password)
   - ✅ **Check:** "Auto Confirm User"
4. Click **Save**

### ✅ STEP 6: Configure Supabase Authentication URLs

1. In Supabase Dashboard: **Authentication** → **URL Configuration**
2. Set **Site URL:**
   ```
   https://www.wotd.in
   ```

3. Add **Redirect URLs** (click "Add URL" for each):
   ```
   https://www.wotd.in/*
   https://www.wotd.in/login
   https://www.wotd.in/register
   https://www.wotd.in/admin
   http://localhost:5173/*
   ```

4. Click **Save**

### ✅ STEP 7: Set Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **wotd.in** project
3. Go to: **Settings** → **Environment Variables**
4. Add these variables (click "Add" for each):

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: [Paste your Supabase URL from Step 2]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [Paste your Supabase anon key from Step 2]
Environments: ✅ Production ✅ Preview ✅ Development
```

⚠️ **IMPORTANT:** 
- No quotes around values
- No extra spaces
- Copy the FULL key (it's very long)

5. Click **Save** for each

### ✅ STEP 8: Update Your Code and Deploy

1. **Save all fixed files to your project**
2. **Test locally first:**
   ```bash
   npm install
   npm run dev
   ```
3. **Visit:** http://localhost:5173/login
4. **Try logging in** with admin@wotd.in

5. **If local works, deploy:**
   ```bash
   git add .
   git commit -m "Fix: Production deployment issues - Supabase integration"
   git push origin main
   ```

6. **Or manually redeploy in Vercel:**
   - Go to: **Deployments** tab
   - Click **•••** on latest deployment
   - Click **Redeploy**

### ✅ STEP 9: Verify Production Deployment

1. **Wait 2-3 minutes** for Vercel to build and deploy
2. **Clear browser cache:** Ctrl+Shift+Delete
3. **Visit:** https://www.wotd.in/login
4. **Login with:**
   - Email: `admin@wotd.in`
   - Password: [Your password from Step 5]
5. **After login, visit:** https://www.wotd.in/admin

---

## 🔍 TROUBLESHOOTING

### Problem: "Login doesn't work"

**Check:**
1. ✅ Environment variables set in Vercel?
2. ✅ Admin user created in Supabase?
3. ✅ User has "Auto Confirm" checked?

**Solution:**
- Open browser console (F12)
- Try to login
- Look for error messages
- Common error: "Invalid login credentials" → Recreate user in Supabase

### Problem: "Admin page redirects to home"

**Check:**
1. ✅ User email is exactly `admin@wotd.in`?
2. ✅ Console shows: "Is admin: true"?

**Solution:**
- Check browser console logs
- Verify email in Supabase matches exactly
- Try logging out and back in

### Problem: "White screen / blank page"

**Check:**
1. ✅ Environment variables correct?
2. ✅ No console errors?

**Solution:**
- Check Vercel deployment logs
- Check browser console for errors
- Verify all imports are correct

### Problem: "CORS or network errors"

**Solution:**
- Check Supabase URL Configuration (Step 6)
- Ensure redirect URLs include your domain
- Clear browser cache

---

## 📊 VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] ✅ Local dev works (http://localhost:5173)
- [ ] ✅ Can login locally
- [ ] ✅ Can access /admin locally
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ Admin user created in Supabase
- [ ] ✅ Redirect URLs configured in Supabase
- [ ] ✅ Code committed and pushed to GitHub
- [ ] ✅ Vercel deployment completed successfully
- [ ] ✅ Production site loads (https://www.wotd.in)
- [ ] ✅ Can login on production
- [ ] ✅ Can access /admin on production

---

## 🎉 SUCCESS INDICATORS

Your site is working correctly when:

1. **Home page loads** at https://www.wotd.in
2. **Login works** at https://www.wotd.in/login
3. **Admin panel accessible** at https://www.wotd.in/admin
4. **No console errors** (check with F12)
5. **Console shows:** "✅ Supabase configured - checking session"

---

## 🆘 STILL HAVING ISSUES?

If you're still experiencing problems:

1. **Take screenshots of:**
   - Vercel environment variables page (blur the values)
   - Supabase URL configuration page
   - Browser console errors when trying to login

2. **Provide:**
   - Your site URL
   - What happens when you try to login
   - Any error messages from console
   - Which step failed

3. **Check common mistakes:**
   - Environment variable names exactly match (case-sensitive)
   - No quotes around environment variable values
   - Supabase URL starts with `https://`
   - Supabase key starts with `eyJ`
   - Admin email is exactly `admin@wotd.in` (no spaces)

---

## 📝 ADDITIONAL FILES PROVIDED

1. **AuthContext.tsx** - Fixed authentication context
2. **supabaseClient.tsx** - Improved Supabase client with validation
3. **envConfig.ts** - New environment validation helper
4. **.env.example** - Template for environment variables
5. **vercel.json** - Routing configuration (already in your project)

---

## 🚀 QUICK SUMMARY

1. Replace 3 files with fixed versions
2. Get Supabase credentials
3. Add them to .env locally
4. Run SQL migration in Supabase
5. Create admin user in Supabase
6. Add redirect URLs in Supabase
7. Add environment variables in Vercel
8. Deploy to Vercel
9. Test at www.wotd.in

**Total time:** 15-20 minutes

**Your site will be LIVE! 🎉**
