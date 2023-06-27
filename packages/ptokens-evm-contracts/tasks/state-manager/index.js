const protocolQueue = require('./protocol-queue.task')
const getProperties = require('./get-properties')

module.exports = {
  ...getProperties,
  ...protocolQueue,
}
