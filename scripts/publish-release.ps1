# -----------------------------------------------------------------------------
# Dungeon Daddy — Automated Release, Version Increment & Git Push Script
# 
# Usage:
#   npm run ship
#   npm run ship -- -Message "Updated combat tracker and token spells"
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

    # 1. Determine highest current version from git tags and package.json
    Write-Step "Step 1: Finding latest version and incrementing patch by +0.0.1..."
    $rootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    $pkgPath = Join-Path $rootDir "package.json"
    if (-not (Test-Path $pkgPath)) {
        throw "package.json not found at $pkgPath"
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $pkgRaw = [System.IO.File]::ReadAllText($pkgPath, [System.Text.Encoding]::UTF8)
    $pkgJson = $pkgRaw | ConvertFrom-Json

    $major = 1
    $minor = 0
    $highestPatch = -1

    # Check package.json version
    if ($pkgJson.version -and $pkgJson.version -match '^(\d+)\.(\d+)\.(\d+)$') {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        $highestPatch = [int]$matches[3]
    }

    # Check all existing git tags
    try {
        $existingTags = git tag -l "v*"
        foreach ($t in $existingTags) {
            if ($t -match '^v?(\d+)\.(\d+)\.(\d+)$') {
                $tMajor = [int]$matches[1]
                $tMinor = [int]$matches[2]
                $tPatch = [int]$matches[3]
                if ($tMajor -ge $major -and $tMinor -ge $minor -and $tPatch -gt $highestPatch) {
                    $major = $tMajor
                    $minor = $tMinor
                    $highestPatch = $tPatch
                }
            }
        }
    } catch {}

    if ($highestPatch -lt 0) {
        $highestPatch = 0
    }

    $oldVersion = "$major.$minor.$highestPatch"
    $newPatch = $highestPatch + 1
    $newVersion = "$major.$minor.$newPatch"

    # Replace version string in package.json without BOM
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
        Write-Host "Notice: Working tree clean or already committed." -ForegroundColor Yellow
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

    git push origin "refs/tags/$tagName:refs/tags/$tagName" --force
    if ($LASTEXITCODE -ne 0) {
        throw "git push origin $tagName failed with exit code $LASTEXITCODE"
    }
    Write-Success "Pushed commits and tag $tagName to GitHub remote!"

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host "  Release v$newVersion Published Successfully!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "• Package files: release/Dungeon Daddy Setup $newVersion.exe" -ForegroundColor White
    Write-Host "• Git Tag: $tagName" -ForegroundColor White
    Write-Host "• GitHub Action: Building cloud release at https://github.com/mathewhgt/dungeon-daddy/actions" -ForegroundColor Cyan
    Write-Host "• All devices can now click 'Check for Updates' to install v$newVersion!" -ForegroundColor Green
}
catch {
    $err = $_.ToString()
    Write-Fail "Release process failed: $err"
    exit 1
}
