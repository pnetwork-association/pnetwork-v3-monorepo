# :page_with_curl: Provable pToken ERC20 Vault Smart-Contract

This repo houses the upgradeable ERC20-Vault logic smart-contract, as well as a simple CLI to help with deployment, verification & interacting with it.

&nbsp;

## :boom: Usage Guide:

After cloning the repository, first install the dependencies:

```
> npm ci
```

Then, to see the usage guide, run:

```
> ./cli.js --help
```

Output:

```

❍ pTokens ERC20 Vault Command Line Interface

  Copyright Provable Things 2021
  Questions: greg@oraclize.it

❍ Info:

  A tool to aid with deployments of & interactions with the upgradeable pToken ERC20 vault logic contract.

  NOTE: Functions that make transactions require a private key. Please provide a GPG encrpyted file called
    'private-key.gpg' containing your key in the root of the repository. Create one via:
    'echo <your-private-key> | gpg -c --output private-key.gpg'

  NOTE: The tool requires a '.env' file to exist in the root of the repository with the following info:
    ENDPOINT=<rpc-endpoint-for-blochain-to-interact-with>

  NOTE: To call the 'verifyVault' function, the following extra environment variable is required:
    ETHERSCAN_API_KEY=<api-key-for-automated-contract-verifications>

❍ Usage:
  cli.js --help
  cli.js --version
  cli.js deployVault
  cli.js flattenContract
  cli.js showSuggestedFees
  cli.js showWalletDetails
  cli.js showExistingContracts
  cli.js getPNetwork <deployedAddress>
  cli.js getWEthAddress <deployedAddress>
  cli.js getSupportedTokens <deployedAddress>
  cli.js verifyVault <network> <deployedAddress>
  cli.js setPNetwork <deployedAddress> <ethAddress>
  cli.js isTokenSupported <deployedAddress> <ethAddress>
  cli.js getEncodedInitArgs <wEthAddress> <tokensToSupport>...
  cli.js pegIn <deployedAddress> <amount> <tokenAddress> <destinationAddress> --userData=<hex>

❍ Commands:
  setPNetwork           ❍ Set the pNetwork address.
  showSuggestedFees     ❍ Show 'ethers.js' suggested fees.
  deployVault           ❍ Deploy the ERC20 vault logic contract.
  verifyVault           ❍ Verify a deployed pToken logic contract.
  pegIn                 ❍ Peg in <amount> of <tokenAddress> to <destinationAddress>.
  getPNetwork           ❍ Show the pNetwork address of the vault at <deployedAddress>.
  getWEthAddress        ❍ Show the wETH address set in the vault at <deployedAddress>.
  flattenContract       ❍ Flatten the contract in case manual verification is required.
  getSupportedTokens    ❍ Show list of tokens supprted by the vault at <deployedAddress>.
  showWalletDetails     ❍ Decrypts the private key and shows address & balance information.
  isTokenSupported      ❍ Is token at <ethAddress> supported in vault at <deployedAddress>.
  getEncodedInitArgs    ❍ Calculate the initializer function arguments in ABI encoded format.
  showExistingContracts ❍ Show list of existing logic contract addresses on various blockchains.

❍ Options:
  --help                ❍ Show this message.
  --version             ❍ Show tool version.
  <ethAddress>          ❍ A valid ETH address.
  <tokenAddress>        ❍ ETH address of token.
  <deployedAddress>     ❍ The ETH address of the deployed vault.
  <destinationAddress>  ❍ Destination address of a token peg in.
  --userData=<hex>      ❍ User data in hex format [default: 0x].
  <amount>              ❍ Amount of tokens in their most granular format.
  <tokensToSupport>     ❍ Addresses of ERC20 tokens the vault will support.
  <wEthAddress>         ❍ The address for the wrapped ETH token on the blockchain to be deployed to.
  <network>             ❍ Network the vault is deployed on. It must exist in the 'hardhat.config.json'.

```

