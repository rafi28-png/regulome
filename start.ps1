# ReguloMe — Single startup script
# Run this once to start both the backend and frontend simultaneously.
#
# Usage:  .\start.ps1
# Stop:   Press Ctrl+C in both terminal windows, or close them.

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║        ReguloMe — Starting Up            ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

# ── Backend ────────────────────────────────────────────────────────────────
Write-Host "  [1/2] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$root\backend'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# ── Frontend ───────────────────────────────────────────────────────────────
Write-Host "  [2/2] Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd '$root'; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "  ✅ Both servers are starting in separate windows." -ForegroundColor Green
Write-Host ""
Write-Host "     Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "     Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "     API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Tip: Switch to 'Real Mode' in the app to use live genomics APIs." -ForegroundColor Gray
Write-Host ""
