# ptokens-evm-contracts

## 0.6.0-beta.6

### Patch Changes

- Updated dependencies [4ad0fe6]
  - ptokens-request-processor@1.10.0-beta.5

## 0.6.0-beta.5

### Patch Changes

- Updated dependencies [804722b]
- Updated dependencies [16b635b]
- Updated dependencies [6991e45]
  - ptokens-request-processor@1.10.0-beta.4
  - ptokens-constants@1.7.0-beta.3
  - ptokens-utils@4.7.0-beta.4

## 0.6.0-beta.4

### Patch Changes

- aeebea8: fix double minting when swapping toward the same chain

## 0.6.0-beta.3

### Patch Changes

- e748897: fix `hub:cancel` task + `apps:generate-configs` task'
- eb3d51e: fix inactive actors counter
- e8fa52b: refactor actor status tracking
- Updated dependencies [e748897]
  - ptokens-utils@4.7.0-beta.3
  - ptokens-request-processor@1.10.0-beta.3

## 0.6.0-beta.2

### Minor Changes

- fc97b83: add originNetworkId field to UserOperationEvent

### Patch Changes

- Updated dependencies [fc97b83]
  - ptokens-constants@1.7.0-beta.2
  - ptokens-request-processor@1.10.0-beta.2
  - ptokens-utils@4.7.0-beta.2

## 0.6.0-beta.1

### Minor Changes

- 9dc8031: Minor improvements and add state-emitter/reader config generation

  Plus:

  - Fix axios vulnerability through override
  - Factor out generate-configs function into separate modules
  - Add state-emitter & state-reader config generation on `app:generate-configs` task
  - Add `start-challenge` `slash` & `light-resume` tasks
  - Use ptokens-constants `ZERO_ADDRESS` plus other factored out struct

### Patch Changes

- d51841d: avoid multiple slashes close together for the same actor
- df669a2: update vulnerable merkletreejs
- Updated dependencies [9dc8031]
- Updated dependencies [9dc8031]
- Updated dependencies [9dc8031]
- Updated dependencies [60f6976]
- Updated dependencies [df669a2]
  - ptokens-constants@1.7.0-beta.1
  - ptokens-request-processor@1.10.0-beta.1
  - ptokens-utils@4.7.0-beta.1

## 0.5.2-beta.0

### Patch Changes

- ef36cc8: fix direct slashing in the interim chain
- bf2421f: align contract calls to newest registration manager
- Updated dependencies [91d4cb5]
- Updated dependencies [e40eb2f]
- Updated dependencies [91b7065]
  - ptokens-constants@1.6.2-beta.0
  - ptokens-utils@4.6.2-beta.0
  - ptokens-request-processor@1.9.3-beta.0
