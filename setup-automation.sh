#!/bin/bash

# =================================================================
# WORD OF THE DAY - ONE-CLICK AUTOMATION SETUP
# =================================================================
# This script sets up your complete automated website
# Repository: github.com/skchinna7/ai-word-of-the-day-website
# Site: www.wotd.in
# =================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     WORD OF THE DAY - COMPLETE AUTOMATION SETUP            ║"
echo "║                                                            ║"
echo "║  This will set up:                                        ║"
echo "║  ✓ Database with automated word generation                ║"
echo "║  ✓ Minimalist design (black & white)                     ║"
echo "║  ✓ Auto-deploy to Vercel                                 ║"
echo "║  ✓ Daily cron job for new words                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# =================================================================
# STEP 1: Check Prerequisites
# =================================================================

echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js installed:${NC} $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm installed:${NC} $(npm --version)"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "   Please install from: https://git-scm.com/"
    exit 1
fi
echo -e "${GREEN}✅ Git installed:${NC} $(git --version)"

echo ""

# =================================================================
# STEP 2: Get Supabase Credentials
# =================================================================

echo -e "${YELLOW}📋 Step 2: Supabase Configuration${NC}"
echo ""
echo "Please have your Supabase credentials ready:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Go to: Settings → API"
echo ""

read -p "Enter your Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase Anon Key (eyJ...): " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ Supabase credentials are required!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Credentials saved${NC}"
echo ""

# =================================================================
# STEP 3: Update Code Files
# =================================================================

echo -e "${YELLOW}📋 Step 3: Updating code files...${NC}"
echo ""

# Create .env file
cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo -e "${GREEN}✅ Created .env file${NC}"

# Update WordCard to minimalist design
if [ -f "WordCard_Minimalist.tsx" ]; then
    cp WordCard_Minimalist.tsx src/components/WordCard.tsx
    echo -e "${GREEN}✅ Updated WordCard with minimalist design${NC}"
else
    echo -e "${YELLOW}⚠️  WordCard_Minimalist.tsx not found - skipping${NC}"
fi

# Copy fixed AuthContext
if [ -f "AuthContext.tsx" ]; then
    cp AuthContext.tsx src/context/AuthContext.tsx
    echo -e "${GREEN}✅ Updated AuthContext${NC}"
fi

# Copy fixed supabaseClient
if [ -f "supabaseClient.tsx" ]; then
    cp supabaseClient.tsx src/lib/supabaseClient.tsx
    echo -e "${GREEN}✅ Updated supabaseClient${NC}"
fi

# Copy envConfig
if [ -f "envConfig.ts" ]; then
    cp envConfig.ts src/lib/envConfig.ts
    echo -e "${GREEN}✅ Added envConfig${NC}"
fi

echo ""

# =================================================================
# STEP 4: Install Dependencies
# =================================================================

echo -e "${YELLOW}📋 Step 4: Installing dependencies...${NC}"
echo ""

npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# =================================================================
# STEP 5: Test Build
# =================================================================

echo -e "${YELLOW}📋 Step 5: Testing build...${NC}"
echo ""

npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""

# =================================================================
# STEP 6: Database Setup Instructions
# =================================================================

echo -e "${YELLOW}📋 Step 6: Database Setup (Manual)${NC}"
echo ""
echo "Please complete these steps in Supabase Dashboard:"
echo ""
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click: SQL Editor"
echo "4. Run the SQL from: complete_database_setup.sql"
echo ""
read -p "Press Enter when database is set up..."
echo -e "${GREEN}✅ Database setup confirmed${NC}"
echo ""

# =================================================================
# STEP 7: Edge Function Setup Instructions
# =================================================================

echo -e "${YELLOW}📋 Step 7: Edge Function Setup${NC}"
echo ""
echo "To enable automatic daily words:"
echo ""
echo "1. Install Supabase CLI:"
echo "   Mac: brew install supabase/tap/supabase"
echo "   Windows: scoop install supabase"
echo ""
echo "2. Deploy function:"
echo "   supabase login"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo "   supabase functions deploy generate-daily-word"
echo ""
echo "3. Setup cron job in Supabase Dashboard"
echo "   See: COMPLETE_AUTOMATION_GUIDE.md"
echo ""
read -p "Press Enter to continue..."
echo ""

# =================================================================
# STEP 8: Prepare for Deployment
# =================================================================

echo -e "${YELLOW}📋 Step 8: Preparing for deployment...${NC}"
echo ""

# Git setup
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

git add .
git commit -m "Setup: Complete automation with minimalist design" || true
echo -e "${GREEN}✅ Changes committed${NC}"
echo ""

# =================================================================
# STEP 9: Deployment Instructions
# =================================================================

echo -e "${YELLOW}📋 Step 9: Deploy to Vercel${NC}"
echo ""
echo "Final steps to go live:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/skchinna7/ai-word-of-the-day-website.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy on Vercel:"
echo "   - Go to: https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variables:"
echo "     • VITE_SUPABASE_URL"
echo "     • VITE_SUPABASE_ANON_KEY"
echo "   - Click Deploy"
echo ""
echo "3. Configure domain (www.wotd.in)"
echo ""

# =================================================================
# COMPLETION
# =================================================================

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ SETUP COMPLETE!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Your automated Word of the Day website is ready!"
echo ""
echo "Next steps:"
echo "1. ✅ Code is updated and tested"
echo "2. ✅ Environment configured"
echo "3. 📋 Deploy to Vercel (see instructions above)"
echo "4. 📋 Setup Supabase cron job"
echo ""
echo "Documentation:"
echo "• COMPLETE_AUTOMATION_GUIDE.md - Full automation setup"
echo "• ACTION_PLAN.md - Quick checklist"
echo "• ERROR_REFERENCE.md - Troubleshooting"
echo ""
echo "Local testing:"
echo "  npm run dev"
echo "  Visit: http://localhost:5173"
echo ""
echo -e "${GREEN}🎉 Enjoy your automated website!${NC}"
echo ""
