const R = require('ramda')
const ethers = require('ethers')
const constants = require('ptokens-constants')
const { logger } = require('../../get-logger')
const { logic } = require('ptokens-utils')
const { getSupportedChainsFromState } = require('../get-supported-chains')
const { STATE_AVG_BLOCK_TIME_KEY, STATE_BLOCK_TIMES_ESTIMATIONS_KEY } = require('../../constants')

// [t0, t1, t2]
// (t1 - t0) + (t2 - t1) / 2
// (t2 - t0) / 2
const computeTimestampsAvg = _timestamps =>
  Promise.resolve(_timestamps.sort())
    .then(_sorted => [_sorted[0], _sorted[_sorted.length - 1]])
    .then(([_t0, _tEnd]) => (_tEnd - _t0) / (_timestamps.length - 1))
    .then(Math.ceil)

const getBlockTimestamps = R.curry((_numberOfSamples, _provider) =>
  Promise.all([_provider.getBlockNumber(), R.range(0, _numberOfSamples)]).then(
    ([_startingBlock, _offsets]) =>
      Promise.all(R.reverse(_offsets).map(_offset => _provider.getBlock(_startingBlock - _offset)))
  )
)

const getAvgBlockTime = _supportedChain =>
  Promise.resolve(new ethers.JsonRpcProvider(_supportedChain[constants.config.KEY_PROVIDER_URL]))
    .then(getBlockTimestamps(3))
    .then(R.map(R.prop(constants.evm.ethers.KEY_BLOCK_TIMESTAMP)))
    .then(computeTimestampsAvg)

const getBlockTimesEstimationObject = _supportedChain =>
  getAvgBlockTime(_supportedChain)
    .then(_avgBlockTime =>
      Promise.all([
        _avgBlockTime,
        _supportedChain[constants.config.KEY_CHAIN_NAME],
        _supportedChain[constants.config.KEY_NETWORK_ID],
      ])
    )
    .then(
      ([_avgBlockTime, _chainName, _networkId]) =>
        logger.info(`  ${_chainName}: ${_avgBlockTime}s`) || {
          [constants.config.KEY_NETWORK_ID]: _networkId,
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
    .then(
      _supportedChains =>
        logger.info('Getting avg block times:') ||
        logic.mapAll(getBlockTimesEstimationObject, _supportedChains)
    )
    .then(createBlockEstimationObjectFromEstimationsList)
    .then(addEstimationsToState(_state))
