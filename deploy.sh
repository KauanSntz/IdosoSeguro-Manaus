#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/idoso-seguro"
PORT="8085"
SERVICE="app"

cd "$APP_DIR"

echo "========================================"
echo "Deploy Idoso Seguro+ Manaus iniciado"
echo "========================================"

mkdir -p database uploads

echo "[1/4] Validando Docker Compose..."
docker compose config --quiet

echo "[2/4] Construindo e atualizando container..."
docker compose up -d --build --remove-orphans "$SERVICE"

echo "[3/4] Verificando saude da aplicacao..."
success=0

for attempt in $(seq 1 30); do
    http_code="$(curl --silent --output /dev/null \
        --write-out '%{http_code}' \
        "http://127.0.0.1:${PORT}/api/health" || true)"

    echo "Tentativa ${attempt}/30 - HTTP ${http_code:-sem resposta}"

    if [ "$http_code" = "200" ]; then
        success=1
        break
    fi

    sleep 2
done

if [ "$success" -ne 1 ]; then
    echo "FALHA: aplicacao nao respondeu corretamente."
    docker compose ps
    docker compose logs --tail=100 "$SERVICE"
    exit 1
fi

echo "[4/4] Estado final:"
docker compose ps

echo "========================================"
echo "Deploy concluido com sucesso"
echo "Aplicacao: http://31.97.147.114:${PORT}"
echo "========================================"
