# ptokens-utils

## 4.7.0-beta.2

### Patch Changes

- Updated dependencies [fc97b83]
  - ptokens-constants@1.7.0-beta.2

## 4.7.0-beta.1

### Minor Changes

- 9dc8031: Move out blockchainType and networkIds struct

  Plus:

  - add `mapAll` in order to `Promise.all` through an array
  - add Merkle Proof calculation
  - improve `rejectIfNil` portability
  - Use `upsert: true` when updating reports
  - Remove a test on the updateReport due to the above
  - Add test for `mapAll`

### Patch Changes

- Updated dependencies [9dc8031]
- Updated dependencies [60f6976]
  - ptokens-constants@1.7.0-beta.1

## 4.6.2-beta.0

### Patch Changes

- e40eb2f: add nonce to fallback event ID calculation
- Updated dependencies [91d4cb5]
- Updated dependencies [91b7065]
  - ptokens-constants@1.6.2-beta.0