&nbsp;

### :radioactive: Secrets:

This tool requires a private key in order to sign transactions. GPG is used to protect the private key. To encrypt a private key using a GPG key from your keyring:

```
echo <your-private-key> | gpg -e --output private-key.gpg
```

Or, if you'd rather use a password to encrypt your keyfile, use this instead:

```
echo <your-private-key> | gpg -c --output private-key.gpg
```

The CLI also requires a JsonRPC endpoint for the blockchain you're interacting with. To easily provision this, create a `.env` file in the root of the repository and fill it in thusly:

```
ENDPOINT=<ethRpcEndpoint>
```

Finally, to verify a contract, you'll need an etherscan API key too. You can add this to your `.env` file thusly:

```
ETHERSCAN_API_KEY=<apikey>
```

NOTE: If you're not verifying contracts, you don't need to provide this environment variable at all.

&nbsp;

### :black_nib: Notes:

- To simplify deployments, the tool uses **`ethers.js`** suggested fees for deployment. The CLI function **`showSuggestedFees`** will show you the currently suggested fees, including **[EIP1559](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md)** specific values if the chain you're working with is EIP1559 compaible.

- In case the chain you're deploying to does not have etherscan-style contract verification which works with the hardhat plugin, there exists the **`flattenContract`** command. This will flatten the **`pToken`** contract into a single **`.sol`** file that can then be used for manual verification.

&nbsp;

### :guardsman: Smart-Contract Tests:

1. Install dependencies

```
❍ npm ci
```

2. Run the tests via:

```
❍ npm run tests
```

Test output:

```

  Erc20Vault Tests
    Initalizer Tests
      ✓ Token addresses sent to constructor should be supported (250ms)
    Ownership Tests
      ✓ PNETWORK_ADDRESS can change PNETWORK_ADDRESS (55ms)
      ✓ NON_PNETWORK_ADDRESS cannot change PNETWORK_ADDRESS (62ms)
      ✓ Should not be able to set pNetwork address to the zero address
    Token Approval Tests
      ✓ PNETWORK_ADDRESS can add appoved token address
      ✓ NON_PNETWORK_ADDRESS cannot add appoved token address
      ✓ PNETWORK_ADDRESS can remove appoved token address
      ✓ NON_PNETWORK_ADDRESS cannot remove appoved token address
    Peg In Tests
      ✓ Should NOT peg in if token is not supported
      ✓ Should NOT peg in if token is supported but insufficient allowance approved
      ✓ Should NOT peg in supported token if sufficient allowance approved, but token amount is 0
      ✓ Should peg in if token is supported and sufficient allowance approved (54ms)
      ✓ Should peg in with user data (47ms)
    ERC777 Peg In Tests
      ✓ Should automatically peg in on ERC777 send (41ms)
      ✓ Should peg in an ERC777 token
    Peg Out Tests
      ✓ NON_PNETWORK_ADDRESS cannot peg out (45ms)
      ✓ PNETWORK_ADDRESS cannot peg out if insufficient balance
      ✓ PNETWORK_ADDRESS can peg out with sufficient balance (61ms)
      ✓ Can peg out with user data (70ms)
      ✓ Pegging out to ERC777 recipient with user data will call tokens recieved hook (91ms)
    wETH Tests
      Peg In wETH Tests
        ✓ Should peg in wETH
        ✓ Should peg in wETH with user data
      Peg Out wETH Tests
        ✓ Should peg out wETH without user data
        ✓ Should peg out wETH with user data
        ✓ Should peg out wETH to smart-contract w/ expensive fallback function (56ms)
        ✓ Should be able to peg out wETH with user data to a smart-contract (69ms)
        ✓ Should not fail to peg out wETH with user data to an EOA
        ✓ Pegging out wETH Should not be susceptible to re-entrancy attack (55ms)


  28 passing (8s)

```

&nbsp;

## :white_medium_square: To Do:

[ ] Allow custom gas prices in CLI?