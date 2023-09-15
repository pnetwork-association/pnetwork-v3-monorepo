const deployAsset = require('./deploy-asset.task')
const deployInit = require('./deploy-init.task')
const deployPToken = require('./deploy-ptoken.task')
const deployContract = require('./deploy-contract.task')
const deployPFactory = require('./deploy-pfactory.task')
const deployPNetworkHub = require('./deploy-pnetwork-hub.task')
const deployV3Contracts = require('./deploy-v3-contracts.task')
const generateConfig = require('./deploy-copy-config.task')
const deployGovernanceMessageEmitter = require('./deploy-governance-emitter')

module.exports = {
  deployInit,
  deployAsset,
  deployPToken,
  deployPFactory,
  deployContract,
  deployPNetworkHub,
  deployV3Contracts,
  generateConfig,
  deployGovernanceMessageEmitter,
}
