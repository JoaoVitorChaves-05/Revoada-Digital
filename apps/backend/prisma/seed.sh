#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
SEEDS_DIR="$SCRIPT_DIR/seeds"

if [ "$#" -eq 0 ]; then
  read -r -p "Run all seeds in "$SEEDS_DIR"? (y/n): " answer
  case "$answer" in
    y|Y|yes|Yes|YES)
      for script in "$SEEDS_DIR"/*.sh; do
        if [-f "$script"]; then
          bash "$script"
        fi
      done
      ;;
    n|N|no|No|NO)
      echo "Seeding cancelled."
      ;;
    *)
      echo "Invalid answer. Please answer y or n."
      exit 1
      ;;
  esac
  exit 0
fi

for file in "$@"; do
  if [ -f "$file"]; then
    bash "$file"
  else
    echo "File Not Found -> "$file""
    exit 1
  fi
done
