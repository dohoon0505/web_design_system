#!/usr/bin/env bash
# Stop hook: auto-commit all changes and push.
# - Commit only when there is something to commit.
# - Push pending local commits if local is ahead of upstream.
# - On push failure, leave the commit and warn (do not block).
# - Outputs a single-line JSON {"systemMessage": "..."} for the UI.

set -u

emit() {
  # Emit a JSON object with a systemMessage field, escaping double quotes.
  local msg
  msg=$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"systemMessage":"%s"}\n' "$msg"
}

# Bail out silently if we are not inside a git repo.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Detect working-tree changes (modified, staged, untracked excluding gitignored).
CHANGES=$(git status --porcelain 2>/dev/null)

# Detect unpushed local commits (only if an upstream is configured).
AHEAD=0
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  AHEAD=$(git rev-list --count '@{u}..HEAD' 2>/dev/null || printf 0)
fi

# Nothing to do.
if [ -z "$CHANGES" ] && [ "$AHEAD" = "0" ]; then
  exit 0
fi

COMMITTED=0
COMMIT_MSG="auto: session $(date +%Y-%m-%d_%H%M%S)"

# Stage and commit working-tree changes.
if [ -n "$CHANGES" ]; then
  if ! git add -A >/dev/null 2>&1; then
    emit "Auto-commit failed: git add error"
    exit 0
  fi
  if git commit -m "$COMMIT_MSG" --quiet >/dev/null 2>&1; then
    COMMITTED=1
  else
    emit "Auto-commit failed (pre-commit hook or empty index)"
    exit 0
  fi
fi

# Push (covers freshly committed work and any prior unpushed commits).
PUSH_OUT=$(git push --quiet 2>&1)
if [ "$?" = "0" ]; then
  if [ "$COMMITTED" = "1" ]; then
    emit "Auto-committed and pushed: $COMMIT_MSG"
  else
    emit "Pushed pending commits"
  fi
else
  # Push failed — keep the commit, surface a short reason.
  REASON=$(printf '%s' "$PUSH_OUT" | tr '\n' ' ' | cut -c1-160)
  if [ "$COMMITTED" = "1" ]; then
    emit "Committed locally; push failed: $REASON"
  else
    emit "Push failed for pending commits: $REASON"
  fi
fi

exit 0
