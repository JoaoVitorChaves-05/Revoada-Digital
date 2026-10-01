#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"

npx tsx "$SCRIPT_DIR/questions.ts"
