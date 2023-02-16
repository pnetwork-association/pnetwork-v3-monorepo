#!/usr/bin/env node
const config = require('./config')
const configSchema = require('./lib/schemas/config-schema')
const { validation } = require('ptokens-utils')
const { pollForRequests } = require('./lib/poll-for-requests')
const { setupExitEventListeners } = require('./lib/setup-exit-listeners')

const validateConfig = validation.getValidationFunction(configSchema)

const getInitialStateFromConfiguration = _config => Promise.resolve({})

const main = _config =>
  setupExitEventListeners()
    .then(validateConfig(_config))
    .then(getInitialStateFromConfiguration(_config))
    .then(pollForRequests)

main(config)
