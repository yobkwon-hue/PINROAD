#!/bin/bash
# Stop hook: show git diff --stat and git status -s after each turn
# Cross-platform: macOS, Linux, Git Bash on Windows (needs python or python3 on PATH)
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$DIR" || exit 0

PY=$(command -v python3 || command -v python)
[ -z "$PY" ] && exit 0

diff_out=$(git diff --stat 2>&1)
status_out=$(git status -s 2>&1)
[ -z "$diff_out" ] && [ -z "$status_out" ] && exit 0
msg="[git diff --stat]
${diff_out:-(no diff)}

[git status -s]
${status_out:-(clean)}"
"$PY" -c '
import sys, json
print(json.dumps({"systemMessage": sys.argv[1]}))
' "$msg"
