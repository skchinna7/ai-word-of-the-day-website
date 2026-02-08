#!/bin/bash

# Quick Start Script for AI Word of the Day Deployment Fix
# Repository: skchinna7/ai-word-of-the-day-website
# Site: www.wotd.in

echo "🚀 AI Word of the Day - Quick Deployment Fix"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "   Install from: https://git-scm.com/downloads"
    exit 1
else
    echo -e "${GREEN}✅ Git is installed${NC}"
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Install from: https://nodejs.org/"
    exit 1
else
    echo -e "${GREEN}✅ Node.js is installed${NC}"
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm is installed${NC}"
fi

echo ""
echo "📂 Checking if you're in the project directory..."

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in project directory${NC}"
    echo "   Please run this script from the ai-word-of-the-day-website directory"
    exit 1
else
    echo -e "${GREEN}✅ In correct directory${NC}"
fi

echo ""
echo "🔍 Checking for required files..."

# Check if fixed files are in current directory
FIXED_FILES=("AuthContext.tsx" "supabaseClient.tsx" "envConfig.ts")
MISSING_FILES=()

for file in "${FIXED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Missing fixed files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please download the fixed files first and place them in the project root."
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ All fixed files found${NC}"
echo ""

# Backup existing files
echo "💾 Creating backups of existing files..."
mkdir -p .backups
cp src/context/AuthContext.tsx .backups/AuthContext.tsx.backup 2>/dev/null
cp src/lib/supabaseClient.tsx .backups/supabaseClient.tsx.backup 2>/dev/null
echo -e "${GREEN}✅ Backups created in .backups/${NC}"
echo ""

# Copy fixed files
echo "📝 Applying fixed files..."
cp AuthContext.tsx src/context/AuthContext.tsx
echo -e "${GREEN}✅ Updated src/context/AuthContext.tsx${NC}"

cp supabaseClient.tsx src/lib/supabaseClient.tsx
echo -e "${GREEN}✅ Updated src/lib/supabaseClient.tsx${NC}"

cp envConfig.ts src/lib/envConfig.ts
echo -e "${GREEN}✅ Added src/lib/envConfig.ts${NC}"

echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file with your Supabase credentials!${NC}"
        echo "   1. Open .env in your text editor"
        echo "   2. Add your VITE_SUPABASE_URL"
        echo "   3. Add your VITE_SUPABASE_ANON_KEY"
        echo ""
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Test build
echo "🔨 Testing build..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "   Please fix build errors before deploying"
    exit 1
fi

echo ""
echo "🎯 Ready to deploy!"
echo ""
echo "Next steps:"
echo "1. Make sure .env is configured with your Supabase credentials"
echo "2. Test locally: npm run dev"
echo "3. Commit changes: git add . && git commit -m 'Fix: Production deployment'"
echo "4. Push to GitHub: git push origin main"
echo "5. Vercel will auto-deploy (1-2 minutes)"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - GITHUB_DEPLOYMENT_GUIDE.md"
echo "   - PRODUCTION_FIX_GUIDE.md"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
