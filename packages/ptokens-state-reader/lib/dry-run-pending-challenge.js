const constants = require('ptokens-constants')

module.exports.dryRunPendingChallenge = {
  nonce: 0,
  actor: '0xf28910cc8f21e9314ed50627c11de36bc0b7338f',
  challenger: '0x9bbd6a8e738de6ac5ed11ced0e209ad7798e7b46',
  actorType: 1,
  timestamp: Date.now(),
  networkId: '0x123456',
  status: constants.hub.challengeStatus.PENDING,
}
