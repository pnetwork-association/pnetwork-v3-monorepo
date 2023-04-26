const deployInit = require('./deploy-init.task')
const deployPToken = require('./deploy-ptoken.task')
const deployPRouter = require('./deploy-prouter.task')
const deployContract = require('./deploy-contract.task')
const deployPFactory = require('./deploy-pfactory.task')

module.exports = {
  deployInit,
  deployPToken,
  deployPRouter,
  deployPFactory,
}
