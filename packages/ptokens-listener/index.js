#!/usr/bin/env node
const { Command } = require('commander')
const program = new Command()
const constants = require('ptokens-constants')
const { logger } = require('./lib/get-logger')
const { logger: utilsLogger } = require('ptokens-utils')
const {
  getEventLogsFromTransactionCommand,
  getEventReportsFromTransactionCommand,
  listenForEventsCommand,
} = require('./lib/commands')
const { exitCleanly } = require('./lib/setup-exit-listeners')
const config = require('./config')
const { description, version } = require('./package')

const printErrorAndExit = _err =>
  logger.error('Halting due to \n', _err) || exitCleanly(1)

const setLoggersLevelToError = _ => {
  logger.level = 'error'
  utilsLogger.logger.level = 'error'
}

const main = async () => {
  program
    .name('ptokens-listener')
    .description(description)
    .version(version)
    .action(_ => listenForEventsCommand(config))

  program
    .command('getEventReportsFromTransaction')
    .description('Get event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .argument('<event-signature>', 'event signature')
    .option('-s, --save', 'save report into database')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getEventReportsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3 'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
`
    )
    .action(
      (_hash, _event, _options) =>
        setLoggersLevelToError() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          _event,
          _options.save
        )
    )

  program
    .command('getEventLogsFromTransaction')
    .description('Get event logs for a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .argument('[event-signature]', 'event signature', null)
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getEventLogsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3

$ node index.js getEventLogsFromTransaction 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3 'UserOperation(uint256 nonce,string destinationAccount,bytes4 destinationNetworkId,string underlyingAssetName,string underlyingAssetSymbol,uint256 underlyingAssetDecimals,address underlyingAssetTokenAddress,bytes4 underlyingAssetNetworkId,address assetTokenAddress,uint256 assetAmount,bytes userData,bytes32 optionsMask)'
`
    )
    .action(
      (_hash, _event) =>
        setLoggersLevelToError() ||
        getEventLogsFromTransactionCommand(config, _hash, _event)
    )

  program
    .command('getUserOperation')
    .description('Get UserOperation event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getUserOperation 0x2b948164aad1517cdcd11e22c3f96d58b146fdee233ab74e46cb038afcc273e3
`
    )
    .action(
      (_hash, _options) =>
        setLoggersLevelToError() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.events.USER_OPERATION_EVENT_SIGNATURE,
          _options.save
        )
    )

  await program.parseAsync(process.argv).catch(printErrorAndExit)
  await exitCleanly(0)
}

main()
