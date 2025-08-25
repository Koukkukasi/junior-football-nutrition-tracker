#!/usr/bin/env bash
# Build script for Render deployment

echo "Building Junior Football Nutrition Tracker Client..."

# Install dependencies
npm install

# Create .env file from Render environment variables
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" > .env
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> .env
echo "VITE_API_URL=$VITE_API_URL" >> .env

# Build the application
npm run build

echo "Build completed successfully!"