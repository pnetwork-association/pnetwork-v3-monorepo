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
  KEY_STATEMANAGER: 'stateManager',
  KEY_PROUTER: 'pRouter',
  KEY_PFACTORY: 'pFactory',
  KEY_CHALLENGE_PERIOD: 'challegePeriod',

  // Contract names
  CONTRACT_NAME_STANDARD_TOKEN: 'StandardToken',
  CONTRACT_NAME_PTOKEN: 'PToken',
  CONTRACT_NAME_PROUTER: 'PRouter',
  CONTRACT_NAME_PFACTORY: 'PFactory',
  CONTRACT_NAME_STATEMANAGER: 'StateManager',

  // Task names and descriptions
  TASK_NAME_DEPLOY_INIT: 'deploy:init',
  TASK_NAME_DEPLOY_UNDERLYING_ASSET: 'deploy:underlying-asset',
  TASK_NAME_DEPLOY_PTOKEN: 'deploy:ptoken',
  TASK_NAME_DEPLOY_PROUTER: 'deploy:prouter',
  TASK_NAME_DEPLOY_STATEMANAGER: 'deploy:statemanager',
  TASK_NAME_DEPLOY_CONTRACT: 'deploy:contract',
  TASK_NAME_DEPLOY_ASSET: 'deploy:asset',
  TASK_NAME_DEPLOY_PFACTORY: 'deploy:pfactory',
  TASK_NAME_CONFIG_PFACTORY: 'config-pfactory',
  TASK_NAME_GET_NETWORK_ID: 'get-network-id',
  TASK_NAME_USER_MINT_AND_BURN: 'user-send:mint-and-burn',
  TASK_NAME_USER_SEND_MINT: 'user-send:mint',
  TASK_NAME_USER_SEND_TRANS: 'user-send:transfer',
  TASK_NAME_USER_SEND_BURN: 'user-send:burn',
  TASK_NAME_SM_PEO: 'state-manager:execute-operation',
  TASK_DESC_DEPLOY_CONTRACT: 'Deploy a contract.',
  TASK_DESC_DEPLOY_ASSET: 'Deploy a pToken or a Token to be used as underlying asset',
  TASK_DESC_DEPLOY_INIT:
    'Creates a new deployment configuration or returns the existing one for the selected network.',
  TASK_DESC_GET_NETWORK_ID: 'Get the pNetwork id for the given chain id',
  TASK_DESC_DEPLOY_PFACTORY:
    'Deploy the pFactory contract or returns the existing address defined in the configuration.',
  TASK_DESC_CONFIG_PFACTORY:
    'Config the pFactory contract with the pRouter and pStateManager in the configuration',
  TASK_DESC_DEPLOY_PROUTER:
    'Deploy the pRouter contract or retrieve an existing one from the configuration.',
  TASK_DESC_DEPLOY_PTOKEN:
    'Deploy a pToken contract or attach to an existing one from the configuration.',
  TASK_DESC_DEPLOY_UNDERLYING_ASSET:
    'Deploy a standard ERC20 Token contract or attach to an existing one from the configuration.',
  TASK_DESC_DEPLOY_STATEMANAGER:
    'Deploy a stateManager contract or attach to an existing one from the configuration.',
  TASK_DESC_USER_MINT_AND_BURN:
    'Mint a new pToken providing an underlying asset and send it to a different chain.',
  TASK_DESC_USER_SEND_MINT: 'Mint new pTokens given an asset address.',
  TASK_DESC_USER_SEND_TRANS: 'Move pTokens form a chain to another one.',
  TASK_DESC_USER_SEND_BURN: 'Redeem pTokens.',
}
