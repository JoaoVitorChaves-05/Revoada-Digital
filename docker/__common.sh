#!/usr/bin/env bash
BUILDABLE_SERVICES=("backend")
show_services() {
    echo "Available services:"
    docker compose config --services
}

show_buildable_services() {
    echo "Buildable services:"
    printf '  %s\n' "${BUILDABLE_SERVICES[@]}"
}

require_service() {
    local service="$1"

    if ! docker compose config --services | grep -qx "$service"; then
        echo "Error: '$service' is not a valid service."
        echo
        return 1
    fi
}

require_buildable_service() {
    local service="$1"

    for buildable in "${BUILDABLE_SERVICES[@]}"; do
        if [ "$service" = "$buildable" ]; then
            return 0
        fi
    done

    echo "Error: '$service' is not a buildable service."
    return 1
}

usage() {
    echo "Usage:"
    echo "  $1"
    echo
}
