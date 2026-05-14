$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$null = [Console]::In.ReadToEnd()

$reason = "git push 차단됨: 사용자의 명시적 승인이 필요합니다. 사용자에게 '푸시해도 될까요?'라고 먼저 묻고 명확한 허가('push 해줘' 등)를 받은 뒤에만 진행할 수 있습니다."

$payload = @{
  hookSpecificOutput = @{
    hookEventName        = "PreToolUse"
    permissionDecision   = "deny"
    permissionDecisionReason = $reason
  }
} | ConvertTo-Json -Compress -Depth 10
Write-Output $payload
exit 0
