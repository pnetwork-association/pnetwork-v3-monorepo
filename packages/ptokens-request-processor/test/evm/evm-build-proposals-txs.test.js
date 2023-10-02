const {
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
} = require('../../lib/state/constants')
const { validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('../samples/detected-report-set')

describe('Build proposals test for EVM', () => {
  const expectedMockQueueCallArgs = [
    [
      '0x91b9a307ea6f003b2aea366def364f03c428e8d5d65a53862093471476d54b26',
      '0x5767cd95c0666933c6c79f29680e595c0d44e89f23107aafffa59b2ae1484174',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '89772',
      18,
      '100000',
      '0',
      '1500',
      '3000',
      '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
      '0x5aca268b',
      '0xf9b459a1',
      '0xb9286154',
      '0x5aca268b',
      '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
      '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
      'pNetwork Token',
      'PNT',
      '0x',
      false,
    ],
    { value: 1 },
  ]
  describe('makeProposalContractCall', () => {
    beforeAll(() => {
      jest.resetModules()
    })

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should enqueue a UserOperation as expected', async () => {
      const ethers = require('ethers')
      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      ]

      const expectedReceipt = {
        [constants.evm.ethers.KEY_TX_HASH]: proposedTxHashes[0],
      }

      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedReceipt),
      })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolQueueOperation: mockQueueOperation,
      }))

      const { makeProposalContractCall } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      await validation.validateJson(constants.db.schemas.eventReport, detectedEvents[0])

      const txTimeout = 1000 //ms
      const amountToLock = 1
      const result = await makeProposalContractCall(
        wallet,
        hubAddress,
        txTimeout,
        amountToLock,
        detectedEvents[0]
      )

      expect(mockQueueOperation).toHaveBeenCalledTimes(1)
      expect(mockQueueOperation).toHaveBeenCalledWith(...expectedMockQueueCallArgs)
      expect(result).toStrictEqual({
        ...detectedEvents[0],
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
        [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[0],
        [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
      })
    })
  })

  describe('buildProposalsTxsAndPutInState', () => {
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    beforeAll(() => {
      jest.resetModules()
    })

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should build the proposals and add them to the state', async () => {
      const ethers = require('ethers')
      const { utils } = require('ptokens-utils')
      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
      ]

      const expectedReceipt = {
        [constants.evm.ethers.KEY_TX_HASH]: proposedTxHashes[0],
      }

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedReceipt),
      })

      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolQueueOperation: mockQueueOperation,
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const txTimeout = 1000
      const networkId = '0xf9b459a1'
      const providerUrl = 'http://localhost:8545'
      const hubAddress = '0xc2d9c83d98ba36f295cf61b7496332075d16dc8e'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: networkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_DETECTED_DB_REPORTS]: [detectedEvents[0]],
      }

      const { buildProposalsTxsAndPutInState } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(mockQueueOperation).toHaveBeenCalledWith(...expectedMockQueueCallArgs)
      expect(mockLockedAmountChallengePeriod).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(1)

      expect(result[STATE_PROPOSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[0],
          [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
        })
      )
    })

    it('Should build the proposal and handle already queued error', async () => {
      const ethers = require('ethers')
      const { utils } = require('ptokens-utils')

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockQueueOperation = jest
        .fn()
        .mockRejectedValue(new Error(constants.evm.ethers.ERROR_ESTIMATE_GAS))
      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        interface: {
          parseError: jest.fn().mockReturnValue({
            name: 'OperationAlreadyQueued',
            args: [],
          }),
        },
        protocolQueueOperation: mockQueueOperation,
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const txTimeout = 1000
      const networkId = '0xf9b459a1'
      const providerUrl = 'http://localhost:8545'
      const hubAddress = '0xc2d9c83d98ba36f295cf61b7496332075d16dc8e'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: networkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_DETECTED_DB_REPORTS]: [detectedEvents[0]],
      }

      const { buildProposalsTxsAndPutInState } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(mockQueueOperation).toHaveBeenCalledWith(...expectedMockQueueCallArgs)
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(mockLockedAmountChallengePeriod).toHaveBeenCalledTimes(1)
      expect(result[STATE_DETECTED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_PROPOSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: '0x',
          [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
        })
      )
    })

    it('Should build the proposal and handle underpriced error', async () => {
      const ethers = require('ethers')
      const { utils } = require('ptokens-utils')

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockQueueOperation = jest
        .fn()
        .mockRejectedValue(new Error(constants.evm.ethers.ERROR_REPLACEMENT_UNDERPRICED))
      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolQueueOperation: mockQueueOperation,
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const txTimeout = 1000
      const networkId = '0xf9b459a1'
      const providerUrl = 'http://localhost:8545'
      const hubAddress = '0xc2d9c83d98ba36f295cf61b7496332075d16dc8e'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: networkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_DETECTED_DB_REPORTS]: [detectedEvents[0]],
      }

      const { buildProposalsTxsAndPutInState } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(mockQueueOperation).toHaveBeenNthCalledWith(1, ...expectedMockQueueCallArgs)
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(mockLockedAmountChallengePeriod).toHaveBeenCalledTimes(1)
      expect(result[STATE_DETECTED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_PROPOSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FAILED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: null,
          [constants.db.KEY_PROPOSAL_TS]: null,
          [constants.db.KEY_ERROR]: 'Error: replacement transaction underpriced',
        })
      )
    })
  })
})
