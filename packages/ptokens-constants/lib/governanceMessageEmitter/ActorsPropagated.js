const R = require('ramda')
class ActorsPropagated {
  constructor({ args: [currentEpoch, actors, actorsTypes] }) {
    this.actors = actors.map(R.toLower)
    this.actorsTypes = actorsTypes.map(Number)
    this.currentEpoch = Number(currentEpoch)
  }
}

module.exports = ActorsPropagated
