#!/usr/bin/env node
const config = require('./config')
const constants = require('ptokens-constants')
const { validation } = require('ptokens-utils')
const {
  storeActorsForCurrentEpoch,
  estimateBlockTimePerChainAndAddToState,
  getChallengerLockAmountsAndAddToState,
  getChallengeDurationsAndAddToState,
} = require('./lib/chains').evm
const { maybeSlashInactiveActors } = require('./lib/slash-inactive-actors')
const { getSyncStateAndUpdateTimestamps } = require('./lib/get-sync-state')
const { maybeChallengeInactiveActors } = require('./lib/challenge-actors')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { addRequiredStorageToState } = require('./lib/add-required-storage')
const { lowerCaseIgnoredActorsAndAddToState } = require('./lib/lower-case-ignored-actors')
const { computeThresholdsFromBlockTimesAndAddToState } = require('./lib/compute-thresholds')
const { computeMerkleProofsForEachActorAndAddToState } = require('./lib/compute-merkle-proofs')

const initializeStateFromConfiguration = _config =>
  Promise.resolve(validation.validateJson(constants.config.schemas.stateReader, _config)).then(
    _ => _config
  )

const main = () =>
  initializeStateFromConfiguration(config)
    .then(setupExitEventListeners)
    .then(addRequiredStorageToState)
    .then(lowerCaseIgnoredActorsAndAddToState)
    .then(estimateBlockTimePerChainAndAddToState)
    .then(computeThresholdsFromBlockTimesAndAddToState)
    .then(storeActorsForCurrentEpoch)
    .then(computeMerkleProofsForEachActorAndAddToState)
    .then(getChallengerLockAmountsAndAddToState)
    .then(getChallengeDurationsAndAddToState)
    .then(_state =>
      Promise.all([
        getSyncStateAndUpdateTimestamps(_state),
        maybeChallengeInactiveActors(_state),
        maybeSlashInactiveActors(_state),
      ])
    )

main()
