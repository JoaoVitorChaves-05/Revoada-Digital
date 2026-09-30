#!/usr/bin/env bash

set -e

source "docker/__common.sh"

if [ "$#" -gt 1 ]; then
    usage "$0 [service]"
    echo "This deletes all stored data of services"
    echo
    show_services
    exit 1
fi

if [ "$#" -eq 1 ]; then
    if ! require_service "$1" ; then
      show_services 
      exit 1
    fi

    read -r -p "Clear stored data of service? (y/n): " answer

    case "$answer" in
        y|Y|yes|Yes|YES)
            docker compose down -v "$1"
            ;;
        n|N|no|No|NO)
            echo "Clear cancelled."
            ;;
        *)
            echo "Invalid answer. Please answer y or n."
            exit 1
            ;;
    esac
    exit 0
fi

read -r -p "Clear all services(delete all stored data)? (y/n): " answer

case "$answer" in
    y|Y|yes|Yes|YES)
        docker compose down -v
        ;;
    n|N|no|No|NO)
        echo "Clear cancelled."
        ;;
    *)
        echo "Invalid answer. Please answer y or n."
        exit 1
        ;;
esac
