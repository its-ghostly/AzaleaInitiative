#!/usr/bin/env bash
# Absolute guard: form-corp/ must never be tracked or staged for GitHub.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "ERROR: form-corp GitHub ban violated — $*" >&2
  exit 1
}

# 1) .gitignore must ignore the whole tree
if ! grep -qE '^[[:space:]]*form-corp/[[:space:]]*$' .gitignore; then
  fail ".gitignore must contain a line: form-corp/"
fi

# 2) No tracked files under form-corp
tracked="$(git ls-files 'form-corp' 'form-corp/**' 2>/dev/null || true)"
if [[ -n "${tracked}" ]]; then
  fail "tracked files still present under form-corp/:
${tracked}"
fi

# 3) Nothing staged under form-corp except deletions (removal from GitHub is required)
staged_keep="$(git diff --cached --name-only --diff-filter=ACMR -- 'form-corp' 'form-corp/**' 2>/dev/null || true)"
if [[ -n "${staged_keep}" ]]; then
  fail "staged form-corp paths that would upload content (unstage them):
${staged_keep}"
fi

# 4) Working tree ignore check for a representative path
if git check-ignore -q form-corp/README.md 2>/dev/null || [[ ! -e form-corp/README.md ]]; then
  :
elif git check-ignore -q form-corp/ 2>/dev/null; then
  :
else
  # If the folder exists but is not ignored, fail
  if [[ -d form-corp ]]; then
    sample="$(find form-corp -type f 2>/dev/null | head -1 || true)"
    if [[ -n "${sample}" ]] && ! git check-ignore -q "${sample}"; then
      fail "${sample} is not ignored by git"
    fi
  fi
fi

echo "OK: form-corp/ is blocked from GitHub (gitignore + not tracked/staged)."
