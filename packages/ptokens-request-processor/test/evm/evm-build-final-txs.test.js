const constants = require('ptokens-constants')
const {
  STATE_PROPOSED_DB_REPORTS,
  STATE_FINALIZED_DB_REPORTS,
} = require('../../lib/state/constants')
const detectedReportSet = require('../samples/detected-report-set')
const proposedTxHashes = [
  '0x581fc809a1d55b8aa4205a282c2387a7092f93749167bc2c7600f9742de71347',
  '0x50ba7f00fd190a90bb90e2b9f8af1f4ad61d54e5f24585389021c82f21a3789c',
]

const proposedEvents = detectedReportSet.map((_elem, _index) => ({
  ..._elem,
  [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
  [constants.db.KEY_PROPOSAL_TS]: new Date().toISOString(),
  [constants.db.KEY_PROPOSAL_TX_HASH]: proposedTxHashes[_index],
}))

const expectedMockExecuteCallArgs = [
  [
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
  ],
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
      '0xddb5f4535123daa5ae343c24006f4075abaf5f7b',
      '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
      'pNetwork Token',
      'PNT',
      '0x',
      false,
    ],
  ],
]

const txTimeout = 1000
const destinationNetworkId = '0xf9b459a1'
const providerUrl = 'http://localhost:8545'
const hubAddress = '0xC8E4270a6EF24B67eD38046318Fc8FC2d312f73C'

const executeTxHashes = [
  '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
  '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
]

describe('General final txs testing', () => {
  describe('makeFinalContractCall', () => {
    it('Should execute a previously queued operation', async () => {
      const ethers = require('ethers')
      const finalizedTxHash = '0xce3c89b5ddf1d1a21819fa91afc880dadd14847894c6e6acbab58f2522d4cd57'

      const expectedObject = {
        [constants.evm.ethers.KEY_TX_HASH]: finalizedTxHash,
      }

      const mockExecuteOperation = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolExecuteOperation: mockExecuteOperation,
      }))

      const { makeFinalContractCall } = require('../../lib/evm/evm-build-final-txs')

      const wallet = ethers.Wallet.createRandom()
      const hubAddress = '0xbae4957b7f913bdae17b31d8f32991ff88a12e37'
      const eventReport = proposedEvents[0]

      const timeout = 5000
      const result = await makeFinalContractCall(wallet, hubAddress, timeout, eventReport)

      expect(mockExecuteOperation).toHaveBeenCalledTimes(1)
      expect(mockExecuteOperation).toHaveBeenCalledWith(...expectedMockExecuteCallArgs[0])
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

    it('Should build the execute transactions and add them to the state', async () => {
      const ethers = require('ethers')
      const { logic, utils } = require('ptokens-utils')

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const expectedCallResult = [
        {
          [constants.evm.ethers.KEY_TX_HASH]: executeTxHashes[0],
        },
        {
          [constants.evm.ethers.KEY_TX_HASH]: executeTxHashes[1],
        },
      ]

      const mockExecuteOperation = jest.fn().mockResolvedValue({
        wait: jest
          .fn()
          .mockResolvedValueOnce(expectedCallResult[0])
          .mockResolvedValueOnce(expectedCallResult[1]),
      })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        protocolExecuteOperation: mockExecuteOperation,
      }))

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_PROPOSED_DB_REPORTS]: [proposedEvents[0], proposedEvents[1]],
      }

      const { maybeBuildFinalTxsAndPutInState } = require('../../lib/evm/evm-build-final-txs')

      const result = await maybeBuildFinalTxsAndPutInState(state)

      expect(mockExecuteOperation).toHaveBeenCalledTimes(2)
      expect(mockExecuteOperation).toHaveBeenNthCalledWith(1, ...expectedMockExecuteCallArgs[0])
      expect(mockExecuteOperation).toHaveBeenNthCalledWith(2, ...expectedMockExecuteCallArgs[1])
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(2)

      expect(result[STATE_FINALIZED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: proposedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
          [constants.db.KEY_FINAL_TX_HASH]: executeTxHashes[0],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )

      expect(result[STATE_FINALIZED_DB_REPORTS][1]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: proposedEvents[1][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
          [constants.db.KEY_FINAL_TX_HASH]: executeTxHashes[1],
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })

    it('Should build the finalize transactions and handle errors', async () => {
      const { logic, utils } = require('ptokens-utils')
      const ethers = require('ethers')

      jest.spyOn(logic, 'sleepForXMilliseconds').mockImplementation(_ => Promise.resolve())
      jest.spyOn(utils, 'readIdentityFileSync').mockReturnValue(privKey)
      jest.spyOn(ethers, 'JsonRpcProvider').mockResolvedValue({})
      jest.spyOn(ethers, 'Wallet').mockImplementation(_ => jest.fn())

      const mockExecuteOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error(constants.evm.ethers.ERROR_ESTIMATE_GAS))
        .mockResolvedValueOnce({
          wait: jest
            .fn()
            .mockResolvedValue({ [constants.evm.ethers.KEY_TX_HASH]: executeTxHashes[0] }),
        })

      jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
        interface: {
          parseError: jest.fn().mockReturnValue({
            name: 'OperationAlreadyExecuted',
            args: [],
          }),
        },
        protocolExecuteOperation: mockExecuteOperation,
      }))

      const state = {
        [constants.state.KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.KEY_PROVIDER_URL]: providerUrl,
        [constants.state.KEY_NETWORK_ID]: destinationNetworkId,
        [constants.state.KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.KEY_HUB_ADDRESS]: hubAddress,
        [STATE_PROPOSED_DB_REPORTS]: [proposedEvents[0], proposedEvents[1]],
      }

      const { maybeBuildFinalTxsAndPutInState } = require('../../lib/evm/evm-build-final-txs')

      const result = await maybeBuildFinalTxsAndPutInState(state)

      expect(mockExecuteOperation).toHaveBeenCalledTimes(2)
      expect(mockExecuteOperation).toHaveBeenNthCalledWith(1, ...expectedMockExecuteCallArgs[0])
      expect(mockExecuteOperation).toHaveBeenNthCalledWith(2, ...expectedMockExecuteCallArgs[1])
      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(result).toHaveProperty(STATE_FINALIZED_DB_REPORTS)
      expect(result).toHaveProperty(constants.state.KEY_NETWORK_ID)
      expect(result).toHaveProperty(constants.state.KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(constants.state.KEY_HUB_ADDRESS)
      expect(result).toHaveProperty(constants.state.KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(2)
      expect(result[STATE_FINALIZED_DB_REPORTS]).toHaveLength(2)
      expect(result[STATE_FINALIZED_DB_REPORTS][0]).toEqual(
        expect.objectContaining({
          [constants.db.KEY_ID]: proposedEvents[0][constants.db.KEY_ID],
          [constants.db.KEY_STATUS]: constants.db.txStatus.FINALIZED,
          [constants.db.KEY_FINAL_TX_HASH]: '0x',
          [constants.db.KEY_FINAL_TX_TS]: expect.any(String),
        })
      )
    })
  })
})
