const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { isNil, curry, assoc, identity } = require('ramda')
const schemas = require('ptokens-schemas')

const getEventWithAllRequiredSetToNull = _ => ({
  [schemas.constants.SCHEMA_EVENT_NAME_KEY]: null,
  [schemas.constants.SCHEMA_STATUS_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: null,
  [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]: null,
  [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]: null,
  [schemas.constants.SCHEMA_AMOUNT_KEY]: null,
  [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]: null,
  [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: null,
  [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
  [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]: null,
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

const maybeAddFieldFromEventLog = curry(
  (_eventLog, _originKeys, _destKey, _conversionFunction, _standardEvent) =>
    new Promise((resolve, _) => {
      logger.debug('_originKeys', _originKeys)
      logger.debug('_destKey', _destKey)
      logger.debug('_eventLog', _eventLog)
      const value = _originKeys
        .map(_key => _eventLog[_key])
        .find(_val => utils.isNotNil(_val))
      logger.debug('value', value)
      const convertedValue = _conversionFunction(value)

      if (isNil(convertedValue))
        return (
          logger.debug(`No ${_destKey} to add to event`) ||
          resolve(_standardEvent)
        )

      logger.debug(`Adding ${_destKey} to event`)

      return resolve(assoc(_destKey, convertedValue, _standardEvent))
    })
)

const maybeAddUserData = curry((_eventLog, _standardEvent) =>
  Promise.resolve(
    utils.isNotNil(_eventLog.userData) && _eventLog.userData !== '0x'
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
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['nonce'],
        schemas.constants.SCHEMA_NONCE_KEY,
        bigNumberToString
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['destinationAccount'],
        schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['destinationNetworkId'],
        schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['underlyingAssetTokenAddress'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['underlyingAssetName'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['underlyingAssetSymbol'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['underlyingAssetChainId'],
        schemas.constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['assetTokenAddress'],
        schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY,
        identity
      )
    )
    .then(
      maybeAddFieldFromEventLog(
        _parsedLog.args,
        ['assetAmount'],
        schemas.constants.SCHEMA_AMOUNT_KEY,
        bigNumberToString
      )
    )
    .then(maybeAddUserData(_parsedLog.args))

const addOriginatingTransactionHash = curry((_log, _obj) =>
  Promise.resolve(
    assoc(
      schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY,
      _log.transactionHash,
      _obj
    )
  )
)

const addWitnessedTimestamp = _obj =>
  Promise.resolve(new Date().toISOString()).then(_ts =>
    assoc(schemas.constants.SCHEMA_WITNESSED_TS_KEY, _ts, _obj)
  )

const setId = _obj =>
  assoc(
    '_id',
    schemas.db.access.getEventId(
      _obj[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
    ),
    _obj
  )

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
 * @param  {object} _interface,  [ethers.js interface object]
 * @param  {object} _log [on chain event log]
 * @return {object}            [the standard event object]
 */
const buildStandardizedEvmEventObjectFromLog = (_interface, _log) =>
  Promise.all([getEventWithAllRequiredSetToNull(), parseLog(_interface, _log)])
    .then(([_obj, _parsedLog]) => addInfoFromParsedLog(_parsedLog, _obj))
    .then(addOriginatingTransactionHash(_log))
    .then(addWitnessedTimestamp)
    .then(setId)

module.exports = {
  buildStandardizedEvmEventObjectFromLog,
}
