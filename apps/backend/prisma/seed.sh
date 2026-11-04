#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
SEEDS_DIR="$SCRIPT_DIR/seeds"

run_all_seeds() {
  for script in "$SEEDS_DIR"/*.sh; do
    if [ -f "$script" ]; then
      bash "$script"
    fi
  done
}

# Sem argumentos: roda todos os seeds de "$SEEDS_DIR".
if [ "$#" -eq 0 ]; then
  # Em ambiente nao-interativo (CI, container sem TTY, `prisma db seed`),
  # roda tudo direto. So pede confirmacao quando ha um terminal conectado.
  if [ -t 0 ]; then
    read -r -p "Rodar todos os seeds em $SEEDS_DIR? (y/n): " answer
    case "$answer" in
      y|Y|yes|Yes|YES) run_all_seeds ;;
      n|N|no|No|NO) echo "Seeding cancelado." ;;
      *) echo "Resposta invalida. Responda y ou n." ; exit 1 ;;
    esac
  else
    run_all_seeds
  fi
  exit 0
fi

# Com argumentos: roda apenas os scripts informados.
for file in "$@"; do
  if [ -f "$file" ]; then
    bash "$file"
  else
    echo "Arquivo nao encontrado -> $file"
    exit 1
  fi
done