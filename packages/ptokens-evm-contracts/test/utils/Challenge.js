module.exports = class Challenge {
  constructor({ nonce, actor, challenger, timestamp }) {
    this.nonce = nonce
    this.actor = actor
    this.challenger = challenger
    this.timestamp = timestamp
  }

  static fromReceipt(_receipt) {
    const event = _receipt.events.find(({ event }) => event === 'ChallengePending')
    const { challenge } = event.decode(event.data, event.topics)
    return new Challenge({
      ...challenge,
    })
  }

  serialize() {
    return [this.nonce, this.actor, this.challenger, this.timestamp]
  }

  get() {
    return this.serialize()
  }
}
