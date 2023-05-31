const mint = require('./router-user-send-mint.task.js')
const transfer = require('./router-user-send-transfer.task.js')
const burn = require('./router-user-send-burn.task.js')
const protocolExecuteOperation = require('./statemanager-protocol-queue-exev.task.js')

module.exports = {
  ...mint,
  ...transfer,
  ...burn,
  ...protocolExecuteOperation,
}
