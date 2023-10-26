class Challenge {
  constructor({ args: [nonce, actor, challenger, actorType, timestamp, networkId] }) {
    this.nonce = nonce
    this.actor = actor
    this.challenger = challenger
    this.actorType = actorType
    this.timestamp = timestamp
    this.networkId = networkId
  }
}

module.exports = Challenge
