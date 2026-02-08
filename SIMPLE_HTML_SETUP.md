# 🚀 SIMPLE HTML SETUP - Word of the Day

## ✅ You Already Have Supabase Configured!

I can see from your files you already have:
- ✅ Supabase URL: `https://vikzesimclynhzhavdrl.supabase.co`
- ✅ Supabase Key: (in your files)

---

## 📋 WHAT YOU NEED TO DO (5 Minutes)

### Step 1: Create Database Table (2 min)

1. Go to: https://supabase.com/dashboard
2. Find your project: **vikzesimclynhzhavdrl**
3. Click: **SQL Editor**
4. Paste this SQL:

```sql
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
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert" ON public.words
  FOR INSERT TO anon WITH CHECK (true);

-- Add sample word
INSERT INTO public.words (word, phonetic, definition, scheduled_date)
VALUES (
  'self-care',
  'self ker',
  'the practice of taking action to preserve or improve one''s own health.',
  CURRENT_DATE
);
```

5. Click **Run**
6. Should see "Success"

---

### Step 2: Deploy Files (3 min)

You need 2 files:

**1. index_simple.html** (rename to `index.html`)
- This shows the word to visitors
- Black background, minimalist design

**2. admin_improved.html** (rename to `admin.html`)
- This is where you add new words
- Simple form interface

**Deploy to:**
- **Vercel:** Upload both files
- **Netlify:** Drag & drop
- **GitHub Pages:** Push to repo
- **Any web host:** Upload via FTP

---

### Step 3: Test It Works (1 min)

1. **Open** `index.html` in browser
2. Should see: "self-care" word
3. **Open** `admin.html` 
4. Add a new word
5. Refresh `index.html`
6. Should see new word (if scheduled for today)

---

## 🎯 THAT'S IT!

You now have:
- ✅ Working website
- ✅ Admin panel to add words
- ✅ Minimalist design
- ✅ All data in Supabase

---

## 📝 HOW TO USE

### Add Words Daily:

1. Go to `admin.html`
2. Enter:
   - Word (e.g., "Resilience")
   - Pronunciation (optional)
   - Definition
   - Date (defaults to today)
3. Click "Save Word"
4. Done!

### Schedule Future Words:

- Set "Schedule Date" to future date
- Word will show on that date
- You can add 30 words at once for next month

---

## 🚀 DEPLOY TO VERCEL (Easiest)

### Option A: Via GitHub

```bash
# 1. Create GitHub repo
# 2. Upload files
# 3. Go to vercel.com
# 4. Import from GitHub
# 5. Deploy
```

### Option B: Direct Upload

1. Go to: https://vercel.com
2. Click: "Add New" → "Project"
3. Click: "Upload"
4. Drag your files
5. Deploy

**No build settings needed!** Just upload HTML files.

---

## 🌐 CONNECT DOMAIN (www.wotd.in)

After deploying to Vercel:

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add: `www.wotd.in`
3. Configure DNS at your registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 5-10 minutes
5. Done!

---

## 🎨 CUSTOMIZE DESIGN

### Change Colors:

In `index_simple.html`, find:
```css
body {
    background-color: #000;  /* Black */
    color: #fff;             /* White */
}
```

Change to:
```css
body {
    background-color: #1a1a1a;  /* Dark gray */
    color: #f0f0f0;             /* Off-white */
}
```

### Change Font Size:

```css
#word {
    font-size: 5rem;  /* Change to 6rem for bigger */
}
```

---

## ⚡ AUTOMATION (Optional)

To get new words automatically:

1. Use the `generate-daily-word-function.ts` 
2. Deploy as Supabase Edge Function
3. Set up cron job
4. Words appear automatically

**But for now:** Just manually add words via admin panel!

---

## 🆘 TROUBLESHOOTING

### "No words found"
- Run the SQL in Step 1
- Sample word should appear

### "Error saving word"
- Check RLS policies in Supabase
- Make sure policies allow public insert

### "Blank screen"
- Press F12, check Console
- Look for errors
- Verify Supabase credentials

---

## 📊 CHECK IF IT'S WORKING

1. Open browser console (F12)
2. Go to index.html
3. Should see:
   ```
   ✅ Connecting to Supabase...
   📅 Today: 2026-02-08
   📝 Displaying word: {...}
   ```

If you see errors, copy and paste them!

---

## 🎉 SUCCESS!

Your simple site is:
- ✅ Working
- ✅ Connected to Supabase
- ✅ Easy to manage
- ✅ No complex build process
- ✅ Just HTML + JavaScript

**Much simpler than React/Vite!**

---

## 🔄 NEXT STEPS (Optional)

1. Add more words via admin panel
2. Deploy to Vercel/Netlify
3. Connect custom domain
4. Share with friends!

---

## 📞 QUICK REFERENCE

**Your Supabase:**
- Project: vikzesimclynhzhavdrl
- Dashboard: https://supabase.com/dashboard

**Files Needed:**
- index_simple.html → rename to index.html
- admin_improved.html → rename to admin.html

**Deploy To:**
- Vercel (easiest)
- Netlify
- GitHub Pages
- Any web host

---

**THAT'S IT! SUPER SIMPLE! 🚀**
