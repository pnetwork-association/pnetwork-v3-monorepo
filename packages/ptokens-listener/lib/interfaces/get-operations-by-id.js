const { constants: ptokensUtilsConstants, utils } = require('ptokens-utils')
const { getEvmOperationsById } = require('../evm/evm-get-operations-by-id')
const { logger } = require('../get-logger')

const getEosioInfoById = () => Promise.reject(new Error('To be implemented!'))
const getAlgorandInfoById = () => Promise.reject(new Error('To be implemented!'))
const getUtxoInfoById = () => Promise.reject(new Error('To be implemented!'))

const getImplementationForBlockchainType = _blockchainType => {
  logger.info(`Listen to ${_blockchainType} events`)
  switch (_blockchainType) {
    case ptokensUtilsConstants.blockchainType.EVM:
      return getEvmOperationsById
    case ptokensUtilsConstants.blockchainType.EOSIO:
      return getEosioInfoById
    case ptokensUtilsConstants.blockchainType.UTXO:
      return getUtxoInfoById
    case ptokensUtilsConstants.blockchainType.ALGORAND:
      return getAlgorandInfoById
    default:
      return () => Promise.reject(new Error('Invalid blockchain type'))
  }
}

const getOperationsById = (_providerUrl, _networkId, _id, _stateManagerAddress, _fromBlock) =>
  utils
    .getBlockchainTypeFromChainId(_networkId)
    .then(getImplementationForBlockchainType)
    .then(_implementation =>
      _implementation(_providerUrl, _networkId, _id, _stateManagerAddress, _fromBlock)
    )

module.exports = { getOperationsById }
