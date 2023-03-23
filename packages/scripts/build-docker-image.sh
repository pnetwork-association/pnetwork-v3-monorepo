#!/bin/bash
set -euo pipefail

function main() {
    local name=""
    local version=""
    local registry_name=ghcr.io
    local org_name=pnetwork-association
    local prefix=$registry_name/$org_name

    version=$(jq -r '.version' package.json)
    name=$(jq -r '.name' package.json)

    if [[ -z "$name" ]]; then
        echo "Please specify a \"name\" field in package.json"
        exit 1
    fi

    if [[ -z "$version" ]]; then
        echo "Please specify a \"version\" field in package.json"
        exit 1
    fi

    local project_root=${PROJECT_ROOT:-'./build'}
    local build_folder=$project_root/build

    mkdir -p "$build_folder"

    docker build \
        -t "$prefix/$name:latest" \
        -t "$prefix/$name:$version" \
        --iidfile "$build_folder/docker-id" \
        "$@" .
}

main "$@"
