const { assoc } = require('ramda')
const { constants } = require('ptokens-utils')
const schemas = require('ptokens-schemas')
const { STATE_ONCHAIN_REQUESTS_KEY } = require('../../lib/state/constants')
const reports = require('../samples/detected-report-set.json')

describe('Tests for queued requests detection and dismissal', () => {
  describe('pollForRequestsAndDismiss', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    it('Should put invalid transactions to be dismissed into state', async () => {
      const { db } = require('ptokens-utils')
      const findReportsSpy = jest
        .spyOn(db, 'findReports')
        .mockResolvedValue([reports[0], reports[1], reports[2]])
      const getOnChainRequestsModule = require('../../lib/evm/evm-get-on-chain-queued-requests')
      const evmBBuildDismissalModule = require('../../lib/evm/evm-build-dismissal-txs')
      const queuedRequests = [
        {
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '1111111',
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
            '11eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        },
        {
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x48428602101e6a805c06e9b1320d0643ed3f1479c34b279aaa87adcc72abc0a0',
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '222222222', // different quantity
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
            '22eXzETyUxiQPXwU2udtVFQFrFjgRhhvPj',
        },
        {
          [schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]:
            '0x2ae90e5210168c42fa196059a99e26de46df8e49ad4aa482df4d7d657b6a8a22',
          [schemas.constants.SCHEMA_AMOUNT_KEY]: '3333333',
          [schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]:
            '33eXzETyUxiQPXwU2udtVFQFrFjgRhhvPa', // different address
        },
      ]
      jest
        .spyOn(
          getOnChainRequestsModule,
          'getOnChainQueuedRequestsAndPutInState'
        )
        .mockImplementation(_state =>
          Promise.resolve(
            assoc(STATE_ONCHAIN_REQUESTS_KEY, queuedRequests, _state)
          )
        )
      const maybeBuildDismissalTxsAndPutInStateSpy = jest
        .spyOn(evmBBuildDismissalModule, 'maybeBuildDismissalTxsAndPutInState')
        .mockImplementation(_ => _)
      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-poll-for-requests')
      const state = {
        [constants.STATE_KEY_CHAIN_ID]: '0x005fe7f9',
        [constants.STATE_KEY_DB]: { collection: 'collection' },
      }

      await maybeProcessNewRequestsAndDismiss(state)

      expect(findReportsSpy).toHaveBeenNthCalledWith(
        1,
        { collection: 'collection' },
        {
          originatingTransactionHash: {
            $in: [
              '0x9488dee8cb5c6b2f6299e45e48bba580f46dbd496cfaa70a182060fd5dc81cb4',
              '0x48428602101e6a805c06e9b1320d0643ed3f1479c34b279aaa87adcc72abc0a0',
              '0x2ae90e5210168c42fa196059a99e26de46df8e49ad4aa482df4d7d657b6a8a22',
            ],
          },
        }
      )
      expect(maybeBuildDismissalTxsAndPutInStateSpy).toHaveBeenNthCalledWith(
        1,
        {
          ...state,
          detectedDbReports: [reports[0], reports[1], reports[2]],
          onChainRequests: queuedRequests,
          toBeDismissedRequests: [queuedRequests[1], queuedRequests[2]],
        }
      )
    })
  })
})
