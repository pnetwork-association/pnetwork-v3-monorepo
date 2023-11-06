const ethers = require('ethers')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { MEM_ACTORS_PROPAGATED, MEM_ACTORS, MEM_CHALLENGES } = require('../../../lib/constants')
const { startChallenge } = require('../../../lib/chains/evm/start-challenge')
const startChallengeReceipt = require('./mock/start-challenge-receipt')
const actorsPropagatedSample = require('./mock/actors-propagated-sample')
const PNetworkHubAbi = require('../../../lib/chains/evm/abi/PNetworkHub.json')

describe('Start challenge tests on EVM chains', () => {
  describe('startChallenge', () => {
    let actorsStorage = null
    let challengesStorage = null
    let actorsPropagatedStorage = null

    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__

    // secretlint-disable-next-line
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

    beforeAll(async () => {
      actorsStorage = await db.getCollection(uri, dbName, MEM_ACTORS)
      challengesStorage = await db.getCollection(uri, dbName, MEM_CHALLENGES)
      actorsPropagatedStorage = await db.getCollection(uri, dbName, MEM_ACTORS_PROPAGATED)
      await db.insertReport(actorsPropagatedStorage, actorsPropagatedSample)
    })

    beforeEach(async () => {
      jest.restoreAllMocks()
      await actorsStorage.deleteMany({})
      await challengesStorage.deleteMany({})
    })

    afterAll(async () => {
      await db.closeConnection(uri)
    })

    it('Should start a challenge and update the relative report in the db', async () => {
      const hubAddress = '0xf28910cc8f21e9314eD50627c11De36bC0B7338F'
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const mockStartChallenge = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(startChallengeReceipt),
      })

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        startChallenge: mockStartChallenge,
        interface: hub.interface,
      }))

      const supportedChain = {
        [constants.config.KEY_CHAIN_NAME]: 'polygon',
        [constants.config.KEY_PROVIDER_URL]: 'https://localhost:8545',
        [constants.config.KEY_HUB_ADDRESS]: hubAddress,
      }

      const lockAmount = 2000
      const actorAddress = '0x95143f61674de69efb0f583df5342e42cd17c028'
      const actorType = 2
      const proof = []
      const networkId = '0xf9b459a1'
      const dryRun = false

      await startChallenge(
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

      const reports = await db.findReports(challengesStorage, {}, {})

      expect(reports).toHaveLength(1)
      expect(reports[0]).toMatchObject({
        _id: expect.stringMatching(`${networkId}`),
        nonce: expect.any(Number),
        actor: actorAddress,
        challenger: expect.any(String),
        actorType: constants.hub.actors.Sentinel,
        timestamp: expect.any(Number),
        networkId: networkId,
        status: constants.hub.challengeStatus.PENDING,
      })
    })
  })
})
