# ptokens-evm-contracts-v3

EVM contracts for pNetwork V3.

&nbsp;

---

&nbsp;

## :white_check_mark: Publish & Verify

### publish

```
❍ npx hardhat run --network mainnet scripts/deploy-script.js
```

### verify

```
❍ npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
```


### Test

#### Start the local forks

The following commands will start a fork with two different chain id (137 and 115511):

```bash
nx fork1
```

```bash
nx fork2
```

**Note:** you may want to replace the endpoints you are forking from, this can be done by adding the `--fork` flag to Nx

```bash
nx fork1 -- --fork URL
```

**Note:** we chose the chain ids of _Mumbai_ and _Sepolia_ on purpose this way we don't need to add anything related to
network ids in `ptokens-utils`.


#### Generate relayer configuration

Use the `apps:generate-relayer-config` task (this will save the relevant configuration into the ptokens-relayer folder).
Make sure to set the docker compose volume mapping to the correct `*.config.json` files.

