#!/bin/bash

# Script to run all code quality checks locally
# This helps ensure that your contributions will pass the CI pipeline.

set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting code quality checks..."

# 1. Linting
echo "🔍 Running ESLint..."
npm run lint:check

# 2. Type Checking
echo "🧐 Running TypeScript type check..."
npx tsc --noEmit

# 3. Formatting
echo "💅 Running Prettier check..."
npx prettier --check .

# 4. Unit Tests
echo "🧪 Running unit tests..."
npm run test

# 5. Documentation Spelling
echo "📚 Checking documentation spelling..."
npx cspell "**/*.md" --config ./cspell.json --no-progress --show-context

echo "✅ All code quality checks passed!"
