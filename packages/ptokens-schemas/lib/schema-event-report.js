const constants = require('./constants')
const enumTxStatus = require('./enum-tx-status')
const enumEventNames = require('./enum-event-names')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    constants.SCHEMA_SIGNER, // msg sender
    constants.SCHEMA_STATUS_KEY,
    constants.SCHEMA_AMOUNT_KEY,
    constants.SCHEMA_USER_DATA_KEY,
    constants.SCHEMA_EVENT_NAME_KEY,
    constants.SCHEMA_TOKEN_ADDRESS_KEY,
    constants.SCHEMA_PROPOSAL_TS_KEY,
    constants.SCHEMA_PROPOSAL_TX_HASH_KEY,
    constants.SCHEMA_WITNESSED_TS_KEY,
    constants.SCHEMA_FINAL_TX_HASH_KEY,
    constants.SCHEMA_FINAL_TX_TS_KEY,
    constants.SCHEMA_DESTINATION_ADDRESS_KEY,
    constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY,
    constants.SCHEMA_ORIGINATING_TX_HASH_KEY,
  ],

  properties: {
    [constants.SCHEMA_EVENT_NAME_KEY]: {
      enum: Object.values(enumEventNames),
    },
    [constants.SCHEMA_STATUS_KEY]: {
      enum: Object.values(enumTxStatus),
    },
    [constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: {
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
    [constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_USER_DATA_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_TOKEN_ADDRESS_KEY]: {
      type: 'string',
    },
    [constants.SCHEMA_SIGNER]: {
      type: 'string',
    },
    [constants.SCHEMA_FINAL_TX_HASH]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_PROPOSAL_TX_HASH]: {
      type: ['string', 'null'],
    },
    [constants.SCHEMA_WITNESSED_TS_KEY]: {
      type: 'timestamp',
    },
    [constants.SCHEMA_PROPOSAL_TS_KEY]: {
      type: ['timestamp', 'null'],
    },
    [constants.SCHEMA_FINAL_TX_TS_KEY]: {
      type: ['timestamp', 'null'],
    },
  },
}
