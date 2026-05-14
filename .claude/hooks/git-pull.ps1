$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$null = [Console]::In.ReadToEnd()

$pullOutput = (& git pull 2>&1 | Out-String).Trim()
if (-not $pullOutput) { $pullOutput = "(no output)" }

$payload = @{ systemMessage = "[SessionStart git pull]`n$pullOutput" } | ConvertTo-Json -Compress
Write-Output $payload
exit 0
