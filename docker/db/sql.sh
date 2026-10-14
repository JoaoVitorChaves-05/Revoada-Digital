#!/usr/bin/env bash
set -e
if [ "$#" -gt 0 ]; then
  echo "Usage:"
  echo "  $0"
  exit 1
fi
psql -U dev -d DevRevoada_Digital 