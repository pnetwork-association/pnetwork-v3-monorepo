const R = require('ramda')

class Challenge {
  constructor(obj) {
    obj && Object.assign(this, obj)
  }

  static fromArgs({ args }) {
    return new Challenge({
      nonce: args[0].nonce,
      actor: R.toLower(args[0].actor),
      challenger: R.toLower(args[0].challenger),
      actorType: args[0].actorType,
      timestamp: args[0].timestamp,
      networkId: args[0].networkId,
    })
  }

  getArgs() {
    return [this.nonce, this.actor, this.challenger, this.actorType, this.timestamp, this.networkId]
  }

  fromReceipt() {}
}

module.exports = Challenge
