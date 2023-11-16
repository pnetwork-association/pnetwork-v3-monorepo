---
'ptokens-utils': minor
---

Move out blockchainType and networkIds struct

Plus:

- add `mapAll` in order to `Promise.all` through an array
- add Merkle Proof calculation
- improve `rejectIfNil` portability
- Use `upsert: true` when updating reports
- Remove a test on the updateReport due to the above
- Add test for `mapAll`
