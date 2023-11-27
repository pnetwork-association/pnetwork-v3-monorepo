---
'ptokens-evm-contracts': minor
---

Minor improvements and add state-emitter/reader config generation

Plus:

- Fix axios vulnerability through override
- Factor out generate-configs function into separate modules
- Add state-emitter & state-reader config generation on `app:generate-configs` task
- Add `start-challenge` `slash` & `light-resume` tasks
- Use ptokens-constants `ZERO_ADDRESS` plus other factored out struct
