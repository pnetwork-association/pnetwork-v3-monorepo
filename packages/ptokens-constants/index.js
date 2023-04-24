const db = require('./lib/db')
const evm = require('./lib/evm')
const state = require('./lib/state')
const config = require('./lib/config')

module.exports = {
  db,
  evm,
  state,
  config,
}
