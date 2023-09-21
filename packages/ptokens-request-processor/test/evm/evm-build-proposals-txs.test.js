const { jestMockContractConstructor } = require('./mock/jest-utils')
const {
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
} = require('../../lib/state/constants')
const {
  ERROR_OPERATION_ALREADY_QUEUED,
  ERROR_REPLACEMENT_UNDERPRICED,
} = require('../../lib/errors')
const { errors, validation, utils } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('../samples/detected-report-set')

describe('Build proposals test for EVM', () => {
  describe('makeProposalContractCall', () => {
    beforeAll(() => {
      jest.resetModules()
    })

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('Should create a pegOut proposal as expected', async () => {
      const ethers = require('ethers')
      const proposedTxHash = '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf'
      const expectedObject = {
        [constants.evm.ethers.KEY_TX_HASH]: proposedTxHash,
      }

      const mockQueueOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(
          jestMockContractConstructor('protocolQueueOperation', mockQueueOperation)
        )

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
      expect(mockQueueOperation).toHaveBeenCalledWith(
        [
          '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
          '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '85671',
          6,
          '1455000000000000',
          '0',
          '0',
          '0',
          '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
          '0xd41b1c5b',
          '0xf9b459a1',
          '0xfc8ebb2b',
          '0xd41b1c5b',
          '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          'USD//C on xDai',
          'USDC',
          '0x',
        ],
        { value: 1 }
      )
      expect(result).toStrictEqual({
        ...detectedEvents[0],
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
        [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHash,
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

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const proposedTxHashes = [
        '0x630dedecd876b375250f42afbc9e7e4a26f2c9ebf50db49dca6092d16190e4c3',
      ]

      const expectedCallResult = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: proposedTxHashes[0],
        },
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce(expectedCallResult[0])

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

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
            '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '85671',
            6,
            '1455000000000000',
            '0',
            '0',
            '0',
            '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
            '0xd41b1c5b',
            '0xf9b459a1',
            '0xfc8ebb2b',
            '0xd41b1c5b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'USD//C on xDai',
            'USDC',
            '0x',
          ],
          { value: 1 },
        ],
        expect.anything(),
        1000
      )

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

    it('Should build the proposal and handle timeout error', async () => {
      const ethers = require('ethers')

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(errors.ERROR_TIMEOUT))

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

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
            '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '85671',
            6,
            '1455000000000000',
            '0',
            '0',
            '0',
            '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
            '0xd41b1c5b',
            '0xf9b459a1',
            '0xfc8ebb2b',
            '0xd41b1c5b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'USD//C on xDai',
            'USDC',
            '0x',
          ],
          { value: 1 },
        ],
        expect.anything(),
        txTimeout
      )
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
          [constants.db.KEY_ERROR]: 'Error: Timeout',
        })
      )
    })

    it('Should build the proposal and handle already queued error', async () => {
      const ethers = require('ethers')

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(ERROR_OPERATION_ALREADY_QUEUED)) // this report will go through)

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

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
            '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '85671',
            6,
            '1455000000000000',
            '0',
            '0',
            '0',
            '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
            '0xd41b1c5b',
            '0xf9b459a1',
            '0xfc8ebb2b',
            '0xd41b1c5b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'USD//C on xDai',
            'USDC',
            '0x',
          ],
          { value: 1 },
        ],
        expect.anything(),
        txTimeout
      )
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

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const mockLockedAmountChallengePeriod = jest.fn().mockResolvedValue(1)
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        lockedAmountChallengePeriod: mockLockedAmountChallengePeriod,
      }))

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(ERROR_REPLACEMENT_UNDERPRICED))

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

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
            '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '85671',
            6,
            '1455000000000000',
            '0',
            '0',
            '0',
            '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
            '0xd41b1c5b',
            '0xf9b459a1',
            '0xfc8ebb2b',
            '0xd41b1c5b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'USD//C on xDai',
            'USDC',
            '0x',
          ],
          { value: 1 },
        ],
        expect.anything(),
        txTimeout
      )
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
