const R = require('ramda')
// const ethers = require('ethers')

module.exports.verifySignature = R.curry(
  (_address, _message) => true
  // TODO
  // const anAddress = ethers.utils.verifyMessage(_message)
  // return anAddress === _address
)
