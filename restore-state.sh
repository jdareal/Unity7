#!/bin/bash
# RESTORATION SCRIPT - Run this to restore exact state
# Generated: 2025-06-16T06:44:38.386Z

echo "🔄 RESTORING RECURSIVE LEARNING ENGINE STATE..."

# Navigate to project
cd ~/Desktop/recursive-learning-engine

# Verify files exist
echo "📁 Checking files..."
ls real-engine-implementation.js
ls engine-expansion-pack.js
ls engine-recursive-growth.js

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install express
fi

# Start the engine
echo "🚀 Starting engine..."
node real-engine-implementation.js

# Engine should now be running on http://localhost:3000
# All endpoints active: /archaeology, /quantum, /homework, /learn
