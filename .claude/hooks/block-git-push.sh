#!/bin/bash
# PreToolUse(Bash) hook: thin wrapper that runs _block-git-push.py.
# Cross-platform: macOS, Linux, Git Bash on Windows (needs python or python3 on PATH)
PY=$(command -v python3 || command -v python)
[ -z "$PY" ] && exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec "$PY" "$DIR/_block-git-push.py"
