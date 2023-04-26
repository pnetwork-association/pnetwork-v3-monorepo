module.exports = {
  KEY_NETWORK_ID: 'networkId',
  KEY_PTOKEN_ADDRESS: 'pTokenAddress',
  KEY_PROUTER_ADDRESS: 'routerAddress',
  KEY_PFACTORY_ADDRESS: 'factoryAddress',
  CONTRACT_NAME_PTOKEN: 'PToken',
  CONTRACT_NAME_PROUTER: 'PRouter',
  CONTRACT_NAME_PFACTORY: 'PFactory',
  TASK_NAME_DEPLOY_INIT: 'deploy:init',
  TASK_NAME_DEPLOY_PTOKEN: 'deploy:ptoken',
  TASK_NAME_DEPLOY_PROUTER: 'deploy:prouter',
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
}
