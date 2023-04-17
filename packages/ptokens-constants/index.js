const state = require('./lib/state')
const evmEvents = require('./lib/evm-events')

module.exports = {
  state,
  events: { ...evmEvents },
}
