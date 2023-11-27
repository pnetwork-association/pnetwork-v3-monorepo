const R = require('ramda')
const constants = require('ptokens-constants')

module.exports.findSupportedChain = R.curry((_supportedChains, _networkId) =>
  R.find(R.propEq(_networkId, constants.config.KEY_NETWORK_ID), _supportedChains)
)
