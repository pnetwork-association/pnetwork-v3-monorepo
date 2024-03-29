const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const { getEvmOperationsById } = require('../evm/evm-get-operations-by-id')
const { logger } = require('../get-logger')

const getEosioInfoById = () => Promise.reject(new Error('To be implemented!'))
const getAlgorandInfoById = () => Promise.reject(new Error('To be implemented!'))
const getUtxoInfoById = () => Promise.reject(new Error('To be implemented!'))

const getImplementationForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case constants.blockchainType.EVM:
      return getEvmOperationsById
    case constants.blockchainType.EOSIO:
      return getEosioInfoById
    case constants.blockchainType.UTXO:
      return getUtxoInfoById
    case constants.blockchainType.ALGORAND:
      return getAlgorandInfoById
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getOperationsById = (_providerUrl, _networkId, _id, _hubAddress, _fromBlock) =>
  utils
    .getBlockchainTypeFromChainId(_networkId)
    .then(getImplementationForBlockchainType)
    .then(_implementation =>
      _implementation(_providerUrl, _networkId, _id, _hubAddress, _fromBlock)
    )

module.exports = { getOperationsById }
