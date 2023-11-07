const R = require('ramda')
const { ZERO_ADDRESS } = require('../evm')

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

  static empty({ nonce, actor, challenger, actorType, timestamp, networkId }) {
    this.nonce = nonce || -1
    this.actor = actor || ZERO_ADDRESS
    this.challenger = challenger || ZERO_ADDRESS
    this.actorType = actorType || 1
    this.timestamp = timestamp || Date.now()
    this.networkId = networkId || 0x000000
  }

  getArgs() {
    return [this.nonce, this.actor, this.challenger, this.actorType, this.timestamp, this.networkId]
  }

  fromReceipt() {}
}

module.exports = Challenge
