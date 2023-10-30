const R = require('ramda')
const ethers = require('ethers')
const { db, utils, logic } = require('ptokens-utils')
const { logger } = require('../../get-logger')
const constants = require('ptokens-constants')
const { STATE_DB_ACTORS_PROPAGATED_KEY, ID_ACTORS_PROPAGATED } = require('../../constants')
const {
  ERROR_INVALID_EPOCH,
  ERROR_FAILED_TO_GET_SUPPORTED_CHAIN,
  ERROR_GOVERNANCE_MESSAGE_EMITTER_NOT_FOUND,
} = require('../../errors')
const { ActorsPropagated } = constants.governanceMessageEmitter
const { getSupportedChainsFromState } = require('../get-supported-chains')
const GovernanceMessageEmitterAbi = require('./abi/GovernanceMessageEmitter.json')
const EpochsManagerAbi = require('./abi/EpochsManager.json')

const searchForLogBackwards = R.curry((_provider, _governanceMessageEmitter, _latestBlockNum) =>
  Promise.resolve(R.range(0, 100))
    .then(R.map(R.multiply(10000)))
    .then(async _ranges => {
      for (let i = 1; i < _ranges.length; i++) {
        const fromBlock = _latestBlockNum - _ranges[i]
        const toBlock = _latestBlockNum - _ranges[i - 1]

        const eventName = constants.db.eventNames.ACTORS_PROPAGATED
        const topic =
          _governanceMessageEmitter.filters[eventName].fragment[constants.evm.ethers.TOPIC_HASH]

        logger.info(
          `Looking for latest event '${eventName}' w/ topic '${topic}' from ${fromBlock} to ${toBlock}...`
        )
        const filter = {
          address: _governanceMessageEmitter.address,
          topics: [topic],
          fromBlock,
          toBlock,
        }

        const logs = await _provider.getLogs(filter)

        if (logs.length > 0) {
          const log = logs[0]
          logger.info(`Found ${eventName} @ ${log.transactionHash}`)
          return log
        }

        await logic.sleepForXMilliseconds(200) // Repects rate-limits
      }
    })
)

const checkEpoch = R.curry((_expectedEpoch, _parsedLog) =>
  Promise.resolve(R.path(['args', 'currentEpoch'])).then(
    utils.rejectIfNotEqual(`${ERROR_INVALID_EPOCH}, should be ${_expectedEpoch}`, _expectedEpoch)
  )
)

const getLastActorsPropagatedEvent = R.curry(
  (_provider, _governanceMessageEmitter, _epoch) =>
    logger.info(`Getting latest ActorsPropagated event for epoch ${_epoch}...`) ||
    _provider
      .getBlockNumber()
      .then(searchForLogBackwards(_provider, _governanceMessageEmitter))
      .then(_log => _governanceMessageEmitter.interface.parseLog(_log))
      .then(checkEpoch(_epoch))
      .then(_parsedLog => new ActorsPropagated(_parsedLog))
)

const updateActorsPropagatedEventInStorage = R.curry(
  (_storage, _actorsPropagatedEvent) =>
    db.updateReportById(_storage, { $set: _actorsPropagatedEvent }, ID_ACTORS_PROPAGATED) ||
    logger.info(`Actors for epoch ${_actorsPropagatedEvent.currentEpoch} inserted in memory!`)
)

module.exports.storeActorsForCurrentEpoch = _state =>
  getSupportedChainsFromState(_state)
    .then(R.find(R.propEq('polygon', constants.config.KEY_CHAIN_NAME)))
    .then(utils.rejectIfNil(ERROR_FAILED_TO_GET_SUPPORTED_CHAIN))
    .then(_polygonSupportedChain => {
      const actorsPropagatedStorage = _state[STATE_DB_ACTORS_PROPAGATED_KEY]
      const provider = new ethers.JsonRpcProvider(
        _polygonSupportedChain[constants.config.KEY_PROVIDER_URL]
      )
      const governanceMessageEmitterAddress =
        _polygonSupportedChain[constants.config.KEY_GOVERNANCE_MESSAGE_EMITTER_ADDRESS]
      const epochsManagerAddress =
        _polygonSupportedChain[constants.config.KEY_EPOCHS_MANAGER_ADDRESS]

      if (R.isNil(governanceMessageEmitterAddress))
        return Promise.reject(new Error(ERROR_GOVERNANCE_MESSAGE_EMITTER_NOT_FOUND))

      const governanceMessageEmitter = new ethers.Contract(
        governanceMessageEmitterAddress,
        GovernanceMessageEmitterAbi,
        provider
      )

      const epochsManager = new ethers.Contract(epochsManagerAddress, EpochsManagerAbi, provider)

      return epochsManager
        .currentEpoch()
        .then(getLastActorsPropagatedEvent(provider, governanceMessageEmitter))
        .then(updateActorsPropagatedEventInStorage(actorsPropagatedStorage))
        .then(_ => _state)
    })
