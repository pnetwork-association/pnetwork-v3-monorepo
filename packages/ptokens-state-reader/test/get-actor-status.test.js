const { db } = require('ptokens-utils')
const { MEM_ACTORS } = require('../lib/constants')
const constants = require('ptokens-constants')
const { getActorStatus } = require('../lib/get-actor-status')
const { refreshActorStatus } = require('../lib/refresh-actor-status')

describe('Get actor status tests', () => {
  let actorsStorage = null
  const currentEpoch = 1
  const actorAddress = '0xdB30d31Ce9A22f36a44993B1079aD2D201e11788'
  const uri = global.__MONGO_URI__
  const dbName = global.__MONGO_DB_NAME__

  beforeAll(async () => {
    actorsStorage = await db.getCollection(uri, dbName, MEM_ACTORS)
  })

  beforeEach(async () => {
    jest.restoreAllMocks()
    await actorsStorage.deleteMany({})
    await refreshActorStatus(actorsStorage, currentEpoch, actorAddress, {
      [constants.networkIds.BSC_MAINNET]: 'something',
      [constants.networkIds.POLYGON_MAINNET]: 'something',
    })
  })

  afterAll(async () => {
    await db.closeConnection(uri)
  })

  describe('getActorStatus', () => {
    it('Should get the correct actor status', async () => {
      const result = await getActorStatus(
        actorsStorage,
        actorAddress,
        constants.networkIds.POLYGON_MAINNET
      )

      expect(result).toStrictEqual(constants.hub.actorsStatus.Active)
    })
  })
})
