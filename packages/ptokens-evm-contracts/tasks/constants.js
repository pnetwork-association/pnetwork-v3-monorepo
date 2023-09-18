module.exports = {
  KEY_NETWORK_ID: 'networkId',
  KEY_UNDERLYING_ASSET_LIST: 'underlyingAssets',
  KEY_PTOKEN_LIST: 'pTokens',
  KEY_ASSET_NAME: 'name',
  KEY_ASSET_SYMBOL: 'symbol',
  KEY_ASSET_DECIMALS: 'decimals',
  KEY_ASSET_TOTAL_SUPPLY: 'totalSupply',
  KEY_ADDRESS: 'address',
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS: 'underlyingAssetAddress',
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID: 'underlyingAssetNetworkId',
  KEY_PNETWORKHUB: 'hub',
  KEY_PFACTORY: 'pFactory',
  KEY_PREGISTRY: 'pRegistry',
  KEY_SLASHER: 'slasher',
  KEY_CHALLENGE_PERIOD: 'challegePeriod',

  // Contract names
  CONTRACT_NAME_PFACTORY: 'PFactory',
  CONTRACT_NAME_REGISTRY: 'PRegistry',
  CONTRACT_NAME_SLASHER: 'Slasher',

  // Params names and descriptions
  PARAM_NAME_DEST_CHAIN: 'destinationChainName',
  PARAM_DESC_DEST_CHAIN: 'Destination chain name (ex. mainnet, mumbai ...)',
  PARAM_NAME_DEST_ADDRESS: 'destinationAddress',
  PARAM_DESC_DEST_ADDRESS: 'Where the pToken is destined to',
  PARAM_NAME_PTOKEN_ADDRESS: 'pTokenAddress',
  PARAM_DESC_PTOKEN_ADDRESS: 'Address of the pTokens to be redeemed',

  // Global task parameters
  TASK_PARAM_GASPRICE: 'gasPrice',
  TASK_PARAM_GASLIMIT: 'gasLimit',
  TASK_PARAM_GASPRICE_DESC: 'Specify the gas price',
  TASK_PARAM_GASLIMIT_DESC: 'Specify the gas limit',
}
