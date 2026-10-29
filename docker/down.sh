#!/usr/bin/env bash

set -e

source "docker/__common.sh"

if [ "$#" -gt 1 ]; then
    usage "$0 [service]"
    echo
    show_services
    exit 1
fi

if [ "$#" -eq 1 ]; then
    if ! require_service "$1" ; then
      show_services 
      exit 1
    fi
    docker compose down "$1"
    exit 0
fi

read -r -p "Down all services? (y/n): " answer

case "$answer" in
    y|Y|yes|Yes|YES)
        docker compose down
        ;;
    n|N|no|No|NO)
        echo "Down cancelled."
        ;;
    *)
        echo "Invalid answer. Please answer y or n."
        exit 1
        ;;
esac
