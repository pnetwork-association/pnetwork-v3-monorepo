#!/usr/bin/env node
const { Command } = require('commander')
const program = new Command()
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { logger } = require('./lib/get-logger')
const { checkConfiguration } = require('./lib/check-configuration')
const {
  exitCleanly,
  setupExitEventListeners,
} = require('./lib/setup-exit-listeners')
const { listenForEvents } = require('./lib/interfaces/listener')
const {
  getEventReportsFromTransaction,
} = require('./lib/interfaces/get-event-reports-from-transaction')
const {
  getEventLogsFromTransaction,
} = require('./lib/interfaces/get-event-logs-from-transaction')
const {
  getInitialStateFromConfiguration,
} = require('./lib/populate-state-from-configuration')
const config = require('./config')
const { version } = require('./package')

const printErrorAndExit = _err =>
  logger.error('Halting the listener due to \n', _err) || exitCleanly(1)

const listen = _config =>
  setupExitEventListeners()
    .then(_ => checkConfiguration(_config))
    .then(getInitialStateFromConfiguration)
    .then(listenForEvents)
    .catch(printErrorAndExit)

const getEventLogsFromTransactionWrapper = (_config, _hash, _eventName) =>
  checkConfiguration(_config)
    .then(_config =>
      getEventLogsFromTransaction(
        _config[schemas.constants.SCHEMA_PROVIDER_URL_KEY],
        _config[schemas.constants.SCHEMA_CHAIN_ID_KEY],
        _hash,
        _eventName
      )
    )
    .catch(printErrorAndExit)

const getEventReportsFromTransactionWrapper = (_config, _hash, _eventName) =>
  checkConfiguration(_config)
    .then(_config =>
      getEventReportsFromTransaction(
        _config[schemas.constants.SCHEMA_PROVIDER_URL_KEY],
        _config[schemas.constants.SCHEMA_CHAIN_ID_KEY],
        _hash,
        _eventName
      )
    )
    .catch(printErrorAndExit)

const main = async () => {
  program
    .name('ptokens-listener')
    .description('pTokens Listener')
    .version(version)
    .action(_ => listen(config))

  program
    .command('getEventReportsFromTransaction')
    .description('Get event reports in a specific transaction')
    .argument('<tx–hash>', 'Transaction hash')
    .argument('<event-signature>', 'Event signature')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getEventReportsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3 'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
`
    )
    .action(async (_hash, _event) => {
      logger.level = 'error'
      const reports = await getEventReportsFromTransactionWrapper(
        config,
        _hash,
        _event
      )
      // eslint-disable-next-line no-console
      reports && reports.length && console.info(JSON.stringify(reports))
    })

  program
    .command('getEventLogsFromTransaction')
    .description('Get event logs for a specific transaction')
    .argument('<tx–hash>', 'Transaction hash')
    .argument('[event-signature]', 'Event signature', null)
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getEventLogsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3

$ node index.js getEventLogsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3 'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
`
    )
    .action(async (_hash, _event) => {
      logger.level = 'error'
      const logs = await getEventLogsFromTransactionWrapper(
        config,
        _hash,
        _event
      )
      // eslint-disable-next-line no-console
      logs && logs.length && console.info(JSON.stringify(logs))
    })

  program
    .command('getUserOperation')
    .description('Get UserOperation event reports in a specific transaction')
    .argument('<tx–hash>', 'Transaction hash')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getUserOperation 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3
`
    )
    .action(async _hash => {
      logger.level = 'error'
      const reports = await getEventReportsFromTransactionWrapper(
        config,
        _hash,
        constants.events.USER_OPERATION_EVENT_SIGNATURE
      )
      // eslint-disable-next-line no-console
      reports && reports.length && console.info(JSON.stringify(reports))
    })
  await program.parseAsync(process.argv)
}

main()
