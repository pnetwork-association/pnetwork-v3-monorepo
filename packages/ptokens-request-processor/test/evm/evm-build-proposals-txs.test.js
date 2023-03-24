const fs = require('fs')
const {
  jestMockEthers,
  jestMockContractConstructor,
} = require('./mock/jest-utils')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')
const schemas = require('ptokens-schemas')
const { errors, validation } = require('ptokens-utils')
const constants = require('ptokens-constants')
const detectedEvents = require('../samples/detected-report-set')

describe('Build proposals test for EVM', () => {
  describe('makeProposalContractCall', () => {
    afterEach(() => {
      jest.restoreAllMocks()
      jest.resetModules()
    })

    const eventReport = {
      _id: '0x005fe7f9_0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
      [schemas.constants.SCHEMA_STATUS_KEY]: 'detected',
      [schemas.constants.SCHEMA_AMOUNT_KEY]: '1111111',
      [schemas.constants.SCHEMA_EVENT_NAME_KEY]: 'redeem',
      [schemas.constants.SCHEMA_ORIGINATING_CHAIN_ID_KEY]: '0x005fe7f9',
      [schemas.constants.SCHEMA_DESTINATION_CHAIN_ID_KEY]: '0x01ec97de',
      [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
        '11eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
      [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
        '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4]',
      [schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]:
        '0xdaacb0ab6fb34d24e8a67bfa14bf4d95d4c7af92',
      [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]:
        '0x9f5377fa03dcd4016a33669b385be4d0e02f27bc',
      [schemas.constants.SCHEMA_WITNESSED_TS_KEY]: '2023-03-07T16:11:38.835Z',
      [schemas.constants.SCHEMA_USER_DATA_KEY]: null,
      [schemas.constants.SCHEMA_FINAL_TX_HASH_KEY]: null,
      [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: null,
      [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: null,
      [schemas.constants.SCHEMA_FINAL_TX_TS_KEY]: null,
    }

    it('Should create a pegOut proposal as expected', async () => {
      const ethers = jestMockEthers()
      const proposedTxHash =
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf'
      const expectedObject = { transactionHash: proposedTxHash }

      const mockPegOut = jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue(expectedObject),
      })

      ethers.Contract = jestMockContractConstructor('pegOut', mockPegOut)

      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const issuanceManagerAddress =
        '0xbae4957b7f913bdae17b31d8f32991ff88a12e37'
      const redeemManagerAddress = '0x341aa660fd5c280f5a9501e3822bb4a98e816d1b'

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const txTimeout = 1000 //ms
      const result = await makeProposalContractCall(
        wallet,
        issuanceManagerAddress,
        redeemManagerAddress,
        txTimeout,
        eventReport
      )

      expect(result).toStrictEqual({
        ...eventReport,
        [schemas.constants.SCHEMA_STATUS_KEY]:
          schemas.db.enums.txStatus.PROPOSED,
        [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHash,
        [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
      })
    })

    it('Should handle the timeout error correctly', async () => {
      const ethers = require('ethers')

      const contractFunctionModule = require('../../lib/evm/evm-call-contract-function')
      const callContractFunctionAndAwait = jest
        .spyOn(contractFunctionModule, 'callContractFunctionAndAwait')
        .mockImplementation(() =>
          Promise.reject(new Error(errors.ERROR_TIMEOUT))
        )

      const {
        makeProposalContractCall,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const wallet = ethers.Wallet.createRandom()
      const issuanceManagerAddress =
        '0xbae4957b7f913bdae17b31d8f32991ff88a12e37'
      const redeemManagerAddress = '0x341aa660fd5c280f5a9501e3822bb4a98e816d1b'

      await validation.validateJson(schemas.db.collections.events, eventReport)

      const txTimeout = 100 //ms
      const result = await makeProposalContractCall(
        wallet,
        issuanceManagerAddress,
        redeemManagerAddress,
        txTimeout,
        eventReport
      )

      expect(callContractFunctionAndAwait).toHaveBeenCalledTimes(1)
      expect(callContractFunctionAndAwait).rejects.toThrow(errors.ERROR_TIMEOUT)
      expect(result).toStrictEqual(undefined)
    })
  })

  describe('buildProposalsTxsAndPutInState', () => {
    const gpgEncryptedFile = './identity.gpg'
    const privKey =
      '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'
    beforeEach(() => {
      fs.writeFileSync(gpgEncryptedFile, privKey)
    })

    afterEach(() => {
      fs.rmSync(gpgEncryptedFile)
      jest.restoreAllMocks()
      jest.resetModules()
    })

    it('Should build the proposals and add them to the state', async () => {
      const ethers = jestMockEthers()

      ethers.providers = {
        JsonRpcProvider: jest.fn().mockResolvedValue({}),
      }

      ethers.Wallet = function () {
        return jest.fn()
      }

      ethers.Contract = function () {
        return jest.fn()
      }

      const proposedTxHashes = [
        '0xd656ffac17b71e2ea2e24f72cd4c15c909a0ebe1696f8ead388eb268268f1cbf',
        '0x2c7e8870be7643d97699bbcf3396dfb13217ee54a6784abfcacdb1e077fe201f',
      ]
      const expecteCallResult = [
        {
          transactionHash: proposedTxHashes[0],
        },
        {
          transactionHash: proposedTxHashes[1],
        },
      ]

      const callContractFunctionModule = require('../../lib/evm/evm-call-contract-function')

      jest
        .spyOn(callContractFunctionModule, 'callContractFunctionAndAwait')
        .mockResolvedValueOnce(expecteCallResult[0])
        .mockResolvedValueOnce(expecteCallResult[1])

      const txTimeout = 1000
      const destinationChainId = '0x01ec97de'
      const providerUrl = 'http://localhost:8545'
      const issuanceManagerAddress =
        '0xbae4957b7f913bdae17b31d8f32991ff88a12e37'
      const redeemManagerAddress = '0x341aa660fd5c280f5a9501e3822bb4a98e816d1b'

      const state = {
        [constants.state.STATE_KEY_TX_TIMEOUT]: txTimeout,
        [constants.state.STATE_KEY_PROVIDER_URL]: providerUrl,
        [constants.state.STATE_KEY_CHAIN_ID]: destinationChainId,
        [constants.state.STATE_KEY_IDENTITY_FILE]: gpgEncryptedFile,
        [constants.state.STATE_KEY_REDEEM_MANAGER_ADDRESS]:
          redeemManagerAddress,
        [constants.state.STATE_KEY_ISSUANCE_MANAGER_ADDRESS]:
          issuanceManagerAddress,
        [STATE_DETECTED_DB_REPORTS_KEY]: [detectedEvents[0], detectedEvents[1]],
      }

      const {
        buildProposalsTxsAndPutInState,
      } = require('../../lib/evm/evm-build-proposals-txs')

      const result = await buildProposalsTxsAndPutInState(state)

      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(STATE_DETECTED_DB_REPORTS_KEY)
      expect(result).toHaveProperty(constants.state.STATE_KEY_CHAIN_ID)
      expect(result).toHaveProperty(constants.state.STATE_KEY_PROVIDER_URL)
      expect(result).toHaveProperty(constants.state.STATE_KEY_IDENTITY_FILE)
      expect(result).toHaveProperty(
        constants.state.STATE_KEY_ISSUANCE_MANAGER_ADDRESS
      )
      expect(result).toHaveProperty(
        constants.state.STATE_KEY_REDEEM_MANAGER_ADDRESS
      )
      expect(result).toHaveProperty(constants.state.STATE_KEY_TX_TIMEOUT)
      expect(result[STATE_PROPOSED_DB_REPORTS_KEY]).toHaveLength(2)

      expect(result[STATE_PROPOSED_DB_REPORTS_KEY][0]).toEqual(
        expect.objectContaining({
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.PROPOSED,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHashes[0],
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
        })
      )

      expect(result[STATE_PROPOSED_DB_REPORTS_KEY][1]).toEqual(
        expect.objectContaining({
          [schemas.constants.SCHEMA_STATUS_KEY]:
            schemas.db.enums.txStatus.PROPOSED,
          [schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY]: proposedTxHashes[1],
          [schemas.constants.SCHEMA_PROPOSAL_TS_KEY]: expect.any(String),
        })
      )
    })
  })
})
