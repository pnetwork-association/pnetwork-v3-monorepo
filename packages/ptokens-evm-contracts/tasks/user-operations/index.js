const mintAndBurn = require('./router-user-send-mint-and-burn.task.js')
const protocolExecuteOperation = require('./statemanager-protocol-queue-exev.task.js')

module.exports = {
  ...mintAndBurn,
  ...protocolExecuteOperation,
}
