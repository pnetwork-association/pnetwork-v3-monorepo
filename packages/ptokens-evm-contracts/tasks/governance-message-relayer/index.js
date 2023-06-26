const propagateSentinels = require('./propagate-sentinels.task')
const readSentinelsRoot = require('./read-sentinels-root.task')
const verifyMessage = require('./verify-message.task')

module.exports = {
  propagateSentinels,
  readSentinelsRoot,
  verifyMessage,
}
