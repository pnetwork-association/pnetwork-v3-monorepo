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
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7A',
            'USD//C on xDai',
            'USDC',
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
