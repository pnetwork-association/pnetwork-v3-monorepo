const R = require('ramda')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')

const getEventWithAllRequiredSetToNull = _ => ({
  [constants.db.KEY_STATUS]: null,
  [constants.db.KEY_EVENT_NAME]: null,
  [constants.db.KEY_NONCE]: null,
  [constants.db.KEY_DESTINATION_ACCOUNT]: null,
  [constants.db.KEY_DESTINATION_NETWORK_ID]: null,
  [constants.db.KEY_UNDERLYING_ASSET_NAME]: null,
  [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: null,
  [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: null,
  [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]: null,
  [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: null,
  [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
  [constants.db.KEY_ASSET_AMOUNT]: null,
  [constants.db.KEY_USER_DATA]: null,
  [constants.db.KEY_OPTIONS_MASK]: null,
  [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
  [constants.db.KEY_ORIGINATING_ADDRESS]: null,
  [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
  [constants.db.KEY_ORIGINATING_TX_HASH]: null,
  [constants.db.KEY_BLOCK_HASH]: null,
  [constants.db.KEY_NETWORK_ID]: null,
  [constants.db.KEY_TX_HASH]: null,
  [constants.db.KEY_PROPOSAL_TS]: null,
  [constants.db.KEY_PROPOSAL_TX_HASH]: null,
  [constants.db.KEY_WITNESSED_TS]: null,
  [constants.db.KEY_FINAL_TX_HASH]: null,
  [constants.db.KEY_FINAL_TX_TS]: null,
  [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: null,
  [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: null,
  [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: null,
  [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: null,
  [constants.db.KEY_IS_FOR_PROTOCOL]: null,
})

const bigIntToNumber = R.tryCatch(_n => Number(_n) || null, R.always(null))
const bitIntToString = R.tryCatch(_n => _n.toString(), R.always(null))

const addEventName = _eventLog => R.assoc(constants.db.KEY_EVENT_NAME, _eventLog.name)

const argsToString = _arg =>
  R.type(_arg) === 'Array'
    ? _arg.map(argsToString)
    : R.type(_arg) === 'Boolean'
    ? _arg
    : _arg.toString()

const addEventArgs = _eventLog =>
  R.assoc(
    constants.db.KEY_EVENT_ARGS,
    Array.from(_eventLog.args.map(argsToString)) // .map(R.tryCatch(_arg => _arg.toString(), R.always(null)))
  )

const setCorrectStatus = R.curry((_parsedLog, _obj) =>
  _parsedLog.name === constants.db.eventNames.QUEUED_OPERATION
    ? R.assoc(constants.db.KEY_STATUS, constants.db.txStatus.PROPOSED, _obj)
    : R.assoc(constants.db.KEY_STATUS, constants.db.txStatus.DETECTED, _obj)
)

const addFieldFromEventArgs = (_eventValue, _destKey, _conversionFunction, _standardEvent) =>
  logger.debug(`Adding ${_eventValue} to "${_destKey}"`) ||
  Promise.resolve(R.assoc(_destKey, _eventValue, _standardEvent))

const getValueFromEventArgsByKey = R.curry((_eventArgs, _key) =>
  _eventArgs['operation'] ? _eventArgs['operation'][_key] : _eventArgs[_key]
)

const maybeAddFieldFromEventArgs = R.curry(
  (_eventArgs, _possibleEventKeys, _destKey, _conversionFunction, _standardEvent) =>
    Promise.all(_possibleEventKeys.map(getValueFromEventArgsByKey(_eventArgs)))
      .then(R.find(utils.isNotNil))
      .then(_value =>
        R.isNil(_value)
          ? Promise.resolve(_standardEvent)
          : addFieldFromEventArgs(
              _conversionFunction(_value),
              _destKey,
              _conversionFunction,
              _standardEvent
            )
      )
)

const addInfoFromParsedLog = (_parsedLog, _obj) =>
  Promise.resolve(_obj)
    .then(setCorrectStatus(_parsedLog))
    .then(addEventName(_parsedLog))
    .then(addEventArgs(_parsedLog))
    .then(
      maybeAddFieldFromEventArgs(_parsedLog.args, ['nonce'], constants.db.KEY_NONCE, bitIntToString)
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['destinationAccount', 'to', 'underlyingAssetRecipient'],
        constants.db.KEY_DESTINATION_ACCOUNT,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['destinationNetworkId', 'destinationChainId'],
        constants.db.KEY_DESTINATION_NETWORK_ID,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['forwardDestinationNetworkId'],
        constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetName'],
        constants.db.KEY_UNDERLYING_ASSET_NAME,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetSymbol'],
        constants.db.KEY_UNDERLYING_ASSET_SYMBOL,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetDecimals'],
        constants.db.KEY_UNDERLYING_ASSET_DECIMALS,
        bigIntToNumber
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetTokenAddress'],
        constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetNetworkId'],
        constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['assetTokenAddress', '_tokenAddress'],
        constants.db.KEY_ASSET_TOKEN_ADDRESS,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['assetAmount', 'amount', '_tokenAmount', 'value'],
        constants.db.KEY_ASSET_AMOUNT,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['userDataProtocolFeeAssetAmount'],
        constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['networkFeeAssetAmount'],
        constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['forwardNetworkFeeAssetAmount'],
        constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['from', 'originAccount'],
        constants.db.KEY_ORIGINATING_ADDRESS,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['optionsMask'],
        constants.db.KEY_OPTIONS_MASK,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['originBlockHash'],
        constants.db.KEY_ORIGINATING_BLOCK_HASH,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['originTransactionHash'],
        constants.db.KEY_ORIGINATING_TX_HASH,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['originNetworkId'],
        constants.db.KEY_ORIGINATING_NETWORK_ID,
        bitIntToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['userData'],
        constants.db.KEY_USER_DATA,
        R.identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['isForProtocol'],
        constants.db.KEY_IS_FOR_PROTOCOL,
        R.identity
      )
    )

const maybeAddFieldFromLog = R.curry((_eventLog, _originKey, _destKey, _obj) =>
  R.isNil(R.prop(_destKey, _obj)) ? R.assoc(_destKey, _eventLog[_originKey], _obj) : _obj
)

const addWitnessedTimestamp = _obj =>
  Promise.resolve(new Date().toISOString()).then(_ts =>
    R.assoc(constants.db.KEY_WITNESSED_TS, _ts, _obj)
  )

const setId = _obj =>
  utils
    .getEventId(_obj)
    .then(_id => R.assoc('_id', `${_obj[constants.db.KEY_EVENT_NAME]}_${_id}`.toLowerCase(), _obj))

const parseLog = (_interface, _log) =>
  Promise.resolve(_interface.parseLog(_log)).then(
    _parsedLog =>
      logger.debug('Parsed EVM event log') ||
      logger.debug('  name:', _parsedLog.name) ||
      logger.debug('  signature:', _parsedLog.signature) ||
      logger.debug('  args:', _parsedLog.args) ||
      logger.debug('  data:', _parsedLog.data) ||
      _parsedLog
  )

// secretlint-disable
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
 * @param  {string} _networkId,  [metadata chain id]
 * @param  {object} _interface,  [ethers.js interface object]
 * @param  {object} _log [on chain event log]
 * @return {object}            [the standard event object]
 */
// secretlint-enable
const buildStandardizedEvmEventObjectFromLog = R.curry((_networkId, _interface, _log) =>
  Promise.all([getEventWithAllRequiredSetToNull(), parseLog(_interface, _log)])
    .then(([_obj, _parsedLog]) => addInfoFromParsedLog(_parsedLog, _obj))
    .then(R.assoc(constants.db.KEY_NETWORK_ID, _networkId))
    .then(maybeAddFieldFromLog(_log, 'logIndex', constants.db.KEY_NONCE))
    .then(maybeAddFieldFromLog(_log, 'blockHash', constants.db.KEY_BLOCK_HASH))
    .then(maybeAddFieldFromLog(_log, 'transactionHash', constants.db.KEY_TX_HASH))
    .then(addWitnessedTimestamp)
    .then(setId)
)

module.exports = {
  buildStandardizedEvmEventObjectFromLog,
}
