const deployInit = require('./deploy-init.task')
const deployPToken = require('./deploy-ptoken.task')
const deployPRouter = require('./deploy-prouter.task')
const deployContract = require('./deploy-contract.task')
const deployPFactory = require('./deploy-pfactory.task')
const deployStateManager = require('./deploy-state-manager.task')
const deployERC20TokenTask = require('./deploy-token-erc20.task')

module.exports = {
  deployInit,
  deployPToken,
  deployPRouter,
  deployPFactory,
  deployStateManager,
  deployERC20TokenTask,
}
