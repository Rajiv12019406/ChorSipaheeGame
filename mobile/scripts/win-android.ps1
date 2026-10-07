# Windows helper: avoid MAX_PATH (260) failures during native codegen builds.
# Usage (from anywhere):
#   powershell -ExecutionPolicy Bypass -File scripts/win-android.ps1

$ErrorActionPreference = "Stop"

$MobileRoot = Split-Path -Parent $PSScriptRoot
$RepoRoot = Split-Path -Parent $MobileRoot

# Map repo to a short drive letter so CMake/ninja paths stay under 260 chars.
$Drive = "R:"
if (-not (Get-PSDrive -Name $Drive.TrimEnd(':') -ErrorAction SilentlyContinue)) {
    subst $Drive $RepoRoot
    Write-Host "Mapped $Drive -> $RepoRoot"
} else {
    Write-Host "Drive $Drive already in use. If build still fails, run: subst $Drive /d"
}

$ShortMobile = Join-Path $Drive "mobile"
Set-Location $ShortMobile

Write-Host "Building from $ShortMobile"
Write-Host "Tip: also enable Windows long paths (see mobile/README.md)"

npm run android
