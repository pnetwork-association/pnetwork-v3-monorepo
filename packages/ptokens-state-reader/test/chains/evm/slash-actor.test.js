const ethers = require('ethers')
const constants = require('ptokens-constants')
const { db } = require('ptokens-utils')
const { slashActor } = require('../../../lib/chains/evm')
const { Challenge } = require('ptokens-constants/lib/hub')
const { insertChallengePending } = require('../../../lib/insert-challenge')
const PNetworkHubAbi = require('../../../lib/chains/evm/abi/PNetworkHub')
const actorsPropagatedSample = require('./mock/actors-propagated-sample')
const challengeUnsolvedSample = require('./mock/challenge-unsolved-event-sample')
const errorChallengeNotFoundSample = require('./mock/error-challenge-not-found-sample')
const errorActorSlashAlreadySample = require('./mock/error-actor-slashed-already-sample')
const { MEM_ACTORS, MEM_CHALLENGES, MEM_ACTORS_PROPAGATED } = require('../../../lib/constants')

describe('Test for slashing an actor', () => {
  describe('slashActor', () => {
    let actorsStorage = null
    let challengesStorage = null
    let actorsPropagatedStorage = null

    const uri = global.__MONGO_URI__
    const dbName = global.__MONGO_DB_NAME__

    // secretlint-disable-next-line
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    const dryRun = false

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

    it('Should handle the "ChallengeNotFound" error as expected', async () => {
      const hubAddress = '0x393ad7Bd0B94788b3B9EB15303E3845B4828E7Fb'
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const error = Object.assign(new Error(), errorChallengeNotFoundSample)

      const mockSlashActor = jest.fn().mockRejectedValue(error)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        slashByChallenge: mockSlashActor,
        interface: hub.interface,
      }))
      const supportedChain = {
        [constants.config.KEY_CHAIN_NAME]: 'bsc',
        [constants.config.KEY_NETWORK_ID]: '0x5aca268b',
        [constants.config.KEY_CHAIN_TYPE]: 'EVM',
        [constants.config.KEY_PROVIDER_URL]: 'https://localhost:8545',
        [constants.config.KEY_HUB_ADDRESS]: hubAddress,
      }

      const challenge = new Challenge({
        nonce: 16,
        actor: '0x7cdabc0ec492753ef724478a444914de9995d333',
        challenger: '0xe5de26b691d615353a03285405b6ee08c7974926',
        actorType: 2,
        timestamp: 1698744585,
        networkId: '0x5aca268b',
      })

      await insertChallengePending(challengesStorage, challenge)
      await slashActor(challengesStorage, privateKey, supportedChain, challenge, dryRun)

      const result = await db.findReports(challengesStorage, {})

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ...challenge,
        [constants.db.KEY_STATUS]: constants.hub.challengeStatus.NULL,
      })
    })

    it('Should handle when an actor has been slashed already', async () => {
      const hubAddress = '0x393ad7Bd0B94788b3B9EB15303E3845B4828E7Fb'
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)
      const error = Object.assign(new Error(), errorActorSlashAlreadySample)

      const mockSlashActor = jest.fn().mockRejectedValue(error)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        slashByChallenge: mockSlashActor,
        interface: hub.interface,
      }))
      const supportedChain = {
        [constants.config.KEY_CHAIN_NAME]: 'bsc',
        [constants.config.KEY_NETWORK_ID]: '0x5aca268b',
        [constants.config.KEY_CHAIN_TYPE]: 'EVM',
        [constants.config.KEY_PROVIDER_URL]: 'https://localhost:8545',
        [constants.config.KEY_HUB_ADDRESS]: hubAddress,
      }

      const challenge = new Challenge({
        nonce: 16,
        actor: '0x7cdabc0ec492753ef724478a444914de9995d333',
        challenger: '0xe5de26b691d615353a03285405b6ee08c7974926',
        actorType: 2,
        timestamp: 1698744585,
        networkId: '0x5aca268b',
      })

      await insertChallengePending(challengesStorage, challenge)

      await slashActor(challengesStorage, privateKey, supportedChain, challenge, dryRun)

      const result = await db.findReports(challengesStorage, {})

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ...challenge,
        [constants.db.KEY_STATUS]: constants.hub.challengeStatus.UNSOLVED,
      })
    })

    it('Should set the challenge to unsolved accordingly in the db after a slash', async () => {
      const hubAddress = '0x393ad7Bd0B94788b3B9EB15303E3845B4828E7Fb'
      const hub = new ethers.Contract(hubAddress, PNetworkHubAbi, null)

      const mockSlashActor = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(challengeUnsolvedSample),
      })

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue()
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        slashByChallenge: mockSlashActor,
        interface: hub.interface,
      }))
      const supportedChain = {
        [constants.config.KEY_CHAIN_NAME]: 'bsc',
        [constants.config.KEY_NETWORK_ID]: '0x5aca268b',
        [constants.config.KEY_CHAIN_TYPE]: 'EVM',
        [constants.config.KEY_PROVIDER_URL]: 'https://localhost:8545',
        [constants.config.KEY_HUB_ADDRESS]: hubAddress,
      }

      const challenge = new Challenge({
        nonce: 16,
        actor: '0x7cdabc0ec492753ef724478a444914de9995d333',
        challenger: '0xe5de26b691d615353a03285405b6ee08c7974926',
        actorType: 2,
        timestamp: 1698744585,
        networkId: '0x5aca268b',
      })

      await insertChallengePending(challengesStorage, challenge)

      await slashActor(challengesStorage, privateKey, supportedChain, challenge, dryRun)

      const result = await db.findReports(challengesStorage, {})

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        ...challenge,
        [constants.db.KEY_STATUS]: constants.hub.challengeStatus.UNSOLVED,
      })
    })
  })
})
