#!/usr/bin/env bash

set -e

source "docker/__common.sh"

if [ "$#" -lt 2 ]; then 
  usage "$0 <service> <command> [arguments...]"
  echo "use command ´sh´ for continuous use"
  exit 1
fi

if ! require_service "$1"; then
  show_services
  exit 1;
fi

docker compose exec "$@"
