#!/bin/bash
# Launch script for Offline GIS Demo (Unix/macOS/Linux)
#
# Usage: ./run.sh
#
# This script:
# 1. Checks for Node.js and npm
# 2. Installs dependencies if needed
# 3. Starts http-server
# 4. Opens browser to demo

set -e

echo "======================================"
echo "Offline GIS Demo - Launch Script"
echo "======================================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
fi

# Check for required files
echo ""
echo "Checking required files..."

if [ ! -f "data/assets.geojson" ]; then
    echo "WARNING: data/assets.geojson not found"
    echo "Run: python scripts/export-geojson.py"
fi

if [ ! -f "assets/region.pmtiles" ]; then
    echo "WARNING: assets/region.pmtiles not found"
    echo "Please obtain a PMTiles file for Western Australia"
    echo "See README.md for instructions"
fi

# Start http-server
echo ""
echo "Starting web server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

# Open browser (platform-specific)
if command -v xdg-open &> /dev/null; then
    # Linux
    sleep 2 && xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    # macOS
    sleep 2 && open http://localhost:3000 &
fi

# Start server
npx http-server -p 3000
