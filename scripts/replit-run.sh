#!/bin/bash
set -euo pipefail

export NODE_ENV="${NODE_ENV:-production}"
export BASE_PATH="${BASE_PATH:-/}"
export PORT="${PORT:-8081}"

pnpm install --frozen-lockfile

PORT=8080 BASE_PATH="$BASE_PATH" pnpm --filter @workspace/alpha-hunter run build
pnpm --filter @workspace/api-server run build

cd artifacts/api-server
exec node --enable-source-maps ./dist/index.mjs
