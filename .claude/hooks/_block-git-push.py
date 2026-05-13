#!/usr/bin/env python3
"""PreToolUse(Bash) hook: block real `git push` invocations.

Strategy:
  1. Strip single- and double-quoted strings (with escape handling) so any
     "git push" text inside string literals (commit messages, heredoc body
     captured by command substitution, etc.) is removed before matching.
  2. Look for `git` in shell command position (start of cmd, or after one
     of `\n`, `;`, `&&`, `||`, `|`, `&`, `(`, `)`, `$(`, backtick), optionally
     followed by git-level flags (-c k=v, -C path, --git-dir, etc.), then
     the literal subcommand `push`.

This avoids false positives like `git commit -m 'fix push button'` while
catching `git push`, `git -c x=y push`, `cd /tmp && git push`, etc.
"""
import sys
import json
import re

data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")


def strip_quoted(s: str) -> str:
    # Double-quoted with backslash-escape handling
    s = re.sub(r'"(?:[^"\\]|\\.)*"', '""', s)
    # Single-quoted (POSIX shell single quotes have no escapes inside)
    s = re.sub(r"'[^']*'", "''", s)
    return s


stripped = strip_quoted(cmd)

PATTERN = re.compile(
    r"(?:^|[\n;&|()`]|\$\()\s*git\b"
    r"(?:\s+-[^\s]+(?:\s+\S+)?)*"   # optional git-level flags (and their args)
    r"\s+push\b"
)

if PATTERN.search(stripped):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": (
                "git push is blocked until user explicit approval. "
                "Ask the user before pushing. Attempted command: " + cmd
            ),
        }
    }))
