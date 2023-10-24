#!/usr/bin/env node
const config = require('./config')
const constants = require('ptokens-constants')
const { validation } = require('ptokens-utils')
const { logger } = require('./lib/get-logger')
const { estimateBlockTimePerChainAndAddToState, estimatePerChainThresholdsAndAddToState } =
  require('./lib/chains').evm

const { setupExitEventListeners } = require('./lib/setup-exit-listeners')

const initializeStateFromConfiguration = _config =>
  Promise.resolve(validation.validateJson(constants.config.schemas.stateReader, _config)).then(
    _ => _config
  )

const main = () =>
  setupExitEventListeners()
    .then(_ => initializeStateFromConfiguration(config))
    .then(estimateBlockTimePerChainAndAddToState)
    .then(estimatePerChainThresholdsAndAddToState)
    .then(_x => logger.info(_x))
// .then(setupInMemoryDbAndAddToState)
// .then(getActorsForCurrentEpochAndAddToState)
// .then(_state => Promise.all([
//   getSyncStateAndUpdateTimestamps(_state),
//   maybeChallengeInactiveActors(_state),
//   maybeSlashInactiveActors(_state)
// ]))

main()
