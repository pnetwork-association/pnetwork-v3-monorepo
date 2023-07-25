const {
  STATE_TO_BE_DISMISSED_REQUESTS,
  STATE_DISMISSED_DB_REPORTS,
} = require('../../lib/state/constants')
const errors = require('../../lib/errors')
const constants = require('ptokens-constants')
const pTokensUtils = require('ptokens-utils')
const queuedReports = require('../samples/queued-report-set')

describe('Build dismissal test for EVM', () => {
  describe('maybeBuildDismissalTxsAndPutInState', () => {
    const emptyProof = '0x'
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    afterEach(async () => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the dismissal and add them to the state', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const cancelTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expectedCallResult = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: cancelTxHashes[0],
        },
        {
          [constants.evm.ethers.KEY_TX_HASH]: cancelTxHashes[1],
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
      const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_TO_BE_DISMISSED_REQUESTS]: [queuedReports[0], queuedReports[1]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(2)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2839',
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
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        2,
        'protocolGuardianCancelOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2840',
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
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(result).toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS)
      expect(result).toHaveProperty(STATE_DISMISSED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(2)

      expect(result[STATE_DISMISSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          [constants.db.KEY_FINAL_TX_HASH]: cancelTxHashes[0],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )

      expect(result[STATE_DISMISSED_DB_REPORTS][1]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          [constants.db.KEY_FINAL_TX_HASH]: cancelTxHashes[1],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })

    it('Should build the dismissal and handle errors', async () => {
      const ethers = require('ethers')
      const fs = require('fs/promises')

      jest.spyOn(fs, 'readFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(pTokensUtils.errors.ERROR_TIMEOUT))
        .mockRejectedValueOnce(new Error(errors.ERROR_OPERATION_NOT_QUEUED)) // this report will go through
        .mockRejectedValueOnce(new Error(errors.ERROR_REPLACEMENT_UNDERPRICED))
        .mockRejectedValueOnce(new Error('Generic Error'))

      const txTimeout = 1000
      const destinationNetworkId = '0xe15503e4'
      const providerUrl = 'http://localhost:8545'
      const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_TO_BE_DISMISSED_REQUESTS]: [
          queuedReports[0],
          queuedReports[1],
          queuedReports[2],
          queuedReports[3],
        ],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(4)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2839',
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
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        2,
        'protocolGuardianCancelOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2840',
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
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        3,
        'protocolGuardianCancelOperation',
        [
          [
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2820',
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
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        4,
        'protocolGuardianCancelOperation',
        [
          [
            '0xf085786d855e220305a67f95653bd9345956b211095b7403e54da1b40699cb86',
            '0x8ac05c2472b3a507f042557ee2c137d112a26d188fb267566b53c28975322452',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '6911',
            18,
            '7000000000000000000',
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
            '0xe15503e4',
            '0xe15503e4',
            '0xe15503e4',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'Token',
            'TKN',
            '0xc0ffee',
          ],
          emptyProof,
        ],
        expect.anything(),
        1000
      )
      expect(result).toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS)
      expect(result).toHaveProperty(STATE_DISMISSED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_TO_BE_DISMISSED_REQUESTS]).toHaveLength(4)
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(4)
      expect(result[STATE_DISMISSED_DB_REPORTS][1]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          [constants.db.KEY_FINAL_TX_HASH]: '0x',
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })
  })
})
