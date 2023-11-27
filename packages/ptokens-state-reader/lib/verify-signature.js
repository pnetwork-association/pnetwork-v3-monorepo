const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')

module.exports.verifySignature = R.curry((_statusObject, _signature) => {
  delete _statusObject[constants.statusObject.KEY_SIGNATURE]
  const actorAddress = _statusObject[constants.statusObject.KEY_SIGNER_ADDRESS]
  const message = utils.sortKeysAlphabetically(_statusObject)
  const address = ethers.verifyMessage(JSON.stringify(message), _signature)
  return R.toLower(address) === R.toLower(actorAddress)
})
