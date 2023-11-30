const R = require('ramda')
const { FLAG_NAME_MONGO_LOCALHOST } = require('../constants')
const constants = require('ptokens-constants')
module.exports.addProtocols = R.curry((_taskArgs, _obj) =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_PROTOCOLS]: [
      {
        [constants.config.KEY_TYPE]: 'ipfs',
        [constants.config.KEY_DATA]: {
          topic: 'pnetwork-v3',
          url: _taskArgs[FLAG_NAME_MONGO_LOCALHOST] ? 'http://127.0.0.1:5001' : 'http://ipfs:5001',
        },
      },
    ],
  })
)
