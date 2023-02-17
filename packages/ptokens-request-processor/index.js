#!/usr/bin/env node
const config = require('./config')
const configSchema = require('./lib/schemas/config-schema')
const { keys, equals } = require('ramda')
const { validation } = require('ptokens-utils')
const { pollForRequests } = require('./lib/poll-for-requests')
const { maybeProcessFinalTransactions } = require('./lib/process-final-txs')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')

const validateConfig = validation.getValidationFunction(configSchema)

const getInitialStateFromConfiguration = _config => Promise.resolve({})

const proposalFlow = _config =>
  getInitialStateFromConfiguration(_config).then(pollForRequests)

const finalTxsFlow = _config =>
  getInitialStateFromConfiguration(_config).then(maybeProcessFinalTransactions)

const flowsMapping = {
  'send-proposals': proposalFlow,
  'send-final-transactions': finalTxsFlow,
}

const checkFlowIsValid = _flow => keys(flowsMapping).some(equals(_flow))

const requestProcessor = (_config, _flow) =>
  setupExitEventListeners()
    .then(validateConfig(_config))
    .then(_ => checkFlowIsValid(_flow))
    .then(_ => flowsMapping[_flow](_config))
    .catch(_err => logger.error(_err) || process.exit(1))

requestProcessor(config, 'send-final-transactions')
