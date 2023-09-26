const deployAsset = require('./deploy-asset.task')
const deployInit = require('./deploy-init.task')
const deployPToken = require('./deploy-ptoken.task')
const deployContract = require('./deploy-contract.task')
const deployPFactory = require('./deploy-pfactory.task')
const deployPRegistry = require('./deploy-registry.task')
const deploySlasher = require('./deploy-slasher.task')
const deployPNetworkHub = require('./deploy-pnetwork-hub.task')
const deployV3Contracts = require('./deploy-v3-contracts.task')
const generateConfig = require('./deploy-copy-config.task')
const deployGovernanceMessageEmitter = require('./deploy-governance-message-emitter.task')
const deployGovernanceMessageVerifier = require('./deploy-governance-message-verifier.task')
const deployEpochsManager = require('./deploy-epochs-manager.task')

module.exports = {
  deployInit,
  deployAsset,
  deployPToken,
  deployPFactory,
  deployPRegistry,
  deploySlasher,
  deployContract,
  deployPNetworkHub,
  deployV3Contracts,
  generateConfig,
  deployGovernanceMessageEmitter,
  deployGovernanceMessageVerifier,
  deployEpochsManager,
}
