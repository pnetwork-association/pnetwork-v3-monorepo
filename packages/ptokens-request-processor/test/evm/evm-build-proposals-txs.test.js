const { jestMockContractConstructor } = require('./mock/jest-utils')
const {
  STATE_DETECTED_DB_REPORTS,
  STATE_PROPOSED_DB_REPORTS,
} = require('../../lib/state/constants')
const {
  ERROR_OPERATION_ALREADY_QUEUED,
  ERROR_REPLACEMENT_UNDERPRICED,
} = require('../../lib/errors')
const { errors, validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('../samples/detected-report-set')

describe('Build proposals test for EVM', () => {
  describe('makeProposalContractCall', () => {
    afterEach(() => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    const eventReport = detectedEvents[0]

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
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      await validation.validateJson(constants.db.schemas.eventReport, eventReport)

      const txTimeout = 1000 //ms
      const result = await makeProposalContractCall(
        wallet,
        stateManagerAddress,
        txTimeout,
        eventReport
      )

      expect(mockQueueOperation).toHaveBeenCalledTimes(1)
      expect(mockQueueOperation).toHaveBeenCalledWith([
        '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
        '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '6648',
        18,
        '1000000000000000000',
        '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
        '0xe15503e4',
        '0xe15503e4',
        '0xe15503e4',
        '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        'Token',
        'TKN',
        '0x',
      ])
      expect(result).toStrictEqual({
        ...eventReport,
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
        [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHash,
        [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
      })
    })

    // it('Should handle the timeout error correctly', async () => {
    //   const ethers = require('ethers')

    //   const mockProtocolQueueOperation = jest.fn().mockResolvedValue({
    //     wait: jest
    //       .fn()
    //       .mockImplementation(() => logic.sleepForXMilliseconds(1000)),
    //   })

    //   jest
    //     .spyOn(ethers, 'Contract')
    //     .mockImplementation(
    //       jestMockContractConstructor(
    //         'protocolQueueOperation',
    //         mockProtocolQueueOperation
    //       )
    //     )

    //   const {
    //     makeProposalContractCall,
    //   } = require('../../lib/evm/evm-build-proposals-txs')

    //   const wallet = ethers.Wallet.createRandom()
    //   const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

    //   await validation.validateJson(constants.db.schemas.eventReport, eventReport)

    //   const txTimeout = 100 //ms
    //   const result = await makeProposalContractCall(
    //     wallet,
    //     stateManagerAddress,
    //     txTimeout,
    //     eventReport
    //   )
    //   expect(result).toStrictEqual(eventReport)
    // })
  })

  describe('buildProposalsTxsAndPutInState', () => {
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    afterEach(async () => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the proposals and add them to the state', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expectedCallResult = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: proposedTxHashes[0],
        },
        {
          [constants.evm.ethers.KEY_TX_HASH]: proposedTxHashes[1],
        },
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce(expectedCallResult[0])
        .mockResolvedValueOnce(expectedCallResult[1])

      const txTimeout = 1000
      const destinationNetworkId = '0xe15503e4'
      const providerUrl = 'http://localhost:8545'
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_STATE_MANAGER_ADDRESS]: stateManagerAddress,
        [STATE_DETECTED_DB_REPORTS]: [detectedEvents[0], detectedEvents[1]],
      }

      const { buildProposalsTxsAndPutInState } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(2)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '1000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        2,
        'protocolQueueOperation',
        [
          [
            '0xbfed1379abf5ebce29b4f74a4159a0795f42f97b260199d05acdcb567d0b0b85',
            '0xed4fc787108745e0414cdcd24fe82afd82bbbb60d4976feefb6687253d558be8',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '2000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_STATE_MANAGER_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(2)

      expect(result[STATE_PROPOSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[0],
          [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
        })
      )

      expect(result[STATE_PROPOSED_DB_REPORTS][1]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[1],
          [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
        })
      )
    })

    it('Should build the proposals and handle errors', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const expectedCallResult = [
        new Error(errors.ERROR_TIMEOUT),
        new Error(ERROR_OPERATION_ALREADY_QUEUED), // this report will go through
        new Error(ERROR_REPLACEMENT_UNDERPRICED),
        new Error('Generic Error'),
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(expectedCallResult[0])
        .mockRejectedValueOnce(expectedCallResult[1])
        .mockRejectedValueOnce(expectedCallResult[2])
        .mockRejectedValueOnce(expectedCallResult[3])

      const txTimeout = 1000
      const destinationNetworkId = '0xe15503e4'
      const providerUrl = 'http://localhost:8545'
      const stateManagerAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_STATE_MANAGER_ADDRESS]: stateManagerAddress,
        [STATE_DETECTED_DB_REPORTS]: [
          detectedEvents[0],
          detectedEvents[1],
          detectedEvents[2],
          detectedEvents[3],
        ],
      }

      const { buildProposalsTxsAndPutInState } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(4)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolQueueOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '1000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        2,
        'protocolQueueOperation',
        [
          [
            '0xbfed1379abf5ebce29b4f74a4159a0795f42f97b260199d05acdcb567d0b0b85',
            '0xed4fc787108745e0414cdcd24fe82afd82bbbb60d4976feefb6687253d558be8',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '2000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        3,
        'protocolQueueOperation',
        [
          [
            '0x51a7df3cedcc76917b037b74bdd82a315f812a0cdbcac7ad70a8bce9d4150af4',
            '0xfad8f21a2981f49eafe79334d5b4b81fa95db5a1e40f0f633a22ad7e55b793a4',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '3000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        4,
        'protocolQueueOperation',
        [
          [
            '0x1ed0f553eded679ce381d6d6d542971fec13b461035d0ebbfb8175910c5cd775',
            '0x037a7080ea701a0bf91b4f8a5f5671c3565da3dbcda916938eb597f9b4dcab2c',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6648',
            18,
            '4000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0x',
          ],
        ],
        expect.anything(),
        1000
      )
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_STATE_MANAGER_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_DETECTED_DB_REPORTS]).toHaveLength(4)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_PROPOSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: detectedEvents[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
          [constants.db.KEY_PROPOSAL_TX_HASH]: '0x',
          [constants.db.KEY_PROPOSAL_TS]: expect.any(String),
        })
      )
    })
  })
})
