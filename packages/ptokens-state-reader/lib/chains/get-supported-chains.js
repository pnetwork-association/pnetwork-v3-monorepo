const R = require('ramda')
const constants = require('ptokens-constants')

module.exports.getSupportedChainsFromState = _state =>
  Promise.resolve(R.prop(constants.config.KEY_SUPPORTED_CHAINS))
