---
'ptokens-state-reader': minor
---

Add component for constantly checking each pNetwork v3 actor (guardian or sentinel) status

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
