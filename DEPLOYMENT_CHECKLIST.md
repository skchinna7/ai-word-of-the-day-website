# ✅ DEPLOYMENT CHECKLIST - www.wotd.in

Use this checklist to ensure your production deployment is successful.

---

## 🔧 PRE-DEPLOYMENT

### Local Setup
- [ ] Replaced `src/context/AuthContext.tsx` with fixed version
- [ ] Replaced `src/lib/supabaseClient.tsx` with fixed version
- [ ] Added new file `src/lib/envConfig.ts`
- [ ] Created `.env` file from `.env.example`
- [ ] Added Supabase URL to `.env`
- [ ] Added Supabase anon key to `.env`
- [ ] Tested locally: `npm run dev` works
- [ ] Can login locally at http://localhost:5173/login
- [ ] Can access admin at http://localhost:5173/admin

### Code Quality
- [ ] No duplicate imports
- [ ] No console errors in browser (F12)
- [ ] All TypeScript files compile without errors
- [ ] `npm run build` succeeds

---

## 🗄️ SUPABASE SETUP

### Database
- [ ] Logged into https://supabase.com/dashboard
- [ ] Selected/created project
- [ ] Ran `complete_database_setup.sql` in SQL Editor
- [ ] Verified tables exist: user_profiles, words, notifications, etc.
- [ ] Verified RLS is enabled on all tables

### Authentication
- [ ] Created admin user in Authentication → Users
  - Email: `admin@wotd.in`
  - Password: [Strong password]
  - ✅ Auto Confirm User checked
- [ ] Configured URL Configuration:
  - Site URL: `https://www.wotd.in`
  - Redirect URLs added:
    - `https://www.wotd.in/*`
    - `https://www.wotd.in/login`
    - `https://www.wotd.in/register`
    - `https://www.wotd.in/admin`
    - `http://localhost:5173/*`

### API Keys
- [ ] Copied Project URL from Settings → API
- [ ] Copied anon/public key from Settings → API

---

## 🚀 VERCEL DEPLOYMENT

### Repository
- [ ] Code committed to GitHub/GitLab
- [ ] Repository connected to Vercel
- [ ] Project created in Vercel dashboard

### Environment Variables
- [ ] Go to Settings → Environment Variables
- [ ] Added `VITE_SUPABASE_URL`:
  - Value: [Your Supabase URL]
  - ✅ Production ✅ Preview ✅ Development
- [ ] Added `VITE_SUPABASE_ANON_KEY`:
  - Value: [Your Supabase anon key]
  - ✅ Production ✅ Preview ✅ Development
- [ ] Values have NO quotes, NO extra spaces
- [ ] Supabase URL starts with `https://`
- [ ] Supabase key starts with `eyJ`

### Deployment
- [ ] Clicked "Deploy" or "Redeploy"
- [ ] Deployment succeeded (green checkmark)
- [ ] Build logs show no errors
- [ ] No environment variable warnings

### Domain
- [ ] Custom domain `www.wotd.in` added
- [ ] DNS configured correctly:
  - CNAME: www → cname.vercel-dns.com
  - A: @ → 76.76.21.21
- [ ] SSL certificate active (HTTPS works)

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Site Access
- [ ] https://www.wotd.in loads successfully
- [ ] No blank/white screen
- [ ] Home page displays correctly
- [ ] No 404 errors

### Login Functionality
- [ ] https://www.wotd.in/login page loads
- [ ] Can see login form
- [ ] No console errors (F12)
- [ ] Can login with admin@wotd.in
- [ ] Redirects after successful login
- [ ] User email shown in navbar/profile

### Admin Access
- [ ] https://www.wotd.in/admin loads
- [ ] Does NOT redirect to home
- [ ] Can see admin dashboard
- [ ] Admin features accessible

### Browser Console
- [ ] Open F12 → Console
- [ ] No red errors
- [ ] See: "✅ Supabase configured"
- [ ] See: "✅ User logged in: admin@wotd.in"
- [ ] See: "🔍 Current user: admin@wotd.in | Is admin: true"

---

## 🔍 TROUBLESHOOTING CHECKS

If something doesn't work:

### Check #1: Environment Variables
- [ ] Variables visible in Vercel dashboard
- [ ] Exact names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Applied to Production environment
- [ ] Redeployed after adding variables

### Check #2: Supabase Configuration
- [ ] Admin user exists in Supabase
- [ ] User is confirmed (not pending)
- [ ] Redirect URLs include production domain
- [ ] Database tables created successfully

### Check #3: Code Issues
- [ ] No duplicate imports
- [ ] AuthContext.tsx is fixed version
- [ ] supabaseClient.tsx is fixed version
- [ ] All files saved and committed

### Check #4: Browser
- [ ] Cache cleared (Ctrl+Shift+Delete)
- [ ] Tried incognito/private window
- [ ] No browser extensions interfering

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

✅ Home page loads at https://www.wotd.in
✅ Login works with admin@wotd.in
✅ Admin panel accessible
✅ Console shows "Supabase configured"
✅ Console shows "Is admin: true"
✅ No red errors in console
✅ Can see word of the day

---

## 📞 SUPPORT

If you checked all boxes but still have issues:

**Provide these screenshots:**
1. Vercel environment variables (blur values)
2. Browser console when visiting /admin
3. Supabase authentication users list
4. Vercel deployment logs

**Include this info:**
- Which checklist item failed
- Error messages from console
- What happens when you try to login
- Current behavior vs expected behavior

---

## ⏱️ ESTIMATED TIME

- Pre-deployment: 10 minutes
- Supabase setup: 10 minutes
- Vercel deployment: 5 minutes
- Verification: 5 minutes
- **Total: ~30 minutes**

---

## 📝 NOTES

- Keep your Supabase anon key secure
- Don't commit `.env` file to git
- Admin password should be strong
- Test in incognito before confirming success
- Bookmark Vercel and Supabase dashboards

---

**Last Updated:** February 2026
**For Site:** www.wotd.in
**Version:** 1.0
