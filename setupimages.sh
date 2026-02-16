#!/bin/bash

# Setup Images Folder for Logo
# Run this in your project root

echo "🖼️  Setting up images folder..."
echo ""

# Create images directory
if [ -d "images" ]; then
    echo "⚠️  images/ folder already exists"
else
    mkdir images
    echo "✅ Created images/ folder"
fi

# Check if logo files are present
LOGO_FOUND=0

if [ -f "logo.svg" ]; then
    mv logo.svg images/
    echo "✅ Moved logo.svg to images/"
    LOGO_FOUND=1
fi

if [ -f "favicon.svg" ]; then
    mv favicon.svg images/
    echo "✅ Moved favicon.svg to images/"
    LOGO_FOUND=1
fi

if [ -f "logo.png" ]; then
    mv logo.png images/
    echo "✅ Moved logo.png to images/"
    LOGO_FOUND=1
fi

if [ -f "favicon.png" ]; then
    mv favicon.png images/
    echo "✅ Moved favicon.png to images/"
    LOGO_FOUND=1
fi

if [ $LOGO_FOUND -eq 0 ]; then
    echo ""
    echo "⚠️  No logo files found in current directory"
    echo ""
    echo "To add your logo:"
    echo "1. Put your logo file in the images/ folder"
    echo "2. Name it: logo.svg or logo.png"
    echo "3. Add favicon: favicon.svg or favicon.png"
    echo ""
    echo "Or use the provided logo.svg and favicon.svg files!"
fi

echo ""
echo "📁 Folder structure:"
tree images/ 2>/dev/null || ls -la images/

echo ""
echo "✅ Images folder setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your logo to images/ folder"
echo "2. Update index.html to use: <img src='images/logo.svg'>"
echo "3. Test in browser"
echo ""