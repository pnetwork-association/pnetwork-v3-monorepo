const { reportFields } = require('./constants')
const enumTxStatus = require('./enum-tx-status')
const enumEventNames = require('./enum-event-names')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    reportFields.SCHEMA_ID_KEY,
    reportFields.SCHEMA_STATUS_KEY,
    reportFields.SCHEMA_EVENT_NAME_KEY,

    reportFields.SCHEMA_NONCE_KEY,
    reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY,
    reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY,
    reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY,
    reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY,
    reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY,
    reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY,
    reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY,
    reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY,
    reportFields.SCHEMA_ASSET_AMOUNT_KEY,
    reportFields.SCHEMA_USER_DATA_KEY,
    reportFields.SCHEMA_OPTIONS_MASK,

    reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY,
    reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY,
    reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY,
    reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY,

    reportFields.SCHEMA_BLOCK_HASH_KEY,
    reportFields.SCHEMA_NETWORK_ID_KEY,
    reportFields.SCHEMA_TX_HASH_KEY,
    reportFields.SCHEMA_PROPOSAL_TS_KEY,
    reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY,
    reportFields.SCHEMA_WITNESSED_TS_KEY,
    reportFields.SCHEMA_FINAL_TX_HASH_KEY,
    reportFields.SCHEMA_FINAL_TX_TS_KEY,
  ],

  properties: {
    [reportFields.SCHEMA_ID_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_STATUS_KEY]: {
      enum: Object.values(enumTxStatus),
    },
    [reportFields.SCHEMA_EVENT_NAME_KEY]: {
      enum: Object.values(enumEventNames),
    },
    [reportFields.SCHEMA_NONCE_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_OPTIONS_MASK]: {
      type: 'string',
    },
    [reportFields.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: {
      type: 'integer',
    },
    [reportFields.SCHEMA_ASSET_AMOUNT_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_DESTINATION_ACCOUNT_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_DESTINATION_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_USER_DATA_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_ORIGINATING_TX_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_ORIGINATING_ADDRESS_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_TX_HASH_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_BLOCK_HASH_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_NETWORK_ID_KEY]: {
      type: 'string',
    },
    [reportFields.SCHEMA_FINAL_TX_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_PROPOSAL_TX_HASH_KEY]: {
      type: ['string', 'null'],
    },
    [reportFields.SCHEMA_WITNESSED_TS_KEY]: {
      type: ['string'],
      format: 'date-time',
    },
    [reportFields.SCHEMA_PROPOSAL_TS_KEY]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
    [reportFields.SCHEMA_FINAL_TX_TS_KEY]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
  },
}
