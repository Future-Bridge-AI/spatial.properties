# Launch script for Offline GIS Demo (Windows PowerShell)
#
# Usage: .\run.ps1
#
# This script:
# 1. Checks for Node.js and npm
# 2. Installs dependencies if needed
# 3. Starts http-server
# 4. Opens browser to demo

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Offline GIS Demo - Launch Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check for npm
try {
    $null = npm --version
} catch {
    Write-Host "ERROR: npm is not installed" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check for required files
Write-Host ""
Write-Host "Checking required files..." -ForegroundColor Cyan

if (-not (Test-Path "data/assets.geojson")) {
    Write-Host "WARNING: data/assets.geojson not found" -ForegroundColor Yellow
    Write-Host "Run: python scripts/export-geojson.py" -ForegroundColor Yellow
}

if (-not (Test-Path "assets/region.pmtiles")) {
    Write-Host "WARNING: assets/region.pmtiles not found" -ForegroundColor Yellow
    Write-Host "Please obtain a PMTiles file for Western Australia" -ForegroundColor Yellow
    Write-Host "See README.md for instructions" -ForegroundColor Yellow
}

# Start http-server
Write-Host ""
Write-Host "Starting web server on http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Open browser after delay
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

# Start server
npx http-server -p 3000
