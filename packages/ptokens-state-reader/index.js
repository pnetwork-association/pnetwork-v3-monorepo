#!/usr/bin/env node
const R = require('ramda')
const config = require('./config')
const constants = require('ptokens-constants')
const { validation } = require('ptokens-utils')
const {
  storeActorsForCurrentEpoch,
  estimateBlockTimePerChainAndAddToState,
  getChallengerLockAmountsAndAddToState,
} = require('./lib/chains').evm
// eslint-disable-next-line no-unused-vars
const Memory = require('./lib/ram/Memory')
const { maybeSlashInactiveActors } = require('./lib/slash-inactive-actors')
const { getSyncStateAndUpdateTimestamps } = require('./lib/get-sync-state')
const { maybeChallengeInactiveActors } = require('./lib/challenge-actors')
const { STATE_MEMORY_KEY } = require('./lib/constants')

const { setupExitEventListeners } = require('./lib/setup-exit-listeners')

const initializeStateFromConfiguration = _config =>
  Promise.resolve(validation.validateJson(constants.config.schemas.stateReader, _config)).then(
    _ => _config
  )

const addMemoryToState = _state => R.assoc(STATE_MEMORY_KEY, Memory, _state)

const main = () =>
  setupExitEventListeners()
    .then(_ => initializeStateFromConfiguration(config))
    .then(addMemoryToState)
    .then(estimateBlockTimePerChainAndAddToState)
    .then(storeActorsForCurrentEpoch)
    .then(getChallengerLockAmountsAndAddToState)
    .then(_state =>
      Promise.all([
        getSyncStateAndUpdateTimestamps(_state),
        maybeChallengeInactiveActors(_state),
        maybeSlashInactiveActors(_state),
      ])
    )

main()
