const constants = require('./constants')
const enumTxStatus = require('./enum-tx-status')
const enumEventNames = require('./enum-event-names')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    constants.SCHEMA_ID_KEY,
    constants.SCHEMA_STATUS_KEY,
    constants.SCHEMA_EVENT_NAME_KEY,

    constants.SCHEMA_NONCE_KEY,
    constants.SCHEMA_DESTINATION_ADDRESS_KEY,
    constants.SCHEMA_DESTINATION_NETWORK_ID_KEY,
    constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY,
    constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY,
    constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY,
    constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY,
    constants.SCHEMA_TOKEN_ADDRESS_KEY,
    constants.SCHEMA_AMOUNT_KEY,
    constants.SCHEMA_USER_DATA_KEY,

    constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY,
    constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY,
    constants.SCHEMA_ORIGINATING_TX_HASH_KEY,
    constants.SCHEMA_PROPOSAL_TS_KEY,
    constants.SCHEMA_PROPOSAL_TX_HASH_KEY,
    constants.SCHEMA_WITNESSED_TS_KEY,
    constants.SCHEMA_FINAL_TX_HASH_KEY,
    constants.SCHEMA_FINAL_TX_TS_KEY,
    constants.SCHEMA_OPTIONS_MASK,
  ],

  properties: {
    [constants.SCHEMA_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_STATUS_KEY]: {
      enum: Object.values(enumTxStatus),
    },
    [constants.SCHEMA_EVENT_NAME_KEY]: {
      enum: Object.values(enumEventNames),
    },
    [constants.SCHEMA_NONCE_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_OPTIONS_MASK]: {
      type: 'string',
    },
    [constants.SCHEMA_UNDERLYING_ASSET_CHAIN_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_ORIGINATING_TX_HASH_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_AMOUNT_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_DESTINATION_ADDRESS_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_USER_DATA_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_TOKEN_ADDRESS_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_FINAL_TX_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_WITNESSED_TS_KEY]: {
      type: ['string'],
      format: 'date-time',
    },
    [constants.SCHEMA_PROPOSAL_TS_KEY]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
    [constants.SCHEMA_FINAL_TX_TS_KEY]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
  },
}
