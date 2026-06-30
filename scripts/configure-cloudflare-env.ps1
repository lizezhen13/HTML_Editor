$ErrorActionPreference = "Stop"

Write-Host "Configure Cloudflare credentials for PartyKit custom-domain deploy"
Write-Host ""

$accountId = Read-Host "Cloudflare Account ID"
if ([string]::IsNullOrWhiteSpace($accountId)) {
  throw "Cloudflare Account ID cannot be empty."
}

$secureToken = Read-Host "Cloudflare API Token" -AsSecureString
$tokenPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)

try {
  $apiToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPtr)
} finally {
  if ($tokenPtr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPtr)
  }
}

if ([string]::IsNullOrWhiteSpace($apiToken)) {
  throw "Cloudflare API Token cannot be empty."
}

$accountId = $accountId.Trim()
$apiToken = $apiToken.Trim()

[Environment]::SetEnvironmentVariable("CLOUDFLARE_ACCOUNT_ID", $accountId, "User")
[Environment]::SetEnvironmentVariable("CLOUDFLARE_API_TOKEN", $apiToken, "User")

$env:CLOUDFLARE_ACCOUNT_ID = $accountId
$env:CLOUDFLARE_API_TOKEN = $apiToken

Write-Host ""
Write-Host "Saved Cloudflare credentials to Windows user environment variables."
Write-Host "CLOUDFLARE_ACCOUNT_ID=$accountId"
Write-Host "CLOUDFLARE_API_TOKEN=********"
Write-Host ""
Write-Host "You can deploy PartyKit now with:"
Write-Host "npm run deploy"
