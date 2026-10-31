#!/usr/bin/env bash
# Assembles the standalone "Psikologia Career" repository (frontend + backend + docs)
# with Vercel config at its root. Usage: scripts/export-career-repo.sh <target-dir>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?target directory required}"
mkdir -p "$DEST"
rsync -a --delete \
  --exclude '.git' --exclude 'node_modules' --exclude 'vendor' --exclude 'dist' \
  --exclude '.env' --exclude '.phpunit.cache' --exclude 'e2e/screenshots' \
  --exclude 'storage/logs/*.log' --exclude 'storage/cv/*' --exclude 'storage/sessions/*' \
  "$ROOT/frontend" "$ROOT/backend" "$ROOT/docs" "$ROOT/deploy" "$ROOT/scripts" "$DEST/"
sed '/<!-- legacy-start -->/,/<!-- legacy-end -->/d' "$ROOT/README.md" > "$DEST/README.md"
rm -f "$DEST/docs/legacy-tes-kepribadian.md"
cp "$ROOT/deploy/vercel/vercel.json" "$ROOT/deploy/vercel/composer.json" "$ROOT/deploy/vercel/composer.lock" "$ROOT/deploy/vercel/.vercelignore" "$DEST/"
mkdir -p "$DEST/api" && cp "$ROOT/deploy/vercel/api/index.php" "$DEST/api/index.php"
cat > "$DEST/.gitignore" <<'IGN'
node_modules/
vendor/
dist/
build/
.env
.env.*
!.env.example
.phpunit.cache/
.vercel/
frontend/e2e/screenshots/
IGN
echo "✓ Exported to $DEST"
