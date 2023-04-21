const constants = require('ptokens-constants')
const {
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
} = require('../../lib/state/constants')
const { jestMockContractConstructor } = require('./mock/jest-utils')
const proposedEvents = require('../samples/proposed-report-set')

describe('General final txs testing', () => {
  describe('makeFinalContractCall', () => {
    it('Should create a callIssue final transaction', async () => {
      const ethers = require('ethers')
      const finalizedTxHash = '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf'
      const expectedObject = { hash: finalizedTxHash }

      const mockExecuteOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(
          jestMockContractConstructor('protocolExecuteOperation', mockExecuteOperation)
        )

      const { makeFinalContractCall } = require('../../lib/evm/evm-build-final-txs')

      const wallet = ethers.Wallet.createRandom()
      const stateManagerAddress = '0xbae4957b7f913bdae17b31d8f32991ff88a12e37'
      const eventReport = proposedEvents[0]

      const timeout = 5000
      const result = await makeFinalContractCall(wallet, stateManagerAddress, timeout, eventReport)

      expect(mockExecuteOperation).toHaveBeenCalledTimes(1)
      expect(mockExecuteOperation).toHaveBeenCalledWith([
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
      expect(result).toMatchObject({
        [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        [constants.db.KEY_FINAL_TX_HASH]: finalizedTxHash,
        [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
      })
    })
  })

  describe('maybeBuildFinalTxsAndPutInState', () => {
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    beforeEach(async () => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the finalize transactions and add them to the state', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const finalizeTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expecteCallResult = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: finalizeTxHashes[0],
        },
        {
          [constants.evm.ethers.KEY_TX_HASH]: finalizeTxHashes[1],
        },
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce(expecteCallResult[0])
        .mockResolvedValueOnce(expecteCallResult[1])

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
        [STATE_PROPOSED_DB_REPORTS]: [proposedEvents[0], proposedEvents[1]],
      }

      const { maybeBuildFinalTxsAndPutInState } = require('../../lib/evm/evm-build-final-txs')

      const result = await maybeBuildFinalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(2)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolExecuteOperation',
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
        'protocolExecuteOperation',
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
      expect(result).toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_STATE_MANAGER_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(2)

      expect(result[STATE_FINALIZED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
          [constants.db.KEY_FINAL_TX_HASH]: finalizeTxHashes[0],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )

      expect(result[STATE_FINALIZED_DB_REPORTS][1]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
          [constants.db.KEY_FINAL_TX_HASH]: finalizeTxHashes[1],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })
  })
})
