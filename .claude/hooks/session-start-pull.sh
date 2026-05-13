#!/bin/bash
# SessionStart hook: auto git pull in project root
# Cross-platform: macOS, Linux, Git Bash on Windows (needs python or python3 on PATH)
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$DIR" || exit 0

PY=$(command -v python3 || command -v python)
[ -z "$PY" ] && exit 0

output=$(git pull 2>&1)
"$PY" -c '
import sys, json
print(json.dumps({"systemMessage": "[git pull]\n" + sys.argv[1]}))
' "$output"
