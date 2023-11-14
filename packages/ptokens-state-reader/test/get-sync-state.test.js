const R = require('ramda')
const constants = require('ptokens-constants')
const { db, logic } = require('ptokens-utils')
const { EventEmitter } = require('stream')
const {
  updateActorsPropagatedEventInStorage,
} = require('../lib/chains/evm/get-actors-for-current-epoch')
const {
  MEM_ACTORS,
  MEM_ACTORS_PROPAGATED,
  STATE_DB_ACTORS_PROPAGATED_KEY,
  STATE_DB_ACTORS_KEY,
  MEM_TIMESTAMP,
} = require('../lib/constants')
const guardianStatusSample = require('./mock/guardian-status-sample.json')
const actorsPropagatedSample = require('./chains/evm/mock/actors-propagated-sample.json')

describe('Get syncing status general tests', () => {
  let actorsStorage = null
  let actorsPropagatedStorage = null

  const uri = global.__MONGO_URI__
  const dbName = global.__MONGO_DB_NAME__

  const actorAddress = guardianStatusSample[constants.statusObject.KEY_SIGNER_ADDRESS]

  beforeAll(async () => {
    actorsStorage = await db.getCollection(uri, dbName, MEM_ACTORS)
    actorsPropagatedStorage = await db.getCollection(uri, dbName, MEM_ACTORS_PROPAGATED)
    await updateActorsPropagatedEventInStorage(actorsPropagatedStorage, actorsPropagatedSample)
  })

  beforeEach(async () => {
    jest.restoreAllMocks()
    await actorsStorage.deleteMany({})
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  it('Should insert a new actor after receiving the state for the first time', () => {
    const state = {
      [STATE_DB_ACTORS_KEY]: actorsStorage,
      [STATE_DB_ACTORS_PROPAGATED_KEY]: actorsPropagatedStorage,
      [constants.config.KEY_DB]: {
        [constants.config.KEY_URL]: global.__MONGO_URI__,
        [constants.config.KEY_NAME]: global.__MONGO_DB_NAME__,
      },
      [constants.config.KEY_PROTOCOLS]: [
        {
          [constants.config.KEY_TYPE]: 'ipfs',
          [constants.config.KEY_DATA]: { topic: 'pnetwork-v3' },
        },
      ],
    }

    const pubsubModule = require('ptokens-utils').ipfs.pubsub

    const eventEmitter = new EventEmitter()

    jest.spyOn(pubsubModule, 'sub').mockResolvedValue(eventEmitter)

    const { getSyncStateAndUpdateTimestamps } = require('../lib/get-sync-state')
    getSyncStateAndUpdateTimestamps(state)

    return Promise.resolve(logic.sleepForXMilliseconds(100))
      .then(_ => eventEmitter.emit('message', JSON.stringify(guardianStatusSample)))
      .then(_ => logic.sleepForXMilliseconds(100))
      .then(_ => db.findReportById(actorsStorage, R.toLower(actorAddress), {}))
      .then(_result =>
        expect(_result).toMatchSnapshot({
          [MEM_TIMESTAMP]: expect.any(Number),
        })
      )
  })
})
