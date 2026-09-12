#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${DOMAIN:-mubarektech.deknest.com}"

cd "$ROOT"

if [ -f "$ROOT/.env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.production"
  set +a
fi

PUBLIC_URL="${PUBLIC_URL:-https://${DOMAIN}}"
PORT="${PORT:-4001}"

echo "==> Deploy Mubarek Technology"
echo "    Domain: $PUBLIC_URL"
echo "    App:    127.0.0.1:$PORT"

if [ ! -f "$ROOT/.env" ] && [ ! -f "$ROOT/backend/.env" ]; then
  echo "ERROR: .env ma jiro."
  echo "  cp .env.example .env"
  echo "  nano .env   # MONGO_URI, JWT_SECRET, APP_URL=$PUBLIC_URL, PORT=$PORT"
  exit 1
fi

echo "==> 1/3 Frontend build..."
npm --prefix frontend run build

echo "==> 2/3 Backend deps..."
npm --prefix backend install

echo "==> 3/3 PM2 reload..."
export PORT PUBLIC_URL
bash scripts/pm2.sh reload

echo ""
echo "Deploy dhammaaday!"
echo "  Site:  $PUBLIC_URL/"
echo "  API:   $PUBLIC_URL/api/health"
echo ""
echo "Haddii HTTPS uusan furmin: sudo bash scripts/setup-domain.sh"
echo "Site: https://$DOMAIN"
