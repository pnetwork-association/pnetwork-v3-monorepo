const protocolExecute = require('./protocol-execute.task')
const protocolQueue = require('./protocol-queue.task')
const protocolCancel = require('./protocol-cancel.task')
const getProperties = require('./get-properties')

module.exports = {
  ...protocolExecute,
  ...getProperties,
  ...protocolQueue,
  ...protocolCancel,
}
