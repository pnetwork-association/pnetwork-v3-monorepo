const R = require('ramda')
const { ethers } = require('ethers')
const { utils } = require('ptokens-utils')
const pTokensConstants = require('ptokens-constants')
const { KEY_STATUS_OBJECT, KEY_STATUS_SIGNATURE } = require('../constants')

const signStatusObject = R.curry((_obj, _wallet) =>
  Promise.resolve(utils.sortKeysAlphabetically(_obj))
    .then(JSON.stringify)
    .then(_message => _wallet.signMessage(_message))
    .then(_signature => R.assoc(KEY_STATUS_SIGNATURE, _signature, _obj))
)

const signStatusObjectAndAddToState = _state =>
  new Promise((resolve, reject) => {
    const statusObject = _state[KEY_STATUS_OBJECT]
    const identityGpgFile = _state[pTokensConstants.config.KEY_IDENTITY_GPG]
    return utils
      .readIdentityFile(identityGpgFile)
      .then(_privateKey => new ethers.Wallet(_privateKey))
      .then(signStatusObject(statusObject))
      .then(_signedStatusObject => R.assoc(KEY_STATUS_OBJECT, _signedStatusObject, _state))
      .then(resolve)
      .catch(reject)
  })

module.exports = {
  signStatusObject,
  signStatusObjectAndAddToState,
}
