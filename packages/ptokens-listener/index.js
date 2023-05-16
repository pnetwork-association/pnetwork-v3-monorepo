#!/usr/bin/env node
const { Command } = require('commander')
const constants = require('ptokens-constants')
const { logger } = require('./lib/get-logger')
const { logger: utilsLogger } = require('ptokens-utils')
const {
  getEventLogsFromTransactionCommand,
  getEventReportsFromTransactionCommand,
  getOperationsByIdCommand,
  listenForEventsCommand,
} = require('./lib/commands')
const { exitCleanly } = require('./lib/setup-exit-listeners')
const config = require('./config')
const { description, version } = require('./package')

const printErrorAndExit = _err => logger.error('Halting due to \n', _err) || exitCleanly(1)

const disableLoggingForCLICommand = _ => {
  logger.level = 'error'
  utilsLogger.logger.level = 'off'
}

const addMainCommand = _program =>
  _program
    .name('ptokens-listener')
    .description(description)
    .version(version)
    .action(_ => listenForEventsCommand(config))

const addGetEventReportsFromTransactionCommand = _program =>
  _program
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
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(config, _hash, _event, _options.save)
    ) && _program

const addGetEventLogsFromTransactionCommand = _program =>
  _program
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
        disableLoggingForCLICommand() || getEventLogsFromTransactionCommand(config, _hash, _event)
    ) && _program

const addGetUserOperationCommand = _program =>
  _program
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
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.evm.events.USER_OPERATION_SIGNATURE,
          _options.save
        )
    ) && _program

const addGetOperationQueuedCommand = _program =>
  _program
    .command('getOperationQueued')
    .description('Get OperationQueued event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getOperationQueued 0x261229b0af24a5caaf24edc96a0e4ccafa801ef873ab4dff2277538232b38e79
`
    )
    .action(
      (_hash, _options) =>
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.evm.events.OPERATION_QUEUED_SIGNATURE,
          _options.save
        )
    ) && _program

const addGetOperationExecutedCommand = _program =>
  _program
    .command('getOperationExecuted')
    .description('Get OperationExecuted event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getOperationExecuted 0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a
`
    )
    .action(
      (_hash, _options) =>
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.evm.events.OPERATION_EXECUTED_SIGNATURE,
          _options.save
        )
    ) && _program

const addGetOperationsCommand = _program =>
  _program
    .command('getOperations')
    .description('Get operations linked to an Operation ID')
    .argument('<operationId>', 'operation ID')
    .argument('<state-manager-address>', 'state manager address')
    .option('--fromBlock <block>', 'fromBlock', parseInt)
    .addHelpText(
      'after',
      `
Example calls:

$ node index.js getOperations 0x46840d7667c567d8ae702801c296d9cb19535d7c77f8e132c79f06c25df79600 0x565033350582f4Ad298fDD8d59b7c36D0cAC1712 --fromBlock 34923840
`
    )
    .action(
      (_operationId, _stateManagerAddress, _options) =>
        disableLoggingForCLICommand() ||
        getOperationsByIdCommand(config, _operationId, _stateManagerAddress, _options.fromBlock)
    ) && _program

const main = () =>
  Promise.resolve(new Command())
    .then(addMainCommand)
    .then(addGetEventReportsFromTransactionCommand)
    .then(addGetEventLogsFromTransactionCommand)
    .then(addGetUserOperationCommand)
    .then(addGetOperationQueuedCommand)
    .then(addGetOperationExecutedCommand)
    .then(addGetOperationsCommand)
    .then(_program => _program.parseAsync(process.argv))
    .catch(printErrorAndExit)
    .then(_ => exitCleanly(0))

main()
