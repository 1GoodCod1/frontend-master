Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$SrcRoot = "a:\masters\frontend-master\src"

$Mappings = [ordered]@{
    "components/admin"     = "features/admin/components"
    "components/master"    = "features/masters/components/master"
    "components/masters"   = "features/masters/components"
    "components/client"    = "features/clients/components"
    "components/auth"      = "features/auth/components"
    "components/booking"   = "features/bookings/components"
    "components/chat"      = "features/chat/components"
    "components/leads"     = "features/leads/components"
    "components/payments"  = "features/payments/components"
    "components/portfolio" = "features/portfolio/components"
    "components/reviews"   = "features/reviews/components"
    "components/search"    = "features/masters/components/search"
    "components/security"  = "features/security/components"
}

Write-Host "=== Shag 1: Peremeshenie direktoriy ===" -ForegroundColor Cyan

foreach ($oldRel in $Mappings.Keys) {
    $oldAbs = Join-Path $SrcRoot $oldRel
    $newAbs = Join-Path $SrcRoot $Mappings[$oldRel]

    if (-not (Test-Path $oldAbs)) {
        Write-Host "  [SKIP] $oldRel" -ForegroundColor Yellow
        continue
    }

    $parentDir = Split-Path $newAbs -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    if (Test-Path $newAbs) {
        Write-Host "  [MERGE] $oldRel -> $($Mappings[$oldRel])" -ForegroundColor Yellow
        Get-ChildItem $oldAbs | ForEach-Object {
            Move-Item $_.FullName $newAbs -Force
        }
        Remove-Item $oldAbs -Recurse -Force
    }
    else {
        Write-Host "  [MOVE]  $oldRel -> $($Mappings[$oldRel])" -ForegroundColor Green
        Move-Item $oldAbs $newAbs -Force
    }
}

Write-Host ""
Write-Host "=== Shag 2: Obnovlenie importov ===" -ForegroundColor Cyan

$ImportReplacements = [ordered]@{
    "@/components/admin/"     = "@/features/admin/components/"
    "@/components/master/"    = "@/features/masters/components/master/"
    "@/components/masters/"   = "@/features/masters/components/"
    "@/components/client/"    = "@/features/clients/components/"
    "@/components/auth/"      = "@/features/auth/components/"
    "@/components/booking/"   = "@/features/bookings/components/"
    "@/components/chat/"      = "@/features/chat/components/"
    "@/components/leads/"     = "@/features/leads/components/"
    "@/components/payments/"  = "@/features/payments/components/"
    "@/components/portfolio/" = "@/features/portfolio/components/"
    "@/components/reviews/"   = "@/features/reviews/components/"
    "@/components/search/"    = "@/features/masters/components/search/"
    "@/components/security/"  = "@/features/security/components/"
}

$files = Get-ChildItem -Recurse -Path $SrcRoot -Include "*.ts", "*.tsx"
$updatedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $newContent = $content

    foreach ($oldImport in $ImportReplacements.Keys) {
        $escaped = [regex]::Escape($oldImport)
        if ($newContent -match $escaped) {
            $newContent = $newContent -replace $escaped, $ImportReplacements[$oldImport]
        }
    }

    if ($newContent -ne $content) {
        Set-Content $file.FullName $newContent -Encoding UTF8 -NoNewline
        Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host ""
Write-Host "=== GOTOVO ===" -ForegroundColor Green
Write-Host "Obnovleno failov: $updatedCount"
