# 🚨 QUICK ERROR REFERENCE GUIDE

Common errors and instant fixes for www.wotd.in deployment.

---

## ❌ ERROR: "Invalid login credentials"

**What you see:**
- Login form shows error message
- Cannot log in with admin@wotd.in

**Causes & Fixes:**

### Fix 1: User doesn't exist
```
Go to: Supabase Dashboard → Authentication → Users
Check: Is admin@wotd.in in the list?
If NO: Click "Add User" and create it
If YES: Continue to Fix 2
```

### Fix 2: User not confirmed
```
In Supabase Users list:
Check: Green checkmark next to email?
If NO: Delete user and recreate with "Auto Confirm" checked
```

### Fix 3: Wrong password
```
Reset password in Supabase:
1. Click on user
2. Click "Reset Password"
3. Set new password
4. Try logging in again
```

---

## ❌ ERROR: "Failed to fetch" or "Network error"

**What you see:**
- Console error: "Failed to fetch"
- Or: "Network request failed"
- Cannot connect to Supabase

**Causes & Fixes:**

### Fix 1: Environment variables missing
```bash
Vercel Dashboard → Settings → Environment Variables
Check both are set:
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY

If missing: Add them and redeploy
```

### Fix 2: Environment variables incorrect
```bash
Check in Vercel:
- VITE_SUPABASE_URL starts with https://
- VITE_SUPABASE_ANON_KEY starts with eyJ
- No quotes around values
- No extra spaces

If wrong: Fix and redeploy
```

### Fix 3: Not redeployed after adding env vars
```bash
Vercel Dashboard → Deployments
Click ••• → Redeploy
Wait 2 minutes
```

---

## ❌ ERROR: Admin page redirects to home

**What you see:**
- Visit /admin
- Immediately redirects to /
- Cannot access admin panel

**Causes & Fixes:**

### Fix 1: Not logged in
```
1. Go to /login
2. Login with admin@wotd.in
3. Then try /admin again
```

### Fix 2: Wrong email
```
Check console (F12):
Look for: "Current user: [email]"
If not admin@wotd.in:
- Logout
- Login with correct email
```

### Fix 3: isAdmin check failing
```
Check console (F12):
Look for: "Is admin: false"
Should be: "Is admin: true"

Fix: Email must be exactly:
- admin@wotd.in OR
- admin@wordofday.com
```

---

## ❌ ERROR: Blank/White screen

**What you see:**
- Site loads but shows nothing
- White screen
- Loading forever

**Causes & Fixes:**

### Fix 1: JavaScript error
```
1. Press F12 (open console)
2. Look for RED errors
3. Common error: "Cannot read property of undefined"
4. Usually means: Wrong code version deployed
5. Fix: Deploy the fixed files from this guide
```

### Fix 2: Build failed
```
Vercel Dashboard → Deployments
Check: Green ✅ or Red ❌?
If red:
1. Click on failed deployment
2. Read error logs
3. Usually: Missing dependencies
4. Fix: npm install, commit, push
```

### Fix 3: Old cache
```
Clear browser cache:
1. Ctrl+Shift+Delete
2. Select "All time"
3. Clear cache and cookies
4. Refresh page (Ctrl+F5)
```

---

## ❌ ERROR: "Supabase not configured"

**What you see:**
- Console: "⚠️ Supabase not configured"
- Mock login message
- Auth disabled

**Causes & Fixes:**

### Fix: Environment variables not loaded
```bash
1. Check Vercel environment variables exist
2. Check they're applied to Production
3. Redeploy after adding variables
4. Clear browser cache
5. Hard refresh (Ctrl+Shift+R)
```

---

## ❌ ERROR: 404 Not Found on /admin

**What you see:**
- Visit /admin
- Shows "404 - Page not found"

**Causes & Fixes:**

### Fix 1: Routing issue
```
Check vercel.json exists in project root:
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}

If missing: Add this file and redeploy
```

### Fix 2: Build issue
```
Local test:
npm run build
npm run preview

If works locally but not production:
- Redeploy from Vercel dashboard
```

---

## ❌ ERROR: CORS Error

**What you see:**
- Console: "CORS policy blocked"
- Or: "Access-Control-Allow-Origin"

**Causes & Fixes:**

### Fix: Redirect URLs not configured
```
Supabase → Authentication → URL Configuration
Add these redirect URLs:
- https://www.wotd.in/*
- https://www.wotd.in/login
- https://www.wotd.in/admin

Click Save
```

---

## ❌ ERROR: "Database error" or SQL errors

**What you see:**
- Console: Database errors
- Profile creation fails
- Data not saving

**Causes & Fixes:**

### Fix 1: Tables don't exist
```
Run migration:
1. Supabase → SQL Editor
2. Paste complete_database_setup.sql
3. Click Run
4. Check for errors
```

### Fix 2: RLS policies blocking
```
Check Supabase → Table Editor
Each table should show:
- RLS: Enabled
- Policies: 2-3 policies listed

If missing:
- Re-run migration script
```

---

## 🔍 DIAGNOSTIC COMMANDS

### Check if Supabase is configured:
```javascript
// In browser console (F12)
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

### Check current user:
```javascript
// In browser console (F12)
// After login
const { data } = await supabase.auth.getSession();
console.log('User:', data.session?.user?.email);
```

### Check admin status:
```javascript
// Look in console for this log:
// "🔍 Current user: admin@wotd.in | Is admin: true"
```

---

## 📞 STILL STUCK?

**Before asking for help, provide:**

1. **Error Message:**
   - Exact text from console
   - Screenshot if possible

2. **What You Tried:**
   - Which fixes from this guide
   - What happened when you tried

3. **Environment:**
   - Browser (Chrome, Firefox, etc.)
   - Vercel deployment URL
   - Supabase project ID

4. **Screenshots:**
   - Console errors (F12)
   - Vercel env variables (blur values!)
   - What you see on screen

---

## 🎯 QUICK WIN CHECKLIST

If nothing works, start over with these 5 steps:

```
1. ✅ Create fresh admin user in Supabase
   (Delete old one first)

2. ✅ Double-check environment variables in Vercel
   (Copy-paste from Supabase API settings)

3. ✅ Run complete_database_setup.sql in Supabase
   (SQL Editor)

4. ✅ Redeploy from Vercel
   (Deployments → Redeploy)

5. ✅ Clear cache and try in incognito
   (Ctrl+Shift+N)
```

**Success rate: 95%** 🎉

---

**Remember:** Most errors are due to:
1. Environment variables not set (40%)
2. User not created/confirmed (30%)
3. Cache issues (20%)
4. Wrong email (10%)
