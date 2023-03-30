const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { isNil, curry, assoc, identity } = require('ramda')
const schemas = require('ptokens-schemas')

const getEventWithAllRequiredSetToNull = _ => ({
  [schemas.constants.SCHEMA_EVENT_NAME_KEY]: null,
  [schemas.constants.SCHEMA_STATUS_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]: null,
  [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
  [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: null,
  [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]: null,
  [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: null,
  [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
  [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]: null,
  [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
  [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
  [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
  [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: null,
  [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
  [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
})

const bigNumberToString = _n => _n.toString()

const addEventName = _eventLog =>
  assoc(schemas.constants.SCHEMA_EVENT_NAME_KEY, _eventLog.name)

const setStatusToDetected = assoc(
  schemas.constants.SCHEMA_STATUS_KEY,
  schemas.db.enums.txStatus.DETECTED
)

const maybeAddFieldFromEventArgs = curry(
  (_eventLog, _originKeys, _destKey, _conversionFunction, _standardEvent) =>
    new Promise((resolve, _) => {
      const value = _originKeys
        .map(_key => _eventLog[_key])
        .find(_val => utils.isNotNil(_val))

      if (isNil(value))
        return (
          logger.debug(`No ${_destKey} to add to event`) ||
          resolve(_standardEvent)
        )

      const convertedValue = _conversionFunction(value)
      logger.debug(
        'Adding field to event',
        JSON.stringify({ [_destKey]: convertedValue })
      )

      return resolve(assoc(_destKey, convertedValue, _standardEvent))
    })
)

const maybeAddUserData = curry((_eventLog, _standardEvent) =>
  Promise.resolve(
    utils.isNotNil(_eventLog.userData)
      ? assoc(
          schemas.constants.SCHEMA_USER_DATA_KEY,
          _eventLog.userData,
          _standardEvent
        )
      : assoc(schemas.constants.SCHEMA_USER_DATA_KEY, null, _standardEvent)
  )
)

const addInfoFromParsedLog = (_parsedLog, _obj) =>
  Promise.resolve(_obj)
    .then(setStatusToDetected)
    .then(addEventName(_parsedLog))
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['nonce'],
        schemas.constants.SCHEMA_NONCE_KEY,
        bigNumberToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['destinationAccount', 'to', 'underlyingAssetRecipient'],
        schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['destinationNetworkId', 'destinationChainId'],
        schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetName'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetSymbol'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetDecimals'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY,
        _n => _n.toNumber()
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetTokenAddress'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['underlyingAssetNetworkId'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['assetTokenAddress', '_tokenAddress'],
        schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['assetAmount', '_tokenAmount', 'value'],
        schemas.constants.SCHEMA_ASSET_AMOUNT_KEY,
        bigNumberToString
      )
    )
    .then(
      maybeAddFieldFromEventArgs(
        _parsedLog.args,
        ['optionsMask'],
        schemas.constants.SCHEMA_OPTIONS_MASK,
        bigNumberToString
      )
    )
    .then(maybeAddUserData(_parsedLog.args))

const addFieldFromLog = (_eventLog, _originKey, _destKey) =>
  assoc(_destKey, _eventLog[_originKey])

const addWitnessedTimestamp = _obj =>
  Promise.resolve(new Date().toISOString()).then(_ts =>
    assoc(schemas.constants.SCHEMA_WITNESSED_TS_KEY, _ts, _obj)
  )

const setId = _obj =>
  utils
    .getEventId(
      _obj[schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY],
      _obj[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY],
      _obj[schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY],
      _obj[schemas.constants.SCHEMA_NONCE_KEY],
      _obj[schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY],
      _obj[schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY],
      _obj[schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY],
      _obj[schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY],
      _obj[schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY],
      _obj[schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY],
      _obj[schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY],
      _obj[schemas.constants.SCHEMA_ASSET_AMOUNT_KEY],
      _obj[schemas.constants.SCHEMA_USER_DATA_KEY],
      _obj[schemas.constants.SCHEMA_OPTIONS_MASK]
    )
    .then(_id => assoc('_id', _id, _obj))

const parseLog = (_interface, _log) =>
  Promise.resolve(_interface.parseLog(_log)).then(
    _parsedLog =>
      logger.debug('Parsed EVM event log') ||
      logger.debug('  name:', _parsedLog.name) ||
      logger.debug('  signature:', _parsedLog.signature) ||
      logger.debug('  args:', _parsedLog.args) ||
      _parsedLog
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
 * @param  {object} _interface,  [ethers.js interface object]
 * @param  {object} _log [on chain event log]
 * @return {object}            [the standard event object]
 */
const buildStandardizedEvmEventObjectFromLog = (_chainId, _interface, _log) =>
  Promise.all([getEventWithAllRequiredSetToNull(), parseLog(_interface, _log)])
    .then(([_obj, _parsedLog]) => addInfoFromParsedLog(_parsedLog, _obj))
    .then(assoc(schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY, _chainId))
    .then(
      addFieldFromLog(
        _log,
        'blockHash',
        schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY
      )
    )
    .then(
      addFieldFromLog(
        _log,
        'transactionHash',
        schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY
      )
    )
    .then(addWitnessedTimestamp)
    .then(setId)

module.exports = {
  buildStandardizedEvmEventObjectFromLog,
}
