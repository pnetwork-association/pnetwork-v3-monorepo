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

    // it('Should build a standardized event object for a OperationQueued event 1', async () => {
    //   const {
    //     buildStandardizedEvmEventObjectFromLog,
    //   } = require('../../lib/evm/evm-build-standardized-event')
    //   const chainId = '0xe15503e4'
    //   const eventName =
    //     'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'
    //   const eventLog = logs[7]
    //   const methodInterface = await getInterfaceFromEvent(eventName)
    //   const result = await buildStandardizedEvmEventObjectFromLog(
    //     chainId,
    //     methodInterface,
    //     eventLog
    //   )

    //   const expected = {
    //     [constants.db.KEY_ID]:
    //       'operationqueued_0x0373cb2ceeafd11a18902d21a0edbd7f3651ee3cea09442a12c060115a97bda1',
    //     [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
    //     [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.QUEUED_OPERATION,

    //     [constants.db.KEY_NONCE]: '6648',
    //     [constants.db.KEY_ASSET_AMOUNT]: '1000000000000000000',
    //     [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
    //     [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_FINAL_TX_HASH]: null,
    //     [constants.db.KEY_FINAL_TX_TS]: null,
    //     [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'Token',
    //     [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'TKN',
    //     [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
    //     [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
    //       '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
    //     [constants.db.KEY_OPTIONS_MASK]:
    //       '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_ORIGINATING_ADDRESS]: null,
    //     [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
    //       '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
    //     [constants.db.KEY_ORIGINATING_TX_HASH]:
    //       '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2820',
    //     [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_BLOCK_HASH]:
    //       '0xb58eef9c0844fc69bc52ec679ca476419f7b2edf1aff430206f54e8081ec6da8',
    //     [constants.db.KEY_TX_HASH]:
    //       '0x302eac6bc7e18c649d58a8fc6137515914e9048aad6c6d000c2efea1dfed517f',
    //     [constants.db.KEY_PROPOSAL_TX_HASH]: null,
    //     [constants.db.KEY_PROPOSAL_TS]: null,
    //     [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
    //     [constants.db.KEY_USER_DATA]: '0x',
    //     [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
    //   }
    //   await validation.validateJson(constants.db.schemas.eventReport, expected)
    //   expect(result).toStrictEqual(expected)
    // })

    // it('Should build a standardized event object for a OperationQueued event 2', async () => {
    //   const {
    //     buildStandardizedEvmEventObjectFromLog,
    //   } = require('../../lib/evm/evm-build-standardized-event')
    //   const chainId = '0xe15503e4'
    //   const eventName =
    //     'OperationQueued(tuple(bytes32 originBlockHash, bytes32 originTransactionHash, bytes32 optionsMask, uint256 nonce, uint256 underlyingAssetDecimals, uint256 amount, address underlyingAssetTokenAddress, bytes4 originNetworkId, bytes4 destinationNetworkId, bytes4 underlyingAssetNetworkId, string destinationAccount, string underlyingAssetName, string underlyingAssetSymbol, bytes userData) operation)'
    //   const eventLog = logs[9]
    //   const methodInterface = await getInterfaceFromEvent(eventName)
    //   const result = await buildStandardizedEvmEventObjectFromLog(
    //     chainId,
    //     methodInterface,
    //     eventLog
    //   )

    //   const expected = {
    //     [constants.db.KEY_ID]:
    //       'operationqueued_0x32fe2ff93d26184c87287d7b8d3d92f48f6224dd79b353eadeacf1e399378c08',
    //     [constants.db.KEY_STATUS]: constants.db.txStatus.PROPOSED,
    //     [constants.db.KEY_EVENT_NAME]: constants.db.eventNames.QUEUED_OPERATION,

    //     [constants.db.KEY_NONCE]: '6911',
    //     [constants.db.KEY_ASSET_AMOUNT]: '7000000000000000000',
    //     [constants.db.KEY_DESTINATION_ACCOUNT]: '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
    //     [constants.db.KEY_DESTINATION_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_FINAL_TX_HASH]: null,
    //     [constants.db.KEY_FINAL_TX_TS]: null,
    //     [constants.db.KEY_UNDERLYING_ASSET_NAME]: 'Token',
    //     [constants.db.KEY_UNDERLYING_ASSET_SYMBOL]: 'TKN',
    //     [constants.db.KEY_UNDERLYING_ASSET_DECIMALS]: 18,
    //     [constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS]:
    //       '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
    //     [constants.db.KEY_OPTIONS_MASK]:
    //       '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     [constants.db.KEY_ORIGINATING_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_ORIGINATING_ADDRESS]: null,
    //     [constants.db.KEY_ORIGINATING_BLOCK_HASH]:
    //       '0xf085786d855e220305a67f95653bd9345956b211095b7403e54da1b40699cb86',
    //     [constants.db.KEY_ORIGINATING_TX_HASH]:
    //       '0x8ac05c2472b3a507f042557ee2c137d112a26d188fb267566b53c28975322452',
    //     [constants.db.KEY_NETWORK_ID]: '0xe15503e4',
    //     [constants.db.KEY_BLOCK_HASH]:
    //       '0x8e4479cd521acad9deae47ec04cfcd3d5c28ab30686b3a8581c7d88980bbf35b',
    //     [constants.db.KEY_TX_HASH]:
    //       '0x153ad9b1613eeaf1234d8d430e2d3e22821f931d33d6f42de7e6ac0f95e87521',
    //     [constants.db.KEY_PROPOSAL_TX_HASH]: null,
    //     [constants.db.KEY_PROPOSAL_TS]: null,
    //     [constants.db.KEY_ASSET_TOKEN_ADDRESS]: null,
    //     [constants.db.KEY_USER_DATA]: '0xc0ffee',
    //     [constants.db.KEY_WITNESSED_TS]: '2023-03-14T16:00:00.000Z',
    //   }
    //   await validation.validateJson(constants.db.schemas.eventReport, expected)
    //   expect(result).toStrictEqual(expected)
    // })
  })
})
