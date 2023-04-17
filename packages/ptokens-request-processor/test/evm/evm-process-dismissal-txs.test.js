const R = require('ramda')
const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const { STATE_ONCHAIN_REQUESTS_KEY } = require('../../lib/state/constants')
const reports = require('../samples/detected-report-set.json')

describe('Tests for queued requests detection and dismissal', () => {
  describe('maybeProcessNewRequestsAndDismiss', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    it('Should put invalid transactions to be dismissed into state', async () => {
      const { db, logic } = require('ptokens-utils')
      const findReportsSpy = jest
        .spyOn(db, 'findReports')
        .mockResolvedValue([reports[0]])

      jest
        .spyOn(logic, 'sleepForXMilliseconds')
        .mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      const getOnChainRequestsModule = require('../../lib/evm/evm-get-on-chain-queued-requests')
      const evmBBuildDismissalModule = require('../../lib/evm/evm-build-dismissal-txs')
      const queuedRequests = [
        {
          [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
          [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '1000000000000000000',
          [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
            '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_OPTIONS_MASK]:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
            '0xbaa9e89896c03366c3578a4568a6defd4b127e4b09bb06b67a12cb1a4c332376',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x0907eefad58dfcb2cbfad66d29accd4d6ddc345851ec1d180b23122084fa2834',
          [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        },
        {
          [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
          [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '2000000000000000000',
          [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7A', // invalid receiver
          [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
            '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_OPTIONS_MASK]:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
            '0xbfed1379abf5ebce29b4f74a4159a0795f42f97b260199d05acdcb567d0b0b85',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0xed4fc787108745e0414cdcd24fe82afd82bbbb60d4976feefb6687253d558be8',
          [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        },
        {
          [schemas.constants.SCHEMA_NONCE_KEY]: '6648',
          [schemas.constants.SCHEMA_ASSET_AMOUNT_KEY]: '4000000000000000000', // invalid quantity
          [schemas.constants.SCHEMA_DESTINATION_ACCOUNT_KEY]:
            '0xdDb5f4535123DAa5aE343c24006F4075aBAF5F7B',
          [schemas.constants.SCHEMA_DESTINATION_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NAME_KEY]: 'Token',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_SYMBOL_KEY]: 'TKN',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_DECIMALS_KEY]: 18,
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_NETWORK_ID_KEY]:
            '0xe15503e4',
          [schemas.constants.SCHEMA_UNDERLYING_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_OPTIONS_MASK]:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          [schemas.constants.SCHEMA_ORIGINATING_NETWORK_ID_KEY]: '0xe15503e4',
          [schemas.constants.SCHEMA_ORIGINATING_ADDRESS_KEY]: null,
          [schemas.constants.SCHEMA_ORIGINATING_BLOCK_HASH_KEY]:
            '0x51a7df3cedcc76917b037b74bdd82a315f812a0cdbcac7ad70a8bce9d4150af4',
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0xfad8f21a2981f49eafe79334d5b4b81fa95db5a1e40f0f633a22ad7e55b793a4',
          [schemas.constants.SCHEMA_ASSET_TOKEN_ADDRESS_KEY]:
            '0x49a5D1CF92772328Ad70f51894FD632a14dF12C9',
          [schemas.constants.SCHEMA_USER_DATA_KEY]: '0x',
        },
      ]
      jest
        .spyOn(
          getOnChainRequestsModule,
          'getOnChainQueuedRequestsAndPutInState'
        )
        .mockImplementation(_state =>
          Promise.resolve(
            R.assoc(STATE_ONCHAIN_REQUESTS_KEY, queuedRequests, _state)
          )
        )
      const maybeBuildDismissalTxsAndPutInStateSpy = jest
        .spyOn(evmBBuildDismissalModule, 'maybeBuildDismissalTxsAndPutInState')
        .mockImplementation(_ => _)
      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-process-dismissal-txs')
      const state = {
        [constants.state.STATE_KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.STATE_KEY_NETWORK_ID]: '0x005fe7f9',
        [constants.state.STATE_KEY_DB]: { collection: 'collection' },
      }

      await maybeProcessNewRequestsAndDismiss(state)

      expect(findReportsSpy).toHaveBeenNthCalledWith(
        1,
        { collection: 'collection' },
        {
          _id: {
            $in: [
              '0xbe8b7571ab50cc63da7f1d9f6b22802922aa2e242a5c7400c493ba9c831b24aa',
              '0x7dedd8965f3be44d50b8e5c9f0c8045674d789d436e3fe4db7e07e8dd02403e0',
              '0x0b26365e928a111ca592cb15f08825a5c4a539972cb891313fcf4a5719b5627b',
            ],
          },
        }
      )
      expect(maybeBuildDismissalTxsAndPutInStateSpy).toHaveBeenNthCalledWith(
        1,
        {
          ...state,
          toBeDismissedRequests: [queuedRequests[1], queuedRequests[2]],
        }
      )
    })
  })
})
