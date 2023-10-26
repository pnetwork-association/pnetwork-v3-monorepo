class Challenge {
  constructor({ args: [nonce, actor, challenger, actorType, timestamp, networkId] }) {
    this.nonce = nonce
    this.actor = actor
    this.challenger = challenger
    this.actorType = actorType
    this.timestamp = timestamp
    this.networkId = networkId
  }

  getArg() {
    return [this.nonce, this.actor, this.challenger, this.actorType, this.timestamp, this.networkId]
  }
}

module.exports = Challenge
