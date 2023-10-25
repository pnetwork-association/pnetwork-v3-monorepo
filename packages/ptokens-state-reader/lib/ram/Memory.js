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
} = require('../constants')

class Memory {
  static memory = new loki(MEM_MEMORY)
  static actors = this.memory.addCollection(MEM_ACTORS, {
    indices: [MEM_EPOCH, MEM_ACTOR],
  })
  static challenges = this.memory.addCollection(MEM_CHALLENGES, {
    indices: [MEM_ACTOR, MEM_NETWORKID],
  })

  static {
    logger.info('Memory initialized!')
  }

  static updateActorState(epoch, actor, syncState) {
    const lowerCaseActor = R.toLower(actor)
    const getActor = _obj => _obj[MEM_ACTOR] === lowerCaseActor

    const record = this.actors.find(getActor)
    const now = Math.floor(Date.now())
    if (record.length === 0) {
      const newObj = {
        [MEM_EPOCH]: epoch,
        [MEM_ACTOR]: lowerCaseActor,
        [MEM_TIMESTAMP]: now,
        [MEM_SYNC_STATE]: syncState,
      }
      logger.debug('Inserting', newObj)
      this.actors.insert(newObj)
      logger.info(`New actor ${actor} inserted!`)
    } else {
      logger.debug('Updating', record)
      record[MEM_TIMESTAMP] = now
      record[MEM_SYNC_STATE] = syncState
      this.actors.update(record)
      logger.info(`Actor ${actor} updated!`)
    }
  }
}

module.exports = Memory
