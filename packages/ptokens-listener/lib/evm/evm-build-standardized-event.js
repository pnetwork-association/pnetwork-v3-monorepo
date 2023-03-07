const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { isNil, curry, assoc } = require('ramda')
const { constants: schemasConstants } = require('ptokens-schemas')

const addOriginatingChainId = curry(
  (_defaultChainId, _eventLog, _standardEvent) =>
    new Promise((resolve, reject) => {
      const originChainId =
        _eventLog._originChainId || _eventLog.originChainId || _defaultChainId

      if (isNil(originChainId))
        return reject(new Error('Invalid default origin chain id'))

      // TODO: validate origin chain id

      logger.debug(`Adding origin chain id '${originChainId}'to event`)

      return resolve(
        assoc(
          schemasConstants.SCHEMA_ORIGINATING_CHAIN_ID_KEY,
          originChainId,
          _standardEvent
        )
      )
    })
)

const maybeAddAmount = curry(
  (_eventLog, _standardEvent) =>
    new Promise((resolve, _) => {
      const amount = _eventLog.value || _eventLog._tokenAmount
      const amountStr = utils.isNotNil(amount) ? amount.toString() : null

      if (isNil(amountStr))
        return (
          logger.debug('No amount to add to event') || resolve(_standardEvent)
        )

      logger.debug(`Adding ${amountStr} to event`)

      return resolve(
        assoc(schemasConstants.SCHEMA_AMOUNT_KEY, amountStr, _standardEvent)
      )
    })
)

const maybeAddDestinationAddress = curry(
  (_eventLog, _standardEvent) =>
    new Promise((resolve, _) => {
      const destinationAddress =
        _eventLog._destinationAddress || _eventLog.underlyingAssetRecipient

      if (isNil(destinationAddress)) {
        return (
          logger.debug('No destination address to add to event') ||
          resolve(_standardEvent)
        )
      }

      logger.debug(`Adding ${destinationAddress} to event`)

      return resolve(
        assoc(
          schemasConstants.SCHEMA_DESTINATION_ADDRESS_KEY,
          destinationAddress,
          _standardEvent
        )
      )
    })
)

const maybeAddDestinationChainId = curry(
  (_eventLog, _standardEvent) =>
    new Promise((resolve, _) => {
      const destinationChainId =
        _eventLog.destinationChainId || _eventLog._destinationChainId

      if (isNil(destinationChainId)) {
        return (
          logger.debug('No destination chain id to add to event') ||
          resolve(_standardEvent)
        )
      }

      logger.debug(`Adding ${destinationChainId} to event`)

      return resolve(
        assoc(
          schemasConstants.SCHEMA_DESTINATION_CHAIN_ID_KEY,
          destinationChainId,
          _standardEvent
        )
      )
    })
)

const maybeAddUserData = curry((_eventLog, _standardEvent) =>
  Promise.resolve(
    utils.isNotNil(_eventLog.userData) && _eventLog.userData !== '0x'
      ? assoc(
          schemasConstants.SCHEMA_USER_DATA_KEY,
          _eventLog.userData,
          _standardEvent
        )
      : logger.debug('No user data to add to event') || _standardEvent
  )
)
const maybeAddTokenAddress = curry((_eventLog, _standardEvent) =>
  Promise.resolve(
    utils.isNotNil(_eventLog._tokenAddress)
      ? assoc(
          schemasConstants.SCHEMA_TOKEN_ADDRESS_KEY,
          _eventLog._tokenAddress,
          _standardEvent
        )
      : logger.debug('No token address to add to event') || _standardEvent
  )
)

/**
 * Build an event based on the pNetwork schema from
 * an EVM one. The expected log is of the form
 *
 * {
 *    transactionIndex: 47,
 *    blockNumber: 16575660,
 *    transactionHash: '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
 *    address: '0x62199B909FB8B8cf870f97BEf2cE6783493c4908',
 *    topics: [
 *      '0xdd56da0e6e7b301867b3632876d707f60c7cbf4b06f9ae191c67ea016cc5bf31',
 *      '0x000000000000000000000000db786f073095c3915749114e227a27a81ef03a15'
 *    ],
 *    data: '0x00000...',
 *    logIndex: 106,
 *    blockHash: '0x0fc80f64b06f1de7e0025968e1acea1c8098e99da995654bc8f28b86a5efc8be'
 * }
 *
 * @param  {string} _chainId,  [metadata chain id]
 * @param  {string} _parsedLog [on chain parsed log]
 * @return {object}            [the standard event object]
 */
const buildStandardizedEventFromEvmEvent = curry(
  (_chainId, _parsedLog) =>
    Promise.resolve({
      [schemasConstants.SCHEMA_EVENT_NAME_KEY]: _parsedLog.name,
      [schemasConstants.SCHEMA_STATUS_KEY]: 'detected',
    })
      .then(addOriginatingChainId(_chainId, _parsedLog.args))
      .then(maybeAddAmount(_parsedLog.args))
      .then(maybeAddDestinationAddress(_parsedLog.args))
      .then(maybeAddDestinationChainId(_parsedLog.args))
      .then(maybeAddUserData(_parsedLog.args))
      .then(maybeAddTokenAddress(_parsedLog.args))
  // TODO add missing properties (check the schema-event-report module)
)

module.exports = {
  buildStandardizedEventFromEvmEvent,
}
