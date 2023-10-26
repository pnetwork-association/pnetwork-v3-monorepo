const R = require('ramda')
const loki = require('lokijs')
const { logger } = require('../get-logger')
const {
  MEM_ACTORS,
  MEM_CHALLENGES,
  MEM_EPOCH,
  MEM_ACTOR,
  MEM_NETWORKID,
  MEM_MEMORY,
  MEM_TIMESTAMP,
  MEM_SYNC_STATE,
  MEM_ACTORS_PROPAGATED,
} = require('../constants')

class Memory {
  static dryRun = false
  static memory = new loki(MEM_MEMORY)
  static actors = this.memory.addCollection(MEM_ACTORS)
  static actorsPropagated = this.memory.addCollection(MEM_ACTORS_PROPAGATED)
  static pendingChallenges = this.memory.addCollection(MEM_CHALLENGES, {
    indices: [MEM_ACTOR, MEM_NETWORKID],
  })

  static getActorQuery = R.curry(
    (_actorAddress, _obj) => _obj[MEM_ACTOR] === R.toLower(_actorAddress)
  )

  static {
    logger.info('Memory initialized!')
  }

  static insertNewActor(epoch, actorAddress, syncState) {
    const now = Math.floor(Date.now())
    const newObj = {
      [MEM_EPOCH]: epoch,
      [MEM_ACTOR]: R.toLower(actorAddress),
      [MEM_TIMESTAMP]: now,
      [MEM_SYNC_STATE]: syncState,
    }
    this.actors.insert(newObj)
    logger.info(`New actor ${actorAddress} inserted!`)
  }

  static updateActorState(epoch, actorAddress, syncState) {
    logger.debug('looking for actor ', actorAddress)
    const actor = this.getActor(actorAddress)

    if (R.isNil(actor)) {
      this.insertNewActor(epoch, actorAddress, syncState)
    } else {
      const now = Math.floor(Date.now())
      actor[MEM_EPOCH] = epoch
      actor[MEM_TIMESTAMP] = now
      actor[MEM_SYNC_STATE] = syncState
      this.actors.update(actor)
      logger.info(`Actor '${actorAddress}' updated!`)
    }
  }

  static getActor(_actorAddress) {
    const results = this.actors.where(this.getActorQuery(_actorAddress))

    if (results.length === 0) {
      return null
    }
    return results[0]
  }

  static setDryRunTo(_value) {
    this.dryRun = _value
  }

  static isDryRun() {
    return this.dryRun
  }

  static addActorsPropagated(_actors) {
    this.actorsPropagated.insert(_actors)
    logger.info(`Actors for epoch ${_actors.currentEpoch} inserted in memory!`)
  }

  static getActorsPropagated() {
    return this.actorsPropagated.findOne()
  }

  static getActorType(_address) {
    const { actors, actorsTypes } = this.actorsPropagated.findOne()

    const index = actors.indexOf(_address)

    return index < 0 ? null : actorsTypes[index]
  }

  static addPendingChallenge(_challenge) {
    logger.debug('Adding new challenge:', _challenge)
    this.pendingChallenges.insert(_challenge)
  }
}

module.exports = Memory
