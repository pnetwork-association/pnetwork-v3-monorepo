#!/bin/bash 

get_label() {
  local __out=$1
  local __dockerfile=$2
  local __label_key=$3

  local out=""

  out=$(cat $__dockerfile \
    | grep "LABEL\s*$__label_key=" \
    | tr '=' ' '  \
    | awk '{print $3}'
  )

  eval "$__out"="'$out'"
}

main() {
  local registry_name=ghcr.io/pnetwork-association

  for dockerfile in $(ls *.Dockerfile); do
    local tag=""
    local version=""

    get_label tag "$dockerfile" "tag"
    get_label version "$dockerfile" "version"

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
