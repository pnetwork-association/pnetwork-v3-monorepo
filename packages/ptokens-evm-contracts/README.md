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

**Note:** the general advice is to use forks of either _Mumbai_, _Sepolia_ or _Goerli_ this way we don't need to add anything related to network ids in `ptokens-utils`.

#### Generate relayer configuration

Use the `apps:generate-relayer-config` task (this will save the relevant configuration into the ptokens-relayer folder).
Make sure to set the docker compose volume mapping to the correct `*.config.json` files.

**Tip:** use `--show` to have a preview of the configuration.

**Tip:** use `--localhost` to set the url for mongodb to localhost instead of the mongo service name.

#### Usage

Checkout the help of the following tasks in order to perform user operations:

- `router:mint` perform a pegin from the underlying asset deployed undert the specified hardhat network (`--network`) to the specified destination chain id
- `router:burn` perform a redeem of the ptoken (`--network` selected should match the network id of the underlying asset)
- `router:transfer` perform a cross-chain transfer (including host2host) of the ptoken (be careful to check the ptoken contract is deployed on the destination chain)
