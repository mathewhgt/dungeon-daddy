# -----------------------------------------------------------------------------
# Dungeon Daddy — Automated Release & Git Push Script
# 
# Usage:
#   npm run ship
#   npm run ship -- -Message "Added token animations and fixed dice tray"
#   powershell -ExecutionPolicy Bypass -File scripts/publish-release.ps1 -Message "My update"
# -----------------------------------------------------------------------------

param (
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Text)
    Write-Host "`n>>> $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Text)
    Write-Host "[ERROR] $Text" -ForegroundColor Red
}

try {
    Write-Host "==========================================================" -ForegroundColor Magenta
    Write-Host "  Dungeon Daddy - Automated Version Bump and Release" -ForegroundColor Magenta
    Write-Host "==========================================================" -ForegroundColor Magenta

    # 1. Read and parse package.json version
    Write-Step "Step 1: Reading and incrementing version in package.json..."
    $rootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    $pkgPath = Join-Path $rootDir "package.json"
    if (-not (Test-Path $pkgPath)) {
        throw "package.json not found at $pkgPath"
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $pkgRaw = [System.IO.File]::ReadAllText($pkgPath, [System.Text.Encoding]::UTF8)
    $pkgJson = $pkgRaw | ConvertFrom-Json
    $oldVersion = $pkgJson.version

    if (-not $oldVersion) {
        $oldVersion = "1.0.0"
    }

    # Split version e.g. "1.0.3" -> Major: 1, Minor: 0, Patch: 3
    $vParts = $oldVersion.Split('.')
    $major = [int]$vParts[0]
    $minor = [int]$vParts[1]
    $patch = [int]$vParts[2]
    $newPatch = $patch + 1
    $newVersion = "$major.$minor.$newPatch"

    # Replace version string reliably without adding BOM
    $updatedPkgRaw = [regex]::Replace($pkgRaw, '"version":\s*"[^"]+"', ('"version": "' + $newVersion + '"'))
    [System.IO.File]::WriteAllText($pkgPath, $updatedPkgRaw, $utf8NoBom)

    # Also update package-lock.json if present
    $lockPath = Join-Path $rootDir "package-lock.json"
    if (Test-Path $lockPath) {
        $lockRaw = [System.IO.File]::ReadAllText($lockPath, [System.Text.Encoding]::UTF8)
        $updatedLockRaw = [regex]::Replace($lockRaw, '("name":\s*"dungeon-daddy",\s*"version":\s*")[^"]+(")', ('$1' + $newVersion + '$2'))
        $updatedLockRaw = [regex]::Replace($updatedLockRaw, '("":\s*\{[^}]*?"name":\s*"dungeon-daddy",\s*"version":\s*")[^"]+(")', ('$1' + $newVersion + '$2'))
        [System.IO.File]::WriteAllText($lockPath, $updatedLockRaw, $utf8NoBom)
    }

    Write-Success "Version incremented: v$oldVersion -> v$newVersion"

    # 2. Compile and package the application
    Write-Step "Step 2: Building frontend assets and packaging Windows binaries..."
    Set-Location $rootDir

    # Run build and packaging
    npm run package
    if ($LASTEXITCODE -ne 0) {
        throw "Packaging failed with exit code $LASTEXITCODE"
    }
    Write-Success "Binaries built successfully in release/ folder."

    # 3. Stage all modified files
    Write-Step "Step 3: Staging modified and generated files..."
    git add .
    if ($LASTEXITCODE -ne 0) {
        throw "git add failed with exit code $LASTEXITCODE"
    }
    Write-Success "All files staged for git."

    # 4. Commit changes
    Write-Step "Step 4: Committing release changes..."
    $commitMsg = if ($Message -and $Message.Trim() -ne "") {
        "Release v" + $newVersion + ": " + $Message
    } else {
        "Release v" + $newVersion + ": Automatic build, package and version bump"
    }

    git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: No additional changes to commit or commit returned $LASTEXITCODE" -ForegroundColor Yellow
    } else {
        Write-Success "Committed: $commitMsg"
    }

    # 5. Tag the new release
    Write-Step "Step 5: Tagging version v$newVersion..."
    $tagName = "v" + $newVersion
    git tag -a $tagName -m "Dungeon Daddy $tagName"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tag $tagName may already exist locally, updating tag..." -ForegroundColor Yellow
        git tag -f -a $tagName -m "Dungeon Daddy $tagName"
    }
    Write-Success "Created Git tag: $tagName"

    # 6. Push commit and tag to remote
    Write-Step "Step 6: Pushing commits and release tag to GitHub..."
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        throw "git push origin main failed with exit code $LASTEXITCODE"
    }

    git push origin $tagName
    if ($LASTEXITCODE -ne 0) {
        throw "git push origin $tagName failed with exit code $LASTEXITCODE"
    }
    Write-Success "Pushed commits and tag $tagName to GitHub remote!"

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  Release v$newVersion Published Successfully!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "• Package files: release/Dungeon Daddy Setup $newVersion.exe" -ForegroundColor White
    Write-Host "• Git Tag: $tagName" -ForegroundColor White
    Write-Host "• All devices can now click 'Check for Updates' to install v$newVersion!" -ForegroundColor Cyan
}
catch {
    $err = $_.ToString()
    Write-Fail "Release process failed: $err"
    exit 1
}
