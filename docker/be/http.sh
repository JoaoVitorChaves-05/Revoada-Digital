#!/usr/bin/env bash

set -e

if [ "$#" -lt 4 ]; then
    echo "Usage:"
    echo "  $0 <METHOD> <endpoint> <--data|--file> <data|file>"
    echo
    exit 1
fi

METHOD="$1" 
ENDPOINT="$2" 
SOURCE="$3" 
DATA="$4"

case "$METHOD" in 
  GET|POST|PUT|PATCH|DELETE) 
    ;; 
  *) 
    echo "Error: invalid HTTP method '$METHOD'." 
    echo "Allowed methods: GET, POST, PUT, PATCH, DELETE." 
    exit 1 
    ;; 
esac

if [[ "$ENDPOINT" != /* ]]; then 
  echo "Error: endpoint must start with '/'." 
  echo "Example: /school" 
  exit 1 
fi

case "$SOURCE" in 
  --data) 
    ;;

  --file) 
    if [ ! -f "$DATA" ]; then 
      echo "Error: file '$DATA' does not exist." 
      exit 1 
    fi

    if [ ! -r "$DATA" ]; then 
      echo "Error: file '$DATA' is not readable." 
      exit 1 
    fi 
    ;;

  *) 
    echo "Error: invalid data source '$SOURCE'." 
    echo "Expected '--data' or '--file'." 
    exit 1 
    ;; 
esac

CURL_ARGS=( 
  -X "$METHOD" 
  -H "Content-Type: application/json" 
)

if [ "$SOURCE" = "--data" ]; then 
  CURL_ARGS+=(-d "$DATA") 
else 
  CURL_ARGS+=(-d "@$DATA") 
fi

curl "${CURL_ARGS[@]}" "localhost:3000${ENDPOINT}"
