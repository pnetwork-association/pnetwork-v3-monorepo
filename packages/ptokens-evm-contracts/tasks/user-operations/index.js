const mintAndBurn = require('./router-user-send-mint-and-burn.task.js')
const userSend = require('./router-user-send.task.js')
const protocolExecuteOperation = require('./statemanager-protocol-queue-exev.task.js')

module.exports = {
  ...mintAndBurn,
  ...userSend,
  ...protocolExecuteOperation,
}
