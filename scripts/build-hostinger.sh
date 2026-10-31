#!/usr/bin/env bash
# Builds an upload-ready bundle for Hostinger Web Hosting:
#   build/hostinger/public_html/     -> upload into  domains/psikologia.id/public_html/
#   build/hostinger/psikologia-app/  -> upload into  domains/psikologia.id/psikologia-app/   (OUTSIDE public_html)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/build/hostinger"
rm -rf "$OUT" && mkdir -p "$OUT/public_html/api" "$OUT/psikologia-app"

echo "› Building frontend"
(cd "$ROOT/frontend" && npm ci --no-audit --no-fund && npm run build)
cp -R "$ROOT/frontend/dist/." "$OUT/public_html/"
cp "$ROOT/deploy/hostinger/public_html.htaccess" "$OUT/public_html/.htaccess"

echo "› Preparing API front controller"
cp "$ROOT/backend/public/index.php" "$OUT/public_html/api/index.php"
cp "$ROOT/backend/public/.htaccess" "$OUT/public_html/api/.htaccess"

echo "› Preparing backend (no dev dependencies)"
APP="$OUT/psikologia-app"
cp -R "$ROOT/backend/src" "$ROOT/backend/bin" "$ROOT/backend/database" "$APP/"
cp "$ROOT/backend/composer.json" "$ROOT/backend/composer.lock" "$ROOT/backend/.env.example" "$APP/"
mkdir -p "$APP/storage/logs" "$APP/storage/sessions" "$APP/storage/cv"
printf 'Require all denied\n' > "$APP/.htaccess"   # defence in depth if ever placed under a web root
(cd "$APP" && COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction --quiet)

echo "✓ Done: $OUT"
echo "  Next: create psikologia-app/.env from .env.example on the server, then run: php psikologia-app/bin/migrate.php"
