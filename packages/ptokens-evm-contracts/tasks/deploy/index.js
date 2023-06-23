const deployAsset = require('./deploy-asset.task')
const deployInit = require('./deploy-init.task')
const deployPToken = require('./deploy-ptoken.task')
const deployPRouter = require('./deploy-prouter.task')
const deployContract = require('./deploy-contract.task')
const deployPFactory = require('./deploy-pfactory.task')
const deployStateManager = require('./deploy-state-manager.task')
const deployV3Contracts = require('./deploy-v3-contracts.task')

module.exports = {
  deployInit,
  deployAsset,
  deployPToken,
  deployPRouter,
  deployPFactory,
  deployContract,
  deployStateManager,
  deployV3Contracts,
}
