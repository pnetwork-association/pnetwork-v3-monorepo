#!/bin/bash

#
# Script in order to facilitate the ptokens-state-emitter
# compoenent configuration
#
#  - Reads the ptoekns-guardians processor config.json
#  - Builds the supported chains object based on that one
#

interval=${1:-"5000"}
jq '{ "network-id": .["network-id"], "chain-name": .["chain-name"], "chain-type": .["chain-type"], "provider-url": .["provider-url"] }' ../../apps/ptokens-guardian/*processor.config.json \
  | jq -s . \
  | jq '{ "supported-chains": . }' \
  | jq '. + { "protocols": [{ "type": "ipfs", "data": { "topic": "pnetwork-v3" } }] }' \
  | jq '. + { "identity": "./private-key" }' \
  | jq '. + { "interval": '$interval' }'

