const {
  KEY_ID,
  KEY_OPERATION_ID,
  KEY_ERROR,
  KEY_STATUS,
  KEY_EVENT_NAME,

  KEY_NONCE,
  KEY_DESTINATION_ACCOUNT,
  KEY_DESTINATION_NETWORK_ID,
  KEY_UNDERLYING_ASSET_NAME,
  KEY_UNDERLYING_ASSET_SYMBOL,
  KEY_UNDERLYING_ASSET_DECIMALS,
  KEY_UNDERLYING_ASSET_TOKEN_ADDRESS,
  KEY_UNDERLYING_ASSET_NETWORK_ID,
  KEY_ASSET_TOKEN_ADDRESS,
  KEY_ASSET_AMOUNT,
  KEY_USER_DATA,
  KEY_OPTIONS_MASK,

  KEY_ORIGINATING_BLOCK_HASH,
  KEY_ORIGINATING_ADDRESS,
  KEY_ORIGINATING_NETWORK_ID,
  KEY_ORIGINATING_TX_HASH,

  KEY_BLOCK_HASH,
  KEY_NETWORK_ID,
  KEY_TX_HASH,
  KEY_PROPOSAL_TS,
  KEY_PROPOSAL_TX_HASH,
  KEY_WITNESSED_TS,
  KEY_FINAL_TX_HASH,
  KEY_FINAL_TX_TS,

  KEY_FORWARD_DESTINATION_NETWORK_ID,
  KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT,
  KEY_NETWORK_FEE_ASSET_AMOUNT,
  KEY_PROTOCOL_FEE_ASSET_AMOUNT,

  KEY_EVENT_ARGS,
} = require('../constants')
const enumTxStatus = require('../tx-status')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    KEY_ID,
    KEY_OPERATION_ID,
    KEY_STATUS,
    KEY_EVENT_NAME,
    KEY_EVENT_ARGS,
    KEY_NONCE,
    KEY_DESTINATION_ACCOUNT,
    KEY_DESTINATION_NETWORK_ID,
    KEY_UNDERLYING_ASSET_NAME,
    KEY_UNDERLYING_ASSET_SYMBOL,
    KEY_UNDERLYING_ASSET_DECIMALS,
    KEY_UNDERLYING_ASSET_TOKEN_ADDRESS,
    KEY_UNDERLYING_ASSET_NETWORK_ID,
    KEY_ASSET_TOKEN_ADDRESS,
    KEY_ASSET_AMOUNT,
    KEY_USER_DATA,
    KEY_OPTIONS_MASK,

    KEY_ORIGINATING_BLOCK_HASH,
    KEY_ORIGINATING_ADDRESS,
    KEY_ORIGINATING_NETWORK_ID,
    KEY_ORIGINATING_TX_HASH,

    KEY_BLOCK_HASH,
    KEY_NETWORK_ID,
    KEY_TX_HASH,
    KEY_PROPOSAL_TS,
    KEY_PROPOSAL_TX_HASH,
    KEY_WITNESSED_TS,
    KEY_FINAL_TX_HASH,
    KEY_FINAL_TX_TS,

    KEY_FORWARD_DESTINATION_NETWORK_ID,
    KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT,
    KEY_NETWORK_FEE_ASSET_AMOUNT,
    KEY_PROTOCOL_FEE_ASSET_AMOUNT,
  ],

  properties: {
    [KEY_ID]: {
      type: 'string',
    },
    [KEY_OPERATION_ID]: {
      type: 'string',
    },
    [KEY_STATUS]: {
      enum: Object.values(enumTxStatus),
    },
    [KEY_EVENT_NAME]: {
      type: 'string',
    },
    [KEY_EVENT_ARGS]: {
      type: ['array', 'null'],
    },
    [KEY_NONCE]: {
      type: 'string',
    },
    [KEY_OPTIONS_MASK]: {
      type: 'string',
    },
    [KEY_UNDERLYING_ASSET_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_UNDERLYING_ASSET_SYMBOL]: {
      type: 'string',
    },
    [KEY_UNDERLYING_ASSET_NAME]: {
      type: 'string',
    },
    [KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]: {
      type: 'string',
    },
    [KEY_UNDERLYING_ASSET_DECIMALS]: {
      type: 'integer',
    },
    [KEY_ASSET_AMOUNT]: {
      type: 'string',
    },
    [KEY_DESTINATION_ACCOUNT]: {
      type: 'string',
    },
    [KEY_DESTINATION_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_USER_DATA]: {
      type: ['string', 'null'],
    },
    [KEY_ASSET_TOKEN_ADDRESS]: {
      type: ['string', 'null'],
    },
    [KEY_ORIGINATING_TX_HASH]: {
      type: ['string', 'null'],
    },
    [KEY_ORIGINATING_BLOCK_HASH]: {
      type: ['string', 'null'],
    },
    [KEY_ORIGINATING_ADDRESS]: {
      type: ['string', 'null'],
    },
    [KEY_ORIGINATING_NETWORK_ID]: {
      type: ['string', 'null'],
    },
    [KEY_TX_HASH]: {
      type: 'string',
    },
    [KEY_BLOCK_HASH]: {
      type: 'string',
    },
    [KEY_NETWORK_ID]: {
      type: 'string',
    },
    [KEY_FINAL_TX_HASH]: {
      type: ['string', 'null'],
    },
    [KEY_PROPOSAL_TX_HASH]: {
      type: ['string', 'null'],
    },
    [KEY_WITNESSED_TS]: {
      type: ['string'],
      format: 'date-time',
    },
    [KEY_PROPOSAL_TS]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
    [KEY_FINAL_TX_TS]: {
      type: ['string', 'null'],
      format: 'date-time',
    },
    [KEY_ERROR]: {
      type: ['string', 'null'],
    },
    [KEY_FORWARD_DESTINATION_NETWORK_ID]: {
      type: ['string', 'null'],
    },
    [KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: {
      type: ['string', 'null'],
    },
    [KEY_NETWORK_FEE_ASSET_AMOUNT]: {
      type: ['string', 'null'],
    },
    [KEY_PROTOCOL_FEE_ASSET_AMOUNT]: {
      type: ['string', 'null'],
    },
  },
}
