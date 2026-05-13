#!/bin/bash
# Claude Code status line: shows local git state + sync vs origin/main.
# Designed to be FAST (no network) - reads local refs only.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$DIR" 2>/dev/null || { echo ""; exit 0; }

last=$(git log -1 --pretty=format:'%h • %ar • %an' 2>/dev/null)
if [ -z "$last" ]; then
  echo "🔒 no commits yet"
  exit 0
fi

ab=$(git rev-list --left-right --count HEAD...origin/main 2>/dev/null)
if [ -z "$ab" ]; then
  echo "🔒 (no upstream) | $last"
  exit 0
fi

ahead=$(echo "$ab" | awk '{print $1+0}')
behind=$(echo "$ab" | awk '{print $2+0}')

state=""
[ "$ahead" -gt 0 ] && state="↑$ahead "
[ "$behind" -gt 0 ] && state="${state}↓$behind "
[ -z "$state" ] && state="✓ "

echo "🔒 ${state}| $last"
