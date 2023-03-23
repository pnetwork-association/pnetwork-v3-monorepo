const { curry } = require('ramda')

const getEventId = curry((_chainId, _txHash) => `${_chainId}_${_txHash}`)

module.exports = { getEventId }
