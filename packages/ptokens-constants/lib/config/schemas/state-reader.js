const R = require('ramda')
const stateEmitter = require('./state-emitter')
const { KEY_WARMUP_TIME, KEY_FIRE_CHALLENGE_THRESHOLD } = require('../constants')

module.exports = R.mergeDeepWith(R.concat, stateEmitter, {
  required: [KEY_WARMUP_TIME, KEY_FIRE_CHALLENGE_THRESHOLD],
  properties: {
    [KEY_WARMUP_TIME]: {
      type: 'integer',
    },
    [KEY_FIRE_CHALLENGE_THRESHOLD]: {
      type: 'integer',
    },
  },
})
