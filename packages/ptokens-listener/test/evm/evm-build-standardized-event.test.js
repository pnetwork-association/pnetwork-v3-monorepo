const { logs } = require('../mock/evm-logs')
const constants = require('ptokens-constants')
const { getInterfaceFromEvent } = require('../../lib/evm/evm-utils')

const { validation } = require('ptokens-utils')

describe('Event building for EVM', () => {
  describe('buildStandardizedEventFromEvmEvent', () => {
    beforeAll(() => {
      jest
        .useFakeTimers({ legacyFakeTimers: false })
        .setSystemTime(new Date('2023-03-14T16:00:00Z'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('Should build a standardized event object for a UserOperation event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const networkId = '0xd41b1c5b'
      const eventName =
        'UserOperation (uint256 nonce, string destinationAccount, bytes4 destinationNetworkId, string underlyingAssetName, string underlyingAssetSymbol, uint256 underlyingAssetDecimals, address underlyingAssetTokenAddress, bytes4 underlyingAssetNetworkId, address assetTokenAddress, uint256 assetAmount, address protocolFeeAssetTokenAddress, uint256 protocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, bytes4 forwardDestinationNetworkId, bytes userData, bytes32 optionsMask)'
      const eventLog = logs[0]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        networkId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'useroperation_0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425',
        [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.USER_OPERATION,

        [constants.db.KEY_NONCE]: '85671',
        [constants.db.KEY_ASSET_AMOUNT]: '1455000000000000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
        [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'USD//C on xDai',
        [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'USDC',
        [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 6,
        [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
          '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        [constants.db.KEY_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [constants.db.KEY_ORIGINATING_NETWORK_ID]: null,
        [constants.db.KEY_ORIGINATING_ADDRESS]: null,
        [constants.db.KEY_ORIGINATING_BLOCK_HASH]: null,
        [constants.db.KEY_ORIGINATING_TX_HASH]: null,
        [constants.db.KEY_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_BLOCK_HASH]:
          '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
        [constants.db.KEY_TX_HASH]:
          '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xfc8ebb2b',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationQueued event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 assetAmount, uint256 protocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 forwardDestinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData))'
      const eventLog = logs[4]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'operationqueued_0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425',
        [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.QUEUED_OPERATION,

        [constants.db.KEY_NONCE]: '85671',
        [constants.db.KEY_ASSET_AMOUNT]: '1455000000000000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xfc8ebb2b',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'USD//C on xDai',
        [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'USDC',
        [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 6,
        [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
          '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        [constants.db.KEY_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_ORIGINATING_ADDRESS]: null,
        [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
          '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
        [constants.db.KEY_ORIGINATING_TX_HASH]:
          '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
        [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.db.KEY_BLOCK_HASH]:
          '0xed88680b37d91b6add229a0b2f7c3688e992126ed5b8960ed8852c405e41f205',
        [constants.db.KEY_TX_HASH]:
          '0x630dedecd876b375250f42afbc9e7e4a26f2c9ebf50db49dca6092d16190e4c3',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })

    it('Should build a standardized event object for a OperationExecuted event 1', async () => {
      const {
        buildStandardizedEvmEventObjectFromLog,
      } = require('../../lib/evm/evm-build-standardized-event')
      const chainId = '0xe15503e4'
      const eventName =
        'OperationExecuted(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 assetAmount, uint256 protocolFeeAssetAmount, uint256 networkFeeAssetAmount, uint256 forwardNetworkFeeAssetAmount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 forwardDestinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData))'
      const eventLog = logs[2]
      const methodInterface = await getInterfaceFromEvent(eventName)
      const result = await buildStandardizedEvmEventObjectFromLog(
        chainId,
        methodInterface,
        eventLog
      )

      const expected = {
        [constants.db.KEY_ID]:
          'operationexecuted_0x0e629afc57c3f95207c44fee302cedb89c7051b99df35847586b569073e8f425',
        [constants.db.KEY_STATUS]: constants.db.txStatus.DETECTED,
        [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.EXECUTED_OPERATION,
        [constants.db.KEY_NONCE]: '85671',
        [constants.db.KEY_ASSET_AMOUNT]: '1455000000000000',
        [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
        [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xf9b459a1',
        [constants.db.KEY_FINAL_TX_HASH]: null,
        [constants.db.KEY_FINAL_TX_TS]: null,
        [constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID]: '0xfc8ebb2b',
        [constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'USD//C on xDai',
        [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'USDC',
        [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 6,
        [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
          '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        [constants.db.KEY_OPTIONS_MASK]:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0xd41b1c5b',
        [constants.db.KEY_ORIGINATING_ADDRESS]: null,
        [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
          '0x2c3f80c427a454df34e9f7b4684cd0767ebe7672db167151369af3f49b9326c4',
        [constants.db.KEY_ORIGINATING_TX_HASH]:
          '0x2d300f8aeed6cee69f50dde84d0a6e991d0836b2a1a3b3a6737b3ae3493f710f',
        [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
        [constants.db.KEY_BLOCK_HASH]:
          '0xf402531eeaafe0e208e76b14dc0f6dc0f8bb6db78da57e523e4caac768c8cbe9',
        [constants.db.KEY_TX_HASH]:
          '0x260d51e9aac08601fb948b137b41a672244efbf72b8c107949937dcec8bd3175',
        [constants.db.KEY_PROPOSAL_TX_HASH]: null,
        [constants.db.KEY_PROPOSAL_TS]: null,
        [constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT]: '0',
        [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
        [constants.db.KEY_USER_DATA]: '0x',
        [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
      }
      await validation.validateJson(constants.db.schemas.eventReport, expected)
      expect(result).toStrictEqual(expected)
    })
  })
})
