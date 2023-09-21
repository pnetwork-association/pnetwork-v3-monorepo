## ptokens-state-emitter

### Requirements:

- Add IPFS pub sub required wiring
- This requires [kubo](https://docs.ipfs.tech/install/command-line/#install-ipfs-kubo) to be installed locally and running

```
ipfs init
ipfs daemon --enable-pubsub-experiment
```

**NOTE:** currently the IPFS JSON RPC api is not supported (even if would be desirable, hence this component is meant to be run
as standalone and not through Docker)

### Description

- New component that grabs all the guardian listeners configurations and builds up a unique one that is used to fetch the sync state of each supported chain
- This intermittently publish the following object by using the IPFS pub sub protocol:

```
{
  actorType: <string: sentinel | guardian >,
  signature: <base64EncodedString>,
  signerAddress: <string>,
  softwareVersions: {
    <name: string>: <semver>,
    ...
  },
  syncState: {
    networkId: <string>: {
      latestBlockHash: <string>,
      latestBlockNumber: <number>,
      latestBlockTimestamp: <number UTC>,
    },
    ...
  },
  timestamp: <number - as UTC>,
  version: <number[0-255]>,
}
```

- A challenger is supposed to listen to the topic `pnetwork-v3` in order to analyze a guardian state and act accordingly if an anomaly is detected
