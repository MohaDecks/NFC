#!/usr/bin/env bash
# Server: pull + env + install + build + pm2
#   cd /var/www/html/NFC && bash scripts/server-update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${DOMAIN:-mubarektech.deknest.com}"
PUBLIC_URL="${PUBLIC_URL:-https://${DOMAIN}}"
PORT="${PORT:-4001}"
DB_NAME="${DB_NAME:-bravio}"

cd "$ROOT"

echo "========================================"
echo " Mubarek Technology server update"
echo " Root:   $ROOT"
echo " Domain: $PUBLIC_URL"
echo "========================================"

ENV_BAK=""
if [ -f "$ROOT/.env" ]; then
  ENV_BAK="$(mktemp)"
  cp "$ROOT/.env" "$ENV_BAK"
  echo "==> 1/6 backed up .env"
else
  echo "==> 1/6 no .env yet"
fi

echo "==> 2/6 git fetch + reset to origin/main"
git fetch origin
git reset --hard origin/main
git clean -fd \
  -e .env \
  -e backend/.env \
  -e .env.production \
  -e frontend/dist \
  -e backend/uploads \
  -e uploads \
  -e logs

if [ -n "$ENV_BAK" ] && [ -f "$ENV_BAK" ]; then
  if [ ! -f "$ROOT/.env" ]; then
    cp "$ENV_BAK" "$ROOT/.env"
  fi
  rm -f "$ENV_BAK"
fi

echo "==> 3/6 update env files"
cat >"$ROOT/.env.production" <<EOF
PUBLIC_URL=$PUBLIC_URL
PORT=$PORT
EOF

if [ ! -f "$ROOT/.env" ]; then
  JWT_SECRET="$(openssl rand -hex 32 2>/dev/null || echo mubarek-change-this-jwt-secret-32)"
  cat >"$ROOT/.env" <<EOF
PORT=$PORT
NODE_ENV=production
MONGO_URI=mongodb://127.0.0.1:27017/$DB_NAME
JWT_SECRET=$JWT_SECRET
APP_URL=$PUBLIC_URL
COOKIE_NAME=bravio_admin
ADMIN_NAME=Mubarek Admin
ADMIN_EMAIL=admin@${DOMAIN}
ADMIN_PASSWORD=admin12345
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF
  echo "    created .env — beddel JWT_SECRET / Cloudinary keys / ADMIN_PASSWORD"
else
  set_kv() {
    local key="$1" val="$2" file="$ROOT/.env"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    else
      echo "${key}=${val}" >>"$file"
    fi
  }
  set_kv PORT "$PORT"
  set_kv NODE_ENV production
  set_kv APP_URL "$PUBLIC_URL"
  echo "    patched .env"
fi

echo "==> 4/6 npm install"
npm run install:server

echo "==> 5/6 build frontend"
npm --prefix frontend run build

echo "==> 6/6 PM2 restart"
export PORT PUBLIC_URL
bash "$ROOT/scripts/pm2.sh" reload

echo ""
echo "========================================"
echo " DONE"
echo "  Site:  $PUBLIC_URL/"
echo "  API:   $PUBLIC_URL/api/health"
echo "========================================"
