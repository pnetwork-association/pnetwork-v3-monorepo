const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { logic } = require('ptokens-utils')
const { getSupportedChainsFromState } = require('../get-supported-chains')
const { STATE_AVG_BLOCK_TIME_KEY, STATE_BLOCK_TIMES_ESTIMATIONS_KEY } = require('../../constants')

// [t0, t1, t2]
// t1-t0/3 + t2-t1/3
const computeTimestampsAvg = _timestamps =>
  Promise.all(
    _timestamps
      .slice(0, _timestamps.length - 1)
      .map((_current, _index) => R.divide(_timestamps[_index + 1] - _current, _timestamps.length))
  )
    .then(R.sum)
    .then(Math.ceil)

const getBlockTimestamps = R.curry((_numberOfSamples, _provider) =>
  Promise.all([_provider.getBlockNumber(), R.range(0, _numberOfSamples)]).then(
    ([_startingBlock, _offsets]) =>
      Promise.all(R.reverse(_offsets).map(_offset => _provider.getBlock(_startingBlock - _offset)))
  )
)

const getAvgBlockTime = _supportedChain =>
  logger.info(
    `Computing avg block time for chain ${_supportedChain[constants.config.KEY_CHAIN_NAME]}...`
  ) ||
  Promise.resolve(new ethers.JsonRpcProvider(_supportedChain[constants.config.KEY_PROVIDER_URL]))
    .then(getBlockTimestamps(3))
    .then(R.map(R.prop(constants.evm.ethers.KEY_BLOCK_TIMESTAMP)))
    .then(computeTimestampsAvg)

const getBlockTimesEstimationObject = _supportedChain =>
  getAvgBlockTime(_supportedChain).then(
    _avgBlockTime =>
      logger.info(
        `Avg block time for ${_supportedChain[constants.config.KEY_CHAIN_NAME]}: ${_avgBlockTime}s`
      ) || {
        [constants.config.KEY_NETWORK_ID]: _supportedChain[constants.config.KEY_NETWORK_ID],
        [STATE_AVG_BLOCK_TIME_KEY]: _avgBlockTime,
      }
  )

const createBlockEstimationObjectFromEstimationsList = _array =>
  Promise.resolve(
    _array.reduce(
      (_blockEstimationObject, _element) => ({
        ..._blockEstimationObject,
        [_element[constants.config.KEY_NETWORK_ID]]: _element[STATE_AVG_BLOCK_TIME_KEY],
      }),
      {}
    )
  )

const addEstimationsToState = R.curry(
  (_state, _estimationsObject) =>
    logger.info('Adding avg block times estimations to state...') ||
    R.assoc(STATE_BLOCK_TIMES_ESTIMATIONS_KEY, _estimationsObject, _state)
)

module.exports.estimateBlockTimePerChainAndAddToState = _state =>
  getSupportedChainsFromState(_state)
    .then(logic.mapAll(getBlockTimesEstimationObject))
    .then(createBlockEstimationObjectFromEstimationsList)
    .then(addEstimationsToState(_state))
