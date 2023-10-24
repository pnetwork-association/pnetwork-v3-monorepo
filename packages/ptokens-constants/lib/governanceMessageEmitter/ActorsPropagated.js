class ActorsPropagated {
  constructor({ args: [currentEpoch, actors, actorsType] }) {
    this.actors = actors
    this.actorsType = actorsType.map(Number)
    this.currentEpoch = Number(currentEpoch)
  }
}

module.exports = ActorsPropagated
