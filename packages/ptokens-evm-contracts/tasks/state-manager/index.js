const protocolExecute = require('./protocol-execute.task')
const protocolQueue = require('./protocol-queue.task')
const getProperties = require('./get-properties')

module.exports = {
  ...protocolExecute,
  ...getProperties,
  ...protocolQueue,
}
