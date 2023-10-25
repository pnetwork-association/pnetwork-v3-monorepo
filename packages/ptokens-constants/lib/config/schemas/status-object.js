const R = require('ramda')
const syncStateSchema = require('./sync-state')
const swVersionsSchema = require('./sw-versions')
const {
  KEY_SYNC_STATE,
  KEY_ACTOR_TYPE,
  KEY_SIGNER_ADDRESS,
  KEY_SW_VERSIONS,
  KEY_TIMESTAMP,
  KEY_SIGNATURE,
} = require('../constants')
const actors = require('../../hub/actors')

module.exports = {
  $async: true,
  type: 'object',
  required: [
    KEY_SYNC_STATE,
    KEY_ACTOR_TYPE,
    KEY_SIGNER_ADDRESS,
    KEY_SW_VERSIONS,
    KEY_TIMESTAMP,
    KEY_SIGNATURE,
  ],
  properties: {
    [KEY_SYNC_STATE]: syncStateSchema,
    [KEY_SW_VERSIONS]: swVersionsSchema,
    [KEY_TIMESTAMP]: { type: 'integer' },
    [KEY_SIGNATURE]: { type: 'string' },
    [KEY_SIGNER_ADDRESS]: { type: 'string' },
    [KEY_ACTOR_TYPE]: { enum: Object.keys(actors).map(R.toLower) },
  },
}
