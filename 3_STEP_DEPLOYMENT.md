# 🚀 GET YOUR SITE LIVE IN 3 STEPS

## ✅ YOU ALREADY HAVE:
- Supabase URL: `https://vikzesimclynhzhavdrl.supabase.co`
- Supabase Key: (in your files)
- HTML files ready to go

---

## 📋 3 SIMPLE STEPS (10 Minutes Total)

### STEP 1: Setup Database (3 min)

1. **Go to:** https://supabase.com/dashboard
2. **Find project:** vikzesimclynhzhavdrl
3. **Click:** SQL Editor (left sidebar)
4. **Copy & Paste this entire SQL:**

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

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.words
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert" ON public.words
  FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.words (word, phonetic, definition, scheduled_date, status)
VALUES (
  'self-care',
  'self ker',
  'the practice of taking action to preserve or improve one''s own health.',
  CURRENT_DATE,
  'approved'
);
```

5. **Click:** Run
6. **Should see:** "Success" ✅

---

### STEP 2: Prepare Your Files (2 min)

You need these 2 files:

**1. Rename files:**
- `index_simple.html` → `index.html`
- `admin_improved.html` → `admin.html`

**2. Your files already have correct credentials:**
```javascript
const SUPABASE_URL = "https://vikzesimclynhzhavdrl.supabase.co";
const SUPABASE_KEY = "eyJhbGci..."; // Your key
```

✅ **You're ready to deploy!**

---

### STEP 3: Deploy to Vercel (5 min)

**Option A: Drag & Drop (Easiest)**

1. Go to: https://vercel.com
2. Click: "Add New" → "Project"  
3. **Drag your files:**
   - index.html
   - admin.html
   - (that's it!)
4. Click: "Deploy"
5. Wait 1 minute
6. **Done!** ✅

**Option B: Via GitHub**

```bash
# 1. Create new repo or use existing
git init
git add index.html admin.html
git commit -m "Word of the Day site"
git push origin main

# 2. Import to Vercel from GitHub
# 3. Deploy
```

---

## 🎉 THAT'S IT!

Your site is now LIVE!

### Test It:

1. **Visit your Vercel URL** (e.g., yoursite.vercel.app)
2. **Should see:** "self-care" word
3. **Go to /admin.html**
4. **Add a new word**
5. **Refresh homepage**
6. **See new word!** ✅

---

## 🌐 Connect Your Domain (www.wotd.in)

After deploying:

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add domain:** `www.wotd.in`
3. **Configure DNS** at your registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. **Wait 5-10 minutes**
5. **Visit:** https://www.wotd.in ✅

---

## 🎨 Customize Design

Your files already have black background + white text!

**To change:**

In `index.html`, find:
```css
body {
    background-color: #000;  /* Black */
    color: #fff;             /* White */
}
```

Change to whatever you want!

---

## 📝 How to Use Daily

### Add New Words:

1. Go to: `yoursite.vercel.app/admin.html`
2. Enter:
   - Word
   - Pronunciation (optional)
   - Definition
   - Date (defaults to today)
3. Click "Save Word"
4. Done! ✅

### Schedule Future Words:

- Set future dates
- Add 30 words for the month
- They'll show automatically on those dates

---

## 🆘 Troubleshooting

### "No words found"
**Fix:** Run the SQL in Step 1

### "Error saving word"
**Fix:** Check Supabase policies are set (Step 1)

### "Blank screen"
**Fix:** 
1. Press F12
2. Check console for errors
3. Usually: wrong Supabase credentials

---

## ✅ Success Checklist

- [ ] Database created in Supabase
- [ ] Sample word inserted
- [ ] Files deployed to Vercel
- [ ] Site loads and shows word
- [ ] Can add words via admin panel

---

## 🎯 Next Steps

1. ✅ Deploy now (10 min)
2. ✅ Add more words via admin
3. ✅ Share with friends!

---

**NO build process needed!**
**NO React, NO Vite, NO complexity!**
**Just HTML + JavaScript + Supabase!**

**SUPER SIMPLE! 🚀**
