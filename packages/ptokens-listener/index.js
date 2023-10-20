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

const GET_OPERATIONS_CMD = 'getOperations'
const GET_USER_OPERATION_CMD = 'getUserOperation'
const GET_OPERATION_QUEUED_CMD = 'getOperationQueued'
const GET_CHALLENGE_PENDING_CMD = 'getChallengePending'
const GET_OPERATION_EXECUTED_CMD = 'getOperationExecuted'
const GET_ACTORS_PROPAGATED_CMD = 'getActorsPropagated'
const GET_EVENT_LOGS_FROM_TRANSACTION_CMD = 'getEventsLogsFromTransaction'
const GET_EVENT_REPORTS_FROM_TRANSACTION_CMD = 'getEventReportsFromTransaction'

const EXAMPLE_CALLS = `
Example calls:

`

const GET_EVENT_REPORTS_FROM_TRANSACTION_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_EVENT_REPORTS_FROM_TRANSACTION_CMD} 0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f 'UserOperation(uint256 nonce, string destinationAccount, bytes4 destinationNetworkId, string underlyingAssetName, string underlyingAssetSymbol, uint256 underlyingAssetDecimals, address underlyingAssetTokenAddress, bytes4 underlyingAssetNetworkId, address assetTokenAddress, uint256 assetAmount, address protocolFeeAssetTokenAddress, uint256 userDataProtocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, bytes4 forwardDestinationNetworkId, bytes userData, bytes32 optionsMask)'
`

const GET_EVENT_LOGS_FROM_TRANSACTION_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_EVENT_LOGS_FROM_TRANSACTION_CMD} 0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f

$ node index.js ${GET_EVENT_LOGS_FROM_TRANSACTION_CMD} 0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f 'UserOperation(uint256 nonce, string destinationAccount, bytes4 destinationNetworkId, string underlyingAssetName, string underlyingAssetSymbol, uint256 underlyingAssetDecimals, address underlyingAssetTokenAddress, bytes4 underlyingAssetNetworkId, address assetTokenAddress, uint256 assetAmount, address protocolFeeAssetTokenAddress, uint256 userDataProtocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, bytes4 forwardDestinationNetworkId, bytes userData, bytes32 optionsMask)'
`

const GET_ACTORS_PROPAGATED_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_ACTORS_PROPAGATED_CMD} 0xFf310f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f
`

const GET_CHALLENGE_PENDING_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_CHALLENGE_PENDING_CMD} 0xFf310f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f
`

const GET_USER_OPERATION_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_USER_OPERATION_CMD} 0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f
`

const GET_OPERATION_QUEUED_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_OPERATION_QUEUED_CMD} 0x261229b0af24a5caaf24edc96a0e4ccafa801ef873ab4dff2277538232b38e79
`

const GET_OPERATION_EXECUTED_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_OPERATION_EXECUTED_CMD} 0x1091be7256f91c7025906b4cd82332e3b7d671c8ef60df08c14dc06fa11cf49a
`

const GET_OPERATIONS_HELP_MESSAGE =
  EXAMPLE_CALLS +
  `$ node index.js ${GET_OPERATIONS_CMD} 0x46840d7667c567d8ae702801c296d9cb19535d7c77f8e132c79f06c25df79600 0x565033350582f4Ad298fDD8d59b7c36D0cAC1712 --fromBlock 34923840
`

const addMainCommand = _program =>
  _program
    .name('ptokens-listener')
    .description(description)
    .version(version)
    .action(_ => listenForEventsCommand(config))

const addGetEventReportsFromTransactionCommand = _program =>
  _program
    .command(GET_EVENT_REPORTS_FROM_TRANSACTION_CMD)
    .description('Get event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .argument('<event-signature>', 'event signature')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_EVENT_REPORTS_FROM_TRANSACTION_HELP_MESSAGE)
    .action(
      (_hash, _event, _options) =>
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(config, _hash, _event, _options.save)
    ) && _program

const addGetEventLogsFromTransactionCommand = _program =>
  _program
    .command(GET_EVENT_LOGS_FROM_TRANSACTION_CMD)
    .description('Get event logs for a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .argument('[event-signature]', 'event signature', null)
    .addHelpText('after', GET_EVENT_LOGS_FROM_TRANSACTION_HELP_MESSAGE)
    .action(
      (_hash, _event) =>
        disableLoggingForCLICommand() || getEventLogsFromTransactionCommand(config, _hash, _event)
    ) && _program

const addGetUserOperationCommand = _program =>
  _program
    .command(GET_USER_OPERATION_CMD)
    .description('Get UserOperation event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_USER_OPERATION_HELP_MESSAGE)
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
    .command(GET_OPERATION_QUEUED_CMD)
    .description('Get OperationQueued event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_OPERATION_QUEUED_HELP_MESSAGE)
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
    .command(GET_OPERATION_EXECUTED_CMD)
    .description('Get OperationExecuted event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_OPERATION_EXECUTED_HELP_MESSAGE)
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

const addGetChallengePendingCommand = _program =>
  _program
    .command(GET_CHALLENGE_PENDING_CMD)
    .description('Get ChallengePending event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_CHALLENGE_PENDING_HELP_MESSAGE)
    .action(
      (_hash, _options) =>
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.evm.events.CHALLENGE_PENDING_SIGNATURE,
          _options.save
        )
    ) && _program

const addGetActorsPropagatedCommand = _program =>
  _program
    .command(GET_ACTORS_PROPAGATED_CMD)
    .description('Get the ActorsPropagated event reports in a specific transaction')
    .argument('<tx–hash>', 'transaction hash')
    .option('-s, --save', 'save report into database')
    .addHelpText('after', GET_ACTORS_PROPAGATED_HELP_MESSAGE)
    .action(
      (_hash, _options) =>
        disableLoggingForCLICommand() ||
        getEventReportsFromTransactionCommand(
          config,
          _hash,
          constants.evm.events.ACTORS_PROPAGATED_SIGNATURE,
          _options.save
        )
    ) && _program

const addGetOperationsCommand = _program =>
  _program
    .command(GET_OPERATIONS_CMD)
    .description('Get operations linked to an Operation ID')
    .argument('<operationId>', 'operation ID')
    .argument('<state-manager-address>', 'state manager address')
    .option('--fromBlock <block>', 'fromBlock', parseInt)
    .addHelpText('after', GET_OPERATIONS_HELP_MESSAGE)
    .action(
      (_operationId, _hubAddress, _options) =>
        disableLoggingForCLICommand() ||
        getOperationsByIdCommand(config, _operationId, _hubAddress, _options.fromBlock)
    ) && _program

const main = () =>
  Promise.resolve(new Command())
    .then(addMainCommand)
    .then(addGetEventReportsFromTransactionCommand)
    .then(addGetEventLogsFromTransactionCommand)
    .then(addGetUserOperationCommand)
    .then(addGetOperationQueuedCommand)
    .then(addGetOperationExecutedCommand)
    .then(addGetActorsPropagatedCommand)
    .then(addGetOperationsCommand)
    .then(addGetChallengePendingCommand)
    .then(_program => _program.parseAsync(process.argv))
    .catch(printErrorAndExit)
    .then(_ => exitCleanly(0))

main()
