#!/bin/bash

# COMPLETE GITHUB PAGES REMOVAL SCRIPT
# This permanently removes GitHub Pages from your repo

echo "🗑️  Complete GitHub Pages Removal"
echo "=================================="
echo ""

REPO_OWNER="skchinna7"
REPO_NAME="ai-word-of-the-day-website"

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""
read -p "This will PERMANENTLY remove GitHub Pages. Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "Step 1: Disabling GitHub Pages..."

# Disable GitHub Pages via API
gh api \
  --method DELETE \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$REPO_OWNER/$REPO_NAME/pages

echo "✅ GitHub Pages disabled"
echo ""

echo "Step 2: Deleting all deployments..."

# Get all deployment IDs
gh api \
  -H "Accept: application/vnd.github+json" \
  /repos/$REPO_OWNER/$REPO_NAME/deployments \
  --paginate | jq -r '.[].id' | while read deployment_id; do
    
    echo "  Deleting deployment: $deployment_id"
    
    # Set to inactive first
    gh api \
      --method POST \
      -H "Accept: application/vnd.github+json" \
      /repos/$REPO_OWNER/$REPO_NAME/deployments/$deployment_id/statuses \
      -f state='inactive' > /dev/null 2>&1
    
    # Delete deployment
    gh api \
      --method DELETE \
      -H "Accept: application/vnd.github+json" \
      /repos/$REPO_OWNER/$REPO_NAME/deployments/$deployment_id > /dev/null 2>&1
done

echo "✅ All deployments deleted"
echo ""

echo "Step 3: Deleting environments..."

# Delete all environments
for env in github-pages production staging; do
    gh api \
      --method DELETE \
      -H "Accept: application/vnd.github+json" \
      /repos/$REPO_OWNER/$REPO_NAME/environments/$env 2>/dev/null && \
      echo "  ✅ Deleted $env environment" || \
      echo "  ⚠️  $env environment not found"
done

echo ""
echo "Step 4: Removing gh-pages branch (if exists)..."

git push origin --delete gh-pages 2>/dev/null && \
  echo "✅ gh-pages branch deleted" || \
  echo "⚠️  gh-pages branch not found"

echo ""
echo "✅ GITHUB PAGES COMPLETELY REMOVED!"
echo ""
echo "Verify removal:"
echo "1. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/settings/pages"
echo "2. Should say: 'GitHub Pages is currently disabled'"
echo "3. Go to: https://github.com/$REPO_OWNER/$REPO_NAME/deployments"
echo "4. Should be empty"
echo ""
echo "✨ Your repo is now clean and ready for Vercel/Netlify!"