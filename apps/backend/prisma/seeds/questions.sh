#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PRISMA_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$(cd -- "$PRISMA_DIR/.." && pwd)"

cd "$BACKEND_DIR"

npx tsx "$SCRIPT_DIR/questions.ts"
