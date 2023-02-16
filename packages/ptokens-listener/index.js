#!/usr/bin/env node
const { logger, shutDownLogging } = require('./lib/get-logger')
const { checkConfiguration } = require('./lib/check-configuration')
const {
  exitCleanly,
  setupExitEventListeners,
} = require('./lib/setup-exit-listeners')
const { listenForEvents } = require('./lib/listener-interface')
const { populateStateFromConfiguration } = require('./lib/configuration')

const printErrorAndExit = _err =>
  logger.error('Halting the server due to \n', _err) ||
  shutDownLogging().then(_ => exitCleanly(1))

const main = () =>
  setupExitEventListeners()
    .then(checkConfiguration)
    .then(populateStateFromConfiguration)
    .then(listenForEvents)
    .catch(printErrorAndExit)

main()
