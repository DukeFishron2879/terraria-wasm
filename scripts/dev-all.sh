#!/usr/bin/env bash
set -euo pipefail

# Example usage:
# LISTEN_PORT=9001 TARGET=127.0.0.1:7777 ./scripts/dev-all.sh
# Or: ./scripts/dev-all.sh (will use defaults)

LISTEN_PORT="${LISTEN_PORT:-9001}"
TARGET="${TARGET:-127.0.0.1:7777}"

# Start ws->tcp proxy in background
echo "Starting ws->tcp proxy on port ${LISTEN_PORT} -> ${TARGET}"
node tools/ws-tcp-proxy.js --listen "${LISTEN_PORT}" --target "${TARGET}" &
PROXY_PID=$!

# Export Vite env to point at local proxy (frontend reads VITE_WISP_URL)
export VITE_WISP_URL="ws://localhost:${LISTEN_PORT}/"

echo "Running pnpm dev with VITE_WISP_URL=${VITE_WISP_URL}"
pnpm dev

# If pnpm dev exits, kill proxy
kill "$PROXY_PID" || true
