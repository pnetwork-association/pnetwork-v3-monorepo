const ethers = require('ethers')
const assert = require('assert')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const {
  MEM_ACTORS_PROPAGATED,
  MEM_ACTORS,
  MEM_CHALLENGES,
  MEM_ACTOR_STATUS,
} = require('../../../lib/constants')
const { refreshActorStatus } = require('../../../lib/refresh-actor-status')
const getActorStatusModule = require('../../../lib/get-actor-status')
const startChallengeReceipt = require('./mock/start-challenge-receipt')
const actorsPropagatedSample = require('./mock/actors-propagated-sample')
const PNetworkHubAbi = require('../../../lib/chains/evm/abi/PNetworkHub.json')
const alreadyChallengedErrorSample = require('./mock/error-already-challenged-sample.json')
const { getActorFromStorage } = require('../../../lib/get-actor-from-storage')
const {
  updateActorsPropagatedEventInStorage,
} = require('../../../lib/update-actors-propagated-event')

describe('Start challenge tests on EVM chains', () => {
  describe('startChallenge', () => {
    let actorsStorage = null
    let challengesStorage = null
    let actorsPropagatedStorage = null

    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__
    const actorAddress = '0x95143f61674de69efb0f583df5342e42cd17c028'
    const hubAddress = '0xf28910cc8f21e9314eD50627c11De36bC0B7338F'
    const lockAmount = 2000
    const actorType = 2
    const proof = []
    const networkId = '0xf9b459a1'
    const dryRun = false

    const supportedChain = {
      [constants.config.KEY_NETWORK_ID]: networkId,
      [constants.config.KEY_CHAIN_NAME]: 'polygon',
      [constants.config.KEY_PROVIDER_URL]: 'https://localhost:8545',
      [constants.config.KEY_HUB_ADDRESS]: hubAddress,
    }

    // secretlint-disable-next-line
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

    beforeAll(async () => {
      actorsStorage = await db.getCollection(uri, dbName, MEM_ACTORS)
      challengesStorage = await db.getCollection(uri, dbName, MEM_CHALLENGES)
      actorsPropagatedStorage = await db.getCollection(uri, dbName, MEM_ACTORS_PROPAGATED)
      await updateActorsPropagatedEventInStorage(actorsPropagatedStorage, actorsPropagatedSample)
    })

    beforeEach(async () => {
      jest.restoreAllMocks()
      await actorsStorage.deleteMany({})
      await challengesStorage.deleteMany({})
      await refreshActorStatus(actorsStorage, actorAddress, {
        [constants.networkIds.BSC_MAINNET]: 'something',
        [constants.networkIds.POLYGON_MAINNET]: 'something',
      })
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should start a challenge and update the relative report in the db if the actor is Active', async () => {
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const mockStartChallenge = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(startChallengeReceipt),
      })

      jest.spyOn(getActorStatusModule, 'isActorStatusActive').mockResolvedValue(true)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        startChallenge: mockStartChallenge,
        interface: hub.interface,
      }))

      const { startChallenge } = require('../../../lib/chains/evm/start-challenge')
      await startChallenge(
        actorsStorage,
        challengesStorage,
        supportedChain,
        privateKey,
        lockAmount,
        actorAddress,
        actorType,
        proof,
        networkId,
        dryRun
      )

      const newActor = await getActorFromStorage(actorsStorage, actorAddress)
      const newChallenge = await db.findReports(challengesStorage, {}, {})

      expect(newActor).toHaveProperty(
        [MEM_ACTOR_STATUS, constants.networkIds.POLYGON_MAINNET],
        constants.hub.actorsStatus.Challenged
      )
      expect(newChallenge).toHaveLength(1)
      expect(newChallenge[0]).toMatchSnapshot()
    })

    it('Should skip an already challenged actor correctly', async () => {
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const error = Object.assign(new Error(), alreadyChallengedErrorSample)
      const mockStartChallenge = jest.fn().mockRejectedValue(error)

      jest.spyOn(getActorStatusModule, 'isActorStatusActive').mockResolvedValue(true)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        startChallenge: mockStartChallenge,
        interface: hub.interface,
      }))

      const { startChallenge } = require('../../../lib/chains/evm/start-challenge')
      await startChallenge(
        actorsStorage,
        challengesStorage,
        supportedChain,
        privateKey,
        lockAmount,
        actorAddress,
        actorType,
        proof,
        networkId,
        dryRun
      )

      const newActor = await getActorFromStorage(actorsStorage, actorAddress)
      expect(newActor).toHaveProperty(
        [MEM_ACTOR_STATUS, constants.networkIds.POLYGON_MAINNET],
        constants.hub.actorsStatus.Challenged
      )
    })

    it('Should catch and reject an error correctly', async () => {
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const errMsg = 'An unknown error'
      const error = new Error(errMsg)
      const mockStartChallenge = jest.fn().mockRejectedValue(error)

      jest.spyOn(getActorStatusModule, 'isActorStatusActive').mockResolvedValue(true)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        startChallenge: mockStartChallenge,
        interface: hub.interface,
      }))

      const { startChallenge } = require('../../../lib/chains/evm/start-challenge')
      try {
        await startChallenge(
          actorsStorage,
          challengesStorage,
          supportedChain,
          privateKey,
          lockAmount,
          actorAddress,
          actorType,
          proof,
          networkId,
          dryRun
        )
        assert.fail('Should never reach here')
      } catch (e) {
        expect(e.message).toStrictEqual(errMsg)
      }
    })
  })
})
