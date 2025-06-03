#!/bin/bash

# GitHub Action Build Script
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Please fix the issues before building."
    exit 1
fi

echo "📦 Building action..."
NODE_OPTIONS="--openssl-legacy-provider" npm run package

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built file: dist/index.js"
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes including the dist/ folder"
    echo "2. Create a git tag: git tag v1.0.1"
    echo "3. Push changes: git push origin v1.0.1"
else
    echo "❌ Build failed!"
    exit 1
fi
