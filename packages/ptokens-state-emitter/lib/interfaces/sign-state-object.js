const R = require('ramda')
const { utils } = require('ptokens-utils')

const signWithWallet = R.curry((_wallet, _message) => _wallet.signMessage(_message))

const KEY_SIGNATURE = 'signature' // TODO: factor out into schema
const KEY_SIGNER_ADDRESS = 'signerAddress'
const signStateObject = R.curry((_wallet, _obj) =>
  Promise.resolve(utils.sortKeysAlphabetically(_obj))
    .then(JSON.stringify)
    .then(signWithWallet(_wallet))
    .then(_signature => R.assoc(KEY_SIGNATURE, _signature, _obj))
)

module.exports = {
  KEY_SIGNATURE,
  KEY_SIGNER_ADDRESS,
  signStateObject,
}
