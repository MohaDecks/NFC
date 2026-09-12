#!/usr/bin/env bash
# Domain + nginx + HTTPS: mubarektech.deknest.com → app :4001
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${DOMAIN:-mubarektech.deknest.com}"
PORT="${PORT:-4001}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@deknest.com}"
HTTP_SRC="$ROOT/deploy/nginx/mubarektech.deknest.com.http.conf"
HTTPS_SRC="$ROOT/deploy/nginx/mubarektech.deknest.com.conf"
CONF_DST="/etc/nginx/sites-available/$DOMAIN"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ "$(id -u)" -ne 0 ]; then
  echo "Ku orod: sudo bash scripts/setup-domain.sh"
  exit 1
fi

echo "==> HTTPS setup: https://$DOMAIN"
echo "    app 127.0.0.1:$PORT"

apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx

if [ ! -f "$HTTP_SRC" ] || [ ! -f "$HTTPS_SRC" ]; then
  echo "ERROR: nginx conf files ma jiraan $ROOT/deploy/nginx/"
  exit 1
fi

install_conf() {
  local src="$1"
  cp "$src" "$CONF_DST"
  ln -sfn "$CONF_DST" "/etc/nginx/sites-enabled/$DOMAIN"
  nginx -t
  systemctl enable nginx
  systemctl reload nginx
}

if [ ! -f "$CERT_PATH" ]; then
  echo "==> 1/3 HTTP nginx (certificate ka hor)"
  install_conf "$HTTP_SRC"

  echo "==> 2/3 Let's Encrypt certificate..."
  certbot certonly --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$CERTBOT_EMAIL" \
    --keep-until-expiring
else
  echo "==> Certificate hore ayuu u jiraa: $CERT_PATH"
fi

if [ ! -f "$CERT_PATH" ]; then
  echo "ERROR: SSL certificate lama helin."
  echo "Hubi DNS A record: $DOMAIN → server IP"
  exit 1
fi

echo "==> 3/3 HTTPS nginx + HTTP → HTTPS redirect"
install_conf "$HTTPS_SRC"

systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

if [ ! -f "$ROOT/.env.production" ]; then
  cat >"$ROOT/.env.production" <<EOF
PUBLIC_URL=https://$DOMAIN
PORT=$PORT
EOF
  echo "    Created .env.production"
else
  if grep -q "^PUBLIC_URL=" "$ROOT/.env.production" 2>/dev/null; then
    sed -i "s|^PUBLIC_URL=.*|PUBLIC_URL=https://$DOMAIN|" "$ROOT/.env.production"
  else
    echo "PUBLIC_URL=https://$DOMAIN" >>"$ROOT/.env.production"
  fi
fi

ENV_FILE=""
if [ -f "$ROOT/.env" ]; then
  ENV_FILE="$ROOT/.env"
elif [ -f "$ROOT/backend/.env" ]; then
  ENV_FILE="$ROOT/backend/.env"
fi

if [ -n "$ENV_FILE" ]; then
  set_kv() {
    local key="$1" val="$2" file="$ENV_FILE"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    else
      echo "${key}=${val}" >>"$file"
    fi
  }
  set_kv PORT "$PORT"
  set_kv NODE_ENV production
  set_kv APP_URL "https://$DOMAIN"
else
  echo "WARNING: .env ma jiro — samee: cp .env.example .env"
fi

echo ""
echo "HTTPS waa diyaar: https://$DOMAIN"
echo "HTTP wuxuu u jeediyaa HTTPS."
echo ""
echo "Kadib deploy:"
echo "  cd $ROOT && npm run install:server && npm run deploy"
echo ""
echo "Test:"
echo "  curl -I https://$DOMAIN/"
echo "  curl https://$DOMAIN/api/health"
