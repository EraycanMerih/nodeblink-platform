# Generates base64 for GitHub secret DO_ENV_FILE (run locally, never commit output)
$path = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $path)) {
  Write-Error "Create .env from .env.example first."
  exit 1
}
$bytes = [IO.File]::ReadAllBytes((Resolve-Path $path))
$b64 = [Convert]::ToBase64String($bytes)
$b64 | Set-Clipboard
Write-Host "Copied DO_ENV_FILE base64 to clipboard (${($bytes.Length)} bytes source)."
Write-Host "Add as GitHub secret: Settings -> Secrets -> DO_ENV_FILE"
