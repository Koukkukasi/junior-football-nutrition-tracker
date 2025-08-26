#!/usr/bin/env bash
# Build script for Render deployment

set -e  # Exit on error

echo "Starting build process..."
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Build the client
echo "Building client..."
if [ -d "client" ]; then
    cd client
    npm install
    npm run build
    cd ..
    echo "Client build complete"
else
    echo "ERROR: client directory not found!"
    exit 1
fi

echo "Build process complete!"