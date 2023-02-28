#!/bin/bash 

main() {
  local registry_name=ghcr.io/pnetwork-association

  for dockerfile in $(ls *.Dockerfile); do
    local tag=""
    local version=""
    tag=$(basename "$dockerfile")
    # Extracts the name only
    tag=${tag%.*}
    # Extracts the version
    version=$(cat $dockerfile \
      | grep 'version=' \
      | tr '=' ' '  \
      | awk '{print $3}'
    )

    docker build \
      -f "$dockerfile" \
      -t "$registry_name/$tag:$version" \
      -t "$registry_name/$tag:latest" \
      "$@" \
      .
  done
}

# Eventually pass docker build-args
main "$@"
