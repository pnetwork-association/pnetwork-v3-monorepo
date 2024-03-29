const R = require('ramda')
const dbSchema = require('./db')
const stateEmitter = require('./state-emitter')
const {
  KEY_WARMUP_TIME,
  KEY_CHECK_INACTIVITY_INTERVAL,
  KEY_FIRE_CHALLENGE_THRESHOLD,
  KEY_IGNORE_ACTORS,
  KEY_DRY_RUN,
  KEY_DB,
} = require('../constants')

module.exports = R.mergeDeepWith(R.concat, stateEmitter, {
  required: [KEY_WARMUP_TIME, KEY_FIRE_CHALLENGE_THRESHOLD],
  properties: {
    [KEY_CHECK_INACTIVITY_INTERVAL]: {
      type: ['integer', 'null'],
    },
    [KEY_WARMUP_TIME]: {
      type: ['integer', 'null'],
    },
    [KEY_FIRE_CHALLENGE_THRESHOLD]: {
      type: 'integer',
    },
    [KEY_DRY_RUN]: {
      type: 'boolean',
    },
    [KEY_IGNORE_ACTORS]: {
      type: ['array', 'null'],
      minItems: 1,
    },
    [KEY_DB]: dbSchema,
  },
})
