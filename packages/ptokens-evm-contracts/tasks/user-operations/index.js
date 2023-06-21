const mint = require('./user-send-mint.task.js')
const transfer = require('./user-send-transfer.task.js')
const burn = require('./user-send-burn.task.js')
const protocolExecuteOperation = require('../state-manager/protocol-queue.task.js')

module.exports = {
  ...mint,
  ...transfer,
  ...burn,
  ...protocolExecuteOperation,
}
