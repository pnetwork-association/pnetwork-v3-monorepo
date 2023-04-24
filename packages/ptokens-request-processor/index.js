#!/usr/bin/env node
const config = require('./config')
const constants = require('ptokens-constants')
const { Command } = require('commander')
const { logger } = require('./lib/get-logger')
const { validation } = require('ptokens-utils')

const { setupExitEventListeners } = require('./lib/setup-exit-listeners')
const { pollForRequestsAndPropose } = require('./lib/interfaces/process-proposal-txs')
const { pollForRequestsAndDismiss } = require('./lib/interfaces/process-dismissal-txs')
const { processFinalTransactions } = require('./lib/interfaces/process-final-txs')
const { getInitialStateFromConfiguration } = require('./lib/populate-state-from-configuration')
const { version } = require('./package')

const program = new Command()

const COMMANDS = {
  PROCESS_FINAL_TRANSACTION: 'processFinalTransactions',
  POLL_FOR_REQUESTS_AND_PROPOSE: 'pollForRequestsAndPropose',
  POLL_FOR_REQUESTS_AND_DISMISS: 'pollForRequestsAndDismiss',
}

const commandToFunctionMapping = {
  [COMMANDS.PROCESS_FINAL_TRANSACTION]: processFinalTransactions,
  [COMMANDS.POLL_FOR_REQUESTS_AND_PROPOSE]: pollForRequestsAndPropose,
  [COMMANDS.POLL_FOR_REQUESTS_AND_DISMISS]: pollForRequestsAndDismiss,
}

const requestProcessor = (_config, _cmd) =>
  logger.info(_config) ||
  setupExitEventListeners()
    .then(_ => validation.validateJson(constants.config.schemas.requestProcessor, _config))
    .then(_ => getInitialStateFromConfiguration(_config))
    .then(commandToFunctionMapping[_cmd])
    .catch(_err => logger.error(_err) || process.exit(1))

const main = () => {
  program
    .name('ptokens-request-processor')
    .description('pTokens Request Processor')
    .version(version)

  program
    .command(COMMANDS.PROCESS_FINAL_TRANSACTION)
    .description('Finalize proposed transactions')
    .action(() => requestProcessor(config, COMMANDS.PROCESS_FINAL_TRANSACTION))

  program
    .command(COMMANDS.POLL_FOR_REQUESTS_AND_PROPOSE)
    .description('Poll for user requests and propose in the destination blockchain')
    .action(() => requestProcessor(config, COMMANDS.POLL_FOR_REQUESTS_AND_PROPOSE))

  program
    .command(COMMANDS.POLL_FOR_REQUESTS_AND_DISMISS)
    .description('Poll for queued requests and dismiss them if invalid')
    .action(() => requestProcessor(config, COMMANDS.POLL_FOR_REQUESTS_AND_DISMISS))

  program.parse(process.argv)
}

main()
