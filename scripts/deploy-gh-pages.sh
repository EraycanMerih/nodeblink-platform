#!/usr/bin/env bash
set -euo pipefail

# Deploy a safe, static frontend to the gh-pages branch.
# Copies only intended public files and assets and force-pushes to origin/gh-pages.

ROOT=$(pwd)
TMPDIR=$(mktemp -d)
REMOTE=$(git remote get-url origin || true)

if [ -z "$REMOTE" ]; then
  echo "No git remote named 'origin' found. Add a remote before running this script." >&2
  exit 1
fi

echo "Preparing gh-pages tree in $TMPDIR"

# files and folders to include in the public site (edit as needed)
INCLUDE=(
  index.html
  dashboard.html
  assets
  README.md
)

for path in "${INCLUDE[@]}"; do
  if [ -e "$ROOT/$path" ]; then
    mkdir -p "$TMPDIR/$(dirname "$path")"
    cp -R "$ROOT/$path" "$TMPDIR/$path"
  fi
done

# Copy the canonical public icon to the gh-pages root so /action-icon.svg works.
if [ -f "$ROOT/public/action-icon.svg" ]; then
  cp "$ROOT/public/action-icon.svg" "$TMPDIR/action-icon.svg"
fi

# Ensure GitHub Pages won't try to process with Jekyll
touch "$TMPDIR/.nojekyll"

cd "$TMPDIR"
git init -q
git checkout -b gh-pages
git add .
git commit -m "Deploy static frontend to gh-pages" --quiet || true

echo "Pushing to origin gh-pages (force)"
git remote add origin "$REMOTE"
git push --force origin gh-pages

echo "gh-pages deployed. Cleaning up."
cd "$ROOT"
rm -rf "$TMPDIR"

echo "Done. Frontend pushed to origin/gh-pages"
