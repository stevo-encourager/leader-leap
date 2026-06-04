#!/bin/bash
# Setup script for AI insights testing

echo "🧪 Setting up Leader Leap AI Insights Testing Suite"

# Create test results directory
mkdir -p test-results

# Install dependencies if needed
echo "Installing dependencies..."
npm install --save-dev dotenv @types/node

# Compile TypeScript test script
echo "Compiling test script..."
npx tsc test-insights.ts --outDir test-results --target es2020 --module commonjs --moduleResolution node

echo "✅ Setup complete!"
echo ""
echo "Usage:"
echo "  Quick test:    node scripts/test-results/test-insights.js --quick"
echo "  Full test:     node scripts/test-results/test-insights.js"
echo "  View results:  open scripts/compare-insights.html"
echo ""
echo "Don't forget to:"
echo "  1. Add your OPENAI_API_KEY to .env.local"
echo "  2. Update TEST_CASES with real assessment data from your database"
echo "  3. Consider adding Claude API testing if you have access"