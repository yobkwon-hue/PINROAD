$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$null = [Console]::In.ReadToEnd()

$status = (& git status --short 2>$null | Out-String).Trim()
$diff   = (& git diff 2>$null | Out-String).Trim()

if (-not $status -and -not $diff) { exit 0 }

if (-not $status) { $status = "(변경 없음)" }
if (-not $diff)   { $diff   = "(unstaged 변경 없음)" }

$maxLen = 2500
if ($diff.Length -gt $maxLen) {
    $diff = $diff.Substring(0, $maxLen) + "`n... (잘림 — 전체 보려면 git diff 실행)"
}

$msg = "[git status --short]`n$status`n`n[git diff]`n$diff"
$payload = @{ systemMessage = $msg } | ConvertTo-Json -Compress
Write-Output $payload
exit 0
