#!/usr/bin/env node
const config = require('./config')
const { keys, equals } = require('ramda')
const { logger } = require('./lib/get-logger')
const { validation } = require('ptokens-utils')
const configSchema = require('./lib/schemas/config-schema')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { pollForRequests } = require('./lib/interfaces/poll-for-requests')
const {
  maybeProcessFinalTransactions,
} = require('./lib/interfaces/process-final-txs')

const validateConfig = validation.getValidationFunction(configSchema)

const getInitialStateFromConfiguration = _config => Promise.resolve({})

const parseArg = {
  'pollForRequests': pollForRequests,
  'processFinalTransactions': maybeProcessFinalTransactions,
}

const checkFlowIsValid = _cmd => keys(parseArg).some(equals(_cmd))

const requestProcessor = (_config, _cmd) =>
  setupExitEventListeners()
    .then(validateConfig(_config))
    .then(_ => checkFlowIsValid(_cmd))
    .then(_ => logger.info(`Valid flow selected: ${_cmd}`))
    .then(_ => getInitialStateFromConfiguration(_config))
    .then(parseArg[_cmd])
    .catch(
      _err =>
        logger.error(_err) ||
        // eslint-disable-next-line no-process-exit
        process.exit(1)
    )

requestProcessor(config, process.argv[2])
