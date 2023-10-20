const decodeGovernanceMessage = require('./decode-governance-message')
const handleTelepathy = require('./handle-telepathy')
const propagateSentinels = require('./propagate-actors.task')
const verifyMessage = require('./verify-message.task')

module.exports = {
  decodeGovernanceMessage,
  handleTelepathy,
  propagateSentinels,
  verifyMessage,
}
