const { logger } = require('../get-logger')

const maybeBuildProposalsTxsAndPutInState = _state => {
  logger.info('maybeBuildProposalsTxsAndPutInState EVM')
  return Promise.resolve(_state)
}

module.exports = {
  maybeBuildProposalsTxsAndPutInState,
}
