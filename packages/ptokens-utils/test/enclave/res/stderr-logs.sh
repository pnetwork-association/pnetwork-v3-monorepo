#!/bin/bash

# Note: this simulates the strongbox
# script where some output logs are
# printed to stderr, in that case the
# syncer must not fail
main() {
  >&2 echo "✔ Step 1"
  >&2 echo "✔ Step 2"
  echo "$1"
}


main "$@"