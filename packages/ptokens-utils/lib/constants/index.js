const misc = require('./misc')
const sides = require('./bridge-sides')
const loggerFormats = require('./logger-formats')
const networkIds = require('./network-ids')

module.exports = {
  ...misc,
  ...sides,
  loggerFormats,
  networkIds,
}
