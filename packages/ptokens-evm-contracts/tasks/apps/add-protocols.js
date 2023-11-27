const constants = require('ptokens-constants')
module.exports.addProtocols = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_PROTOCOLS]: [
      {
        [constants.config.KEY_TYPE]: 'ipfs',
        [constants.config.KEY_DATA]: { topic: 'pnetwork-v3' },
      },
    ],
  })
