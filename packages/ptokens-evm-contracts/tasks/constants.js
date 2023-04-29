module.exports = {
  KEY_NETWORK_ID: 'networkId',
  KEY_TEST_TOKEN_ADDRESS: 'underlyingAssetAddress',
  KEY_PTOKEN_ADDRESS: 'pTokenAddress',
  KEY_PROUTER_ADDRESS: 'routerAddress',
  KEY_PFACTORY_ADDRESS: 'factoryAddress',
  KEY_STATEMANAGER_ADDRESS: 'stateManagerAddress',
  KEY_CHALLENGE_PERIOD: 'challegePeriod',
  CONTRACT_NAME_TEST_TOKEN: 'StandardToken',
  CONTRACT_NAME_PTOKEN: 'PToken',
  CONTRACT_NAME_PROUTER: 'PRouter',
  CONTRACT_NAME_PFACTORY: 'PFactory',
  CONTRACT_NAME_STATEMANAGER: 'StateManager',
  TASK_NAME_DEPLOY_INIT: 'deploy:init',
  TASK_NAME_DEPLOY_TEST_TOKEN: 'deploy:erc20-token',
  TASK_NAME_DEPLOY_PTOKEN: 'deploy:ptoken',
  TASK_NAME_DEPLOY_PROUTER: 'deploy:prouter',
  TASK_NAME_DEPLOY_STATEMANAGER: 'deploy:statemanager',
  TASK_NAME_DEPLOY_CONTRACT: 'deploy:contract',
  TASK_NAME_DEPLOY_PFACTORY: 'deploy:pfactory',
  TASK_NAME_GET_NETWORK_ID: 'get-network-id',
  TASK_DESC_DEPLOY_CONTRACT: 'Deploy a contract.',
  TASK_DESC_DEPLOY_INIT:
    'Creates a new deployment configuration or returns the existing one for the selected network.',
  TASK_DESC_GET_NETWORK_ID: 'Get the pNetwork id for the given chain id',
  TASK_DESC_DEPLOY_PFACTORY:
    'Deploy the pFactory contract or returns the existing address defined in the configuration.',
  TASK_DESC_DEPLOY_PROUTER:
    'Deploy the pRouter contract or retrieve an existing one from the configuration.',
  TASK_DESC_DEPLOY_PTOKEN:
    'Deploy a pToken contract or attach to an existing one from the configuration.',
  TASK_DESC_DEPLOY_TEST_TOKEN:
    'Deploy a standard ERC20 Token contract or attach to an existing one from the configuration.',
  TASK_DESC_DEPLOY_STATEMANAGER:
    'Deploy a stateManager contract or attach to an existing one from the configuration.',
}
