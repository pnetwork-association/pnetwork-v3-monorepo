const erc20 = require('./erc20')
const deploy = require('./deploy')
const getNetworkId = require('./get-network-id')
const userOperations = require('./user-operations')
const test = require('./test')

module.exports = {
  erc20,
  deploy,
  getNetworkId,
  userOperations,
  test,
}
