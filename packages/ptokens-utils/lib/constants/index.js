const misc = require('./misc')
const sides = require('./bridge-sides')
const loggerFormats = require('./logger-formats')
const networkIds = require('./network-ids')
const blockchainType = require('./blockchain-type')

module.exports = {
  ...misc,
  ...sides,
  loggerFormats,
  networkIds,
  blockchainType,
}
