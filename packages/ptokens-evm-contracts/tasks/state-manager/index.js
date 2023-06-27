const protocolExecute = require('./protocol-execute.task')
const protocolQueue = require('./protocol-queue.task')

module.exports = {
  ...protocolExecute,
  ...protocolQueue,
}
