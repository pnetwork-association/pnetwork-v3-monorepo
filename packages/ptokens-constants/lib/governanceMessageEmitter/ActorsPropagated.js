class ActorsPropagated {
  constructor({ args: [currentEpoch, actors, actorsTypes] }) {
    this.actors = actors
    this.actorsTypes = actorsTypes.map(Number)
    this.currentEpoch = Number(currentEpoch)
  }
}

module.exports = ActorsPropagated
