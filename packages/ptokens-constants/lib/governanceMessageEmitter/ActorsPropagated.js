const R = require('ramda')
class ActorsPropagated {
  constructor(obj) {
    obj && Object.assign(this, obj)
  }

  static fromArgs({ args: [currentEpoch, actors, actorsTypes] }) {
    return new ActorsPropagated({
      actors: actors.map(R.toLower),
      actorsTypes: actorsTypes.map(Number),
      currentEpoch: Number(currentEpoch),
    })
  }
}

module.exports = ActorsPropagated
