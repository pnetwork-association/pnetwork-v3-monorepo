const {
  STATE_TO_BE_DISMISSED_REQUESTS,
  STATE_DISMISSED_DB_REPORTS,
} = require('../../lib/state/constants')
const errors = require('../../lib/errors')
const constants = require('ptokens-constants')
const queuedReports = require('../samples/queued-report-set')
const actorsPropagatedReportSet = require('../samples/actors-propagated-report-set')

describe('Build dismissal test for EVM', () => {
  const txTimeout = 1000
  const destinationNetworkId = '0xf9b459a1'
  const providerUrl = 'http://localhost:8545'
  const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'
  const proof = [
    '0xd2a063cb44962b73a9fb59d4eefa9be1382810cf6bb85c2769875a86c92ea4b5',
    '0x42a6a3a18f1c558fec27b5ea2b184f0c836be9b14a6b75144e70382ee01d6428',
  ]

  const expectedArgs1 = [
    [
      '0x05cf0e83408207704ee0ea2a4a6ea87905fc0d2038dbb610a0ca64f2cf47b134',
      '0xb1bb8b6502edc17fdd0cc83505289a6d429a6381ffe5dbf4fe31a88dd236d643',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '98322',
      18,
      '666002',
      '0',
      '1000',
      '2000',
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
    constants.hub.actors.Guardian,
    proof,
    expect.any(String),
  ]

  const expectedArgs2 = [
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
      '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
      '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
      'pNetwork Token',
      'PNT',
      '0x',
      false,
    ],
    constants.hub.actors.Guardian,
    proof,
    expect.any(String),
  ]

  describe('maybeBuildDismissalTxsAndPutInState', () => {
    const privKey = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    const gpgEncryptedFile = './identity.gpg'

    afterEach(async () => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the dismissal and add them to the state', async () => {
      const ethers = require('ethers')
      const { utils } = require('ptokens-utils')

      const mockProtocolCancel = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({
          [constants.evm.ethers.KEY_TX_HASH]:
            '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        }),
      })

      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolCancelOperation: mockProtocolCancel,
      }))

      const mockDb = {
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(actorsPropagatedReportSet),
          }),
        }),
      }

      const state = {
        [constants.state.KEY_DB]: mockDb,
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

      expect(mockProtocolCancel).toHaveBeenNthCalledWith(1, ...expectedArgs1)
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

    it('Should build the dismissal and handle not-queued error', async () => {
      const ethers = require('ethers')
      const { utils } = require('ptokens-utils')

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})

      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockDb = {
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(actorsPropagatedReportSet),
          }),
        }),
      }

      const error = new Error(constants.evm.ethers.ERROR_ESTIMATE_GAS)
      error.data = '0x'
      const mockProtocolCancel = jest.fn().mockRejectedValue(error)
      const fragment = {
        name: errors.ERROR_OPERATION_ALREADY_CANCELED,
        format: () => '0x',
      }

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolCancelOperation: mockProtocolCancel,
        interface: {
          parseError: jest.fn().mockReturnValue(new ethers.ErrorDescription(fragment, '', [])),
        },
      }))

      const state = {
        [constants.state.KEY_DB]: mockDb,
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

      expect(mockProtocolCancel).toHaveBeenNthCalledWith(1, ...expectedArgs2)
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
      const { utils } = require('ptokens-utils')

      jest.spyOn(ethers, 'JsonRpcProvider').mockReturnValue({})
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)

      const mockDb = {
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(actorsPropagatedReportSet),
          }),
        }),
      }

      const mockProtocolCancel = jest
        .fn()
        .mockRejectedValueOnce(new Error(errors.ERROR_REPLACEMENT_UNDERPRICED))
        .mockRejectedValueOnce(new Error('Generic Error'))

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolCancelOperation: mockProtocolCancel,
        interface: {
          parseError: jest.fn().mockResolvedValue({
            name: errors.ERROR_OPERATION_ALREADY_CANCELED,
          }),
        },
      }))

      const state = {
        [constants.state.KEY_DB]: mockDb,
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

      expect(mockProtocolCancel).toHaveBeenNthCalledWith(1, ...expectedArgs2)
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
