const {
  STATE_TO_BE_DISMISSED_REQUESTS_KEY,
  STATE_DISMISSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const schemas = require('ptokens-schemas')
const constants = require('ptokens-constants')
const queuedReports = require('../samples/queued-report-set')

describe('Build proposals test for EVM', () => {
  describe('maybeBuildDismissalTxsAndPutInState', () => {
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

      const cancelTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]

      const expecteCallResult = [
        {
          [constants.misc.ETHERS_KEY_TX_HASH]: cancelTxHashes[0],
        },
        {
          [constants.misc.ETHERS_KEY_TX_HASH]: cancelTxHashes[1],
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
        [constants.state.STATE_KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.STATE_KEY_PROVIDER_URL]: providerUrl,
        [constants.state.STATE_KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.STATE_KEY_STATE_MANAGER_ADDRESS]: stateManagerAddress,
        [STATE_TO_BE_DISMISSED_REQUESTS_KEY]: [queuedReports[0], queuedReports[1]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(2)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolCancelOperation',
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
        ],
        expect.anything(),
        1000
      )
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        2,
        'protocolCancelOperation',
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
        ],
        expect.anything(),
        1000
      )
      expect(result).toHaveProperty(STATE_TO_BE_DISMISSED_REQUESTS_KEY)
      expect(result).toHaveProperty(STATE_DISMISSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.STATE_KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.STATE_KEY_STATE_MANAGER_ADDRESS)
      expect(result).toHaveProperty(constants.state.STATE_KEY_TX_TIMEOUT)
      expect(result[STATE_DISMISSED_DB_REPORTS_KEY]).toHaveLength(2)

      expect(result[STATE_DISMISSED_DB_REPORTS_KEY][0]).toEqual(
        expect.objectContaining({
          [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
          [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: cancelTxHashes[0],
          [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: expect.any(String),
        })
      )

      expect(result[STATE_DISMISSED_DB_REPORTS_KEY][1]).toEqual(
        expect.objectContaining({
          [schemas.constants.reportFields.SCHEMA_STATUS_KEY]: schemas.db.enums.txStatus.CANCELLED,
          [schemas.constants.reportFields.SCHEMA_FINAL_TX_HASH_KEY]: cancelTxHashes[1],
          [schemas.constants.reportFields.SCHEMA_FINAL_TX_TS_KEY]: expect.any(String),
        })
      )
    })
  })
})
