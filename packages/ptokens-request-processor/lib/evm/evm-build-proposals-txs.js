const { logger } = require('../get-logger')

const evmMaybeBuildProposalsTxsAndPutInState = _state => {
  logger.info('maybeBuildProposalsTxsAndPutInState EVM')
  return Promise.resolve(_state)
}

module.exports = {
  evmMaybeBuildProposalsTxsAndPutInState,
}
