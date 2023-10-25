const R = require('ramda')
const stateEmitter = require('./state-emitter')
const {
  KEY_WARMUP_TIME,
  KEY_CHECK_INACTIVITY_INTERVAL,
  KEY_FIRE_CHALLENGE_THRESHOLD,
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
  },
})
