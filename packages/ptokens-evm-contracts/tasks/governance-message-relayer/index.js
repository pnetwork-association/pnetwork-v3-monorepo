const decodeGovernanceMessage = require('./decode-governance-message')
const handleTelepathy = require('./handle-telepathy')
const propagateSentinels = require('./propagate-actors.task')
const readSentinelsRoot = require('./read-sentinels-root.task')
const verifyMessage = require('./verify-message.task')

module.exports = {
  decodeGovernanceMessage,
  handleTelepathy,
  propagateSentinels,
  readSentinelsRoot,
  verifyMessage,
}
