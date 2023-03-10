#!/usr/bin/env node
const config = require('./config')
const { keys, equals } = require('ramda')
const { logger } = require('./lib/get-logger')
// const { validation } = require('ptokens-utils')
// const schemas = require('ptokens-schemas')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { pollForRequests } = require('./lib/interfaces/poll-for-requests')
const {
  maybeProcessFinalTransactions,
} = require('./lib/interfaces/process-final-txs')
const {
  getInitialStateFromConfiguration,
} = require('./lib/populate-state-from-configuration')
// const validateConfig = validation.getValidationFunction(
//   configRequestProcessorSchema
// )

const commandToFunctionMapping = {
  pollForRequests: pollForRequests,
  processFinalTransactions: maybeProcessFinalTransactions,
}

const checkFlowIsValid = _cmd =>
  keys(commandToFunctionMapping).some(equals(_cmd))
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          `Invalid command submitted, they should be [${keys(
            commandToFunctionMapping
          )}]`
        )
      )

const requestProcessor = (_config, _cmd) =>
  logger.info(_config) ||
  setupExitEventListeners()
    // .then(_ => validateConfig(schemas.configurations.requestProcessor, _config))
    .then(_ => checkFlowIsValid(_cmd))
    .then(_ => logger.info(`Valid command selected: ${_cmd}`))
    .then(_ => getInitialStateFromConfiguration(_config))
    .then(commandToFunctionMapping[_cmd])
    .catch(
      _err =>
        logger.error(_err) ||
        // eslint-disable-next-line no-process-exit
        process.exit(1)
    )

requestProcessor(config, process.argv[2])
