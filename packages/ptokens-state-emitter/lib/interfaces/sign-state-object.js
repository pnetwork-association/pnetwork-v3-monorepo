const R = require('ramda')
const { ethers } = require('ethers')
const { utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const { STATE_STATUS_OBJ_KEY } = require('../constants')

const signStatusObject = R.curry((_obj, _wallet) =>
  Promise.resolve(utils.sortKeysAlphabetically(_obj))
    .then(JSON.stringify)
    .then(_message => _wallet.signMessage(_message))
    .then(_signature => R.assoc(constants.statusObject.KEY_SIGNATURE, _signature, _obj))
)

const signStatusObjectAndAddToState = _state =>
  new Promise((resolve, reject) => {
    const statusObject = _state[STATE_STATUS_OBJ_KEY]
    const identityGpgFile = _state[constants.config.KEY_IDENTITY_GPG]
    return utils
      .readIdentityFile(identityGpgFile)
      .then(_privateKey => new ethers.Wallet(_privateKey))
      .then(signStatusObject(statusObject))
      .then(_signedStatusObject => R.assoc(STATE_STATUS_OBJ_KEY, _signedStatusObject, _state))
      .then(resolve)
      .catch(reject)
  })

module.exports = {
  signStatusObject,
  signStatusObjectAndAddToState,
}
