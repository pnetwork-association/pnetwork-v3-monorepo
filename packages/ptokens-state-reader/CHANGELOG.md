# ptokens-state-reader

## 1.1.0-beta.3

### Patch Changes

- Updated dependencies [16b635b]
  - ptokens-constants@1.7.0-beta.3
  - ptokens-utils@4.7.0-beta.4

## 1.1.0-beta.2

### Minor Changes

- e748897: use IPFS JSONRPC instead of the binary

### Patch Changes

- Updated dependencies [e748897]
  - ptokens-utils@4.7.0-beta.3

## 1.1.0-beta.1

### Patch Changes

- Updated dependencies [fc97b83]
  - ptokens-constants@1.7.0-beta.2
  - ptokens-utils@4.7.0-beta.2

## 1.1.0-beta.0

### Minor Changes

- 9dc8031: Add component for constantly checking each pNetwork v3 actor (guardian or sentinel) status

  In particular:

  - if an actor has not pushed any status update on IPFS pubsub
  - if the actors's status published on IPFS pubsub includes blocks
    numbers far from the chain tip

  Steps:

  1.  Download the actors propagated event for the current
      epoch
  2.  Compute thresholds based on the avg block times
  3.  Updates each actor status for each supported chain
  4.  Challenge and slash if for each invalid actor status
      detected

### Patch Changes

- 60f6976: align to latest adjustments to PNetworkHub
- Updated dependencies [9dc8031]
- Updated dependencies [9dc8031]
- Updated dependencies [60f6976]
  - ptokens-constants@1.7.0-beta.1
  - ptokens-utils@4.7.0-beta.1
