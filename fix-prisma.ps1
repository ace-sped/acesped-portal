# Fix Prisma EPERM Error Script
# This script stops Node processes and regenerates Prisma client

Write-Host "Stopping Node.js processes that might be locking Prisma files..." -ForegroundColor Yellow

# Kill Node processes (be careful - this will stop your dev server)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "Node.js processes stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

Write-Host "`nRegenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`nPrisma Client regenerated successfully!" -ForegroundColor Green
Write-Host "You can now run your dev server again with: npm run dev" -ForegroundColor Cyan
