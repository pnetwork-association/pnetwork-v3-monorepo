const constants = require('ptokens-constants')
module.exports.addIdentity = _obj =>
  Promise.resolve({
    ..._obj,
    [constants.config.KEY_IDENTITY_GPG]: './private-key',
  })
