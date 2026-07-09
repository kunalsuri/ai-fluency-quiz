# scripts/start.ps1
# Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
# AI Fluency - Launcher: checks dependencies, installs, starts the Astro dev server.

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "AI Fluency Launcher"

Clear-Host
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "             AI FLUENCY LAUNCHER              " -ForegroundColor Magenta -BackgroundColor Black
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we are in the project root directory relative to this script
Set-Location (Join-Path $PSScriptRoot "..")

# 1. Node.js check
$NodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $NodeCmd) {
    Write-Host "[!!] Node.js is NOT installed. Install it from https://nodejs.org (v20+)." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js $((node -v).Trim())" -ForegroundColor Green

$NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $NpmCmd) {
    Write-Host "[!!] npm is NOT available on PATH." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] npm $((npm -v).Trim())" -ForegroundColor Green
Write-Host ""

# 2. Install dependencies on first run
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (first run)..." -ForegroundColor Gray
    npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!!] npm install failed." -ForegroundColor Red
        exit 1
    }
}

# 3. Validate the question database
Write-Host "Validating question database..." -ForegroundColor Gray
node scripts\validate-data.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!!] Data validation failed - fix data/ before launching." -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Launch
Write-Host "Starting Astro dev server at http://localhost:4321/ ..." -ForegroundColor Cyan
Write-Host "(Audit workbench: run 'npm run audit' in another terminal - local only.)" -ForegroundColor Gray
Start-Process "http://localhost:4321/"
npm run dev
