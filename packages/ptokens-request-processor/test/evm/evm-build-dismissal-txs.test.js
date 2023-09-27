const {
  STATE_TO_BE_DISMISSED_REQUESTS,
  STATE_DISMISSED_DB_REPORTS,
} = require('../../lib/state/constants')
const errors = require('../../lib/errors')
const constants = require('ptokens-constants')
const pTokensUtils = require('ptokens-utils')
const { utils } = require('ptokens-utils')
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

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce({
          [constants.evm.ethers.KEY_TX_HASH]:
            '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        })

      const txTimeout = 1000
      const destinationNetworkId = '0xf9b459a1'
      const providerUrl = 'http://localhost:8545'
      const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_TO_BE_DISMISSED_REQUESTS]: [queuedReports[1]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
            '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '98322',
            18,
            '200000',
            '0',
            '1000',
            '2000',
            '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
            '0x5aca268b',
            '0xf9b459a1',
            '0xb9286154',
            '0x5aca268b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7A',
            'pNetwork Token',
            'PNT',
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
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          [constants.db.KEY_FINAL_TX_HASH]:
            '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })

    it('Should build the dismissal and handle errors', async () => {
      const ethers = require('ethers')

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(pTokensUtils.errors.ERROR_TIMEOUT))

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
        [STATE_TO_BE_DISMISSED_REQUESTS]: [queuedReports[0]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
            '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '98322',
            18,
            '200000',
            '0',
            '1000',
            '2000',
            '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
            '0x5aca268b',
            '0xf9b459a1',
            '0xb9286154',
            '0x5aca268b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'pNetwork Token',
            'PNT',
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
      expect(result[STATE_TO_BE_DISMISSED_REQUESTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FAILED,
          [constants.db.KEY_FINAL_TX_HASH]: null,
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
          [constants.db.KEY_ERROR]: 'Error: Timeout',
        })
      )
    })

    it('Should build the dismissal and handle not-queued error', async () => {
      const ethers = require('ethers')

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockRejectedValueOnce(new Error(errors.ERROR_OPERATION_NOT_QUEUED)) // this report will go through

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
        [STATE_TO_BE_DISMISSED_REQUESTS]: [queuedReports[0]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
            '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '98322',
            18,
            '200000',
            '0',
            '1000',
            '2000',
            '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
            '0x5aca268b',
            '0xf9b459a1',
            '0xb9286154',
            '0x5aca268b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'pNetwork Token',
            'PNT',
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
      expect(result[STATE_TO_BE_DISMISSED_REQUESTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.CANCELLED,
          [constants.db.KEY_FINAL_TX_HASH]: '0x',
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })

    it('Should build the dismissal and handle underpriced replacement error', async () => {
      const ethers = require('ethers')

      jest.spyOn(utils, 'readIdentityFile').mockResolvedValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())
      jest.spyOn(ethers, 'Contract').mockImplementation(_ => jest.fn())

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      const callContractFunctionAndAwaitSpy = jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
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
        [STATE_TO_BE_DISMISSED_REQUESTS]: [queuedReports[0]],
      }

      const {
        maybeBuildDismissalTxsAndPutInState,
      } = require('../../lib/evm/evm-build-dismissal-txs')

      const result = await maybeBuildDismissalTxsAndPutInState(state)

      expect(callContractFunctionAndAwaitSpy).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwaitSpy).toHaveBeenNthCalledWith(
        1,
        'protocolGuardianCancelOperation',
        [
          [
            '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
            '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '98322',
            18,
            '200000',
            '0',
            '1000',
            '2000',
            '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
            '0x5aca268b',
            '0xf9b459a1',
            '0xb9286154',
            '0x5aca268b',
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
            'pNetwork Token',
            'PNT',
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
      expect(result[STATE_TO_BE_DISMISSED_REQUESTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS]).toHaveLength(1)
      expect(result[STATE_DISMISSED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: queuedReports[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FAILED,
          [constants.db.KEY_FINAL_TX_HASH]: null,
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
          [constants.db.KEY_ERROR]: 'Error: replacement transaction underpriced',
        })
      )
    })
  })
})
