#!/bin/sh

# Build script for Render.com
# This ensures environment variables are available during build

echo "🚀 Starting build process..."
echo "📦 API URL: ${VITE_API_URL}"

# Install dependencies
npm ci --legacy-peer-deps

# Build the application with environment variables
npm run build

echo "✅ Build completed successfully!"
