# scripts/run-tests.ps1
# Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0.
# Run all data validations and Vitest test suite.

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "AI Fluency Quiz - Test Runner"

Clear-Host
Write-Host "🧪 Starting AI Fluency Quiz Test Runner..." -ForegroundColor Cyan
Write-Host ""

Set-Location (Join-Path $PSScriptRoot "..")

# 1. Run data validation
Write-Host "📋 Running data validation..." -ForegroundColor Gray
node scripts\validate-data.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!!] Data validation failed." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Data validation passed." -ForegroundColor Green
Write-Host ""

# 2. Run unit & integration tests
Write-Host "🏃 Running Vitest test suite..." -ForegroundColor Gray
node node_modules\vitest\vitest.mjs run
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!!] Vitest tests failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All tests passed successfully!" -ForegroundColor Green
