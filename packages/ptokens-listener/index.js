#!/usr/bin/env node
const { logger, shutDownLogging } = require('./lib/get-logger')
const { checkConfiguration } = require('./lib/check-configuration')
const {
  exitCleanly,
  setupExitEventListeners,
} = require('./lib/setup-exit-listeners')
const { listenForEvents } = require('./lib/listener-interface')
const {
  getInitialStateFromConfiguration,
} = require('./lib/populate-state-from-configuration')
const config = require('./config')

const printErrorAndExit = _err =>
  logger.error('Halting the server due to \n', _err) ||
  shutDownLogging().then(_ => exitCleanly(1))

const main = _config =>
  setupExitEventListeners()
    .then(_ => checkConfiguration(_config))
    .then(getInitialStateFromConfiguration)
    .then(listenForEvents)
    .catch(printErrorAndExit)

main(config)
