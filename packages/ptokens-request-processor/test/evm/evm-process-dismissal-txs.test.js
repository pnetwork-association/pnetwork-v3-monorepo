const R = require('ramda')
const constants = require('ptokens-constants')
const queuedReports = require('../samples/queued-report-set.json')
const requestsReports = require('../samples/detected-report-set.json')
const reports = [...queuedReports, ...requestsReports]

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
        .mockImplementationOnce((_collection, _query, _options) =>
          Promise.resolve(
            reports.filter(
              _r =>
                _r.status === _query.status &&
                _r.eventName === _query.eventName &&
                _r.originatingNetworkId === _query.originatingNetworkId
            )
          )
        )
        .mockImplementationOnce((_collection, _query, _options) =>
          Promise.resolve(reports.filter(_r => _query._id.$in.includes(_r._id)))
        )
        .mockResolvedValue([])

      jest
        .spyOn(logic, 'sleepForXMilliseconds')
        .mockImplementation(_ => Promise.resolve())
      jest
        .spyOn(logic, 'sleepThenReturnArg')
        .mockImplementation(R.curry((_, _r) => Promise.resolve(_r)))

      const evmBBuildDismissalModule = require('../../lib/evm/evm-build-dismissal-txs')

      const maybeBuildDismissalTxsAndPutInStateSpy = jest
        .spyOn(evmBBuildDismissalModule, 'maybeBuildDismissalTxsAndPutInState')
        .mockImplementation(_ => _)
      const {
        maybeProcessNewRequestsAndDismiss,
      } = require('../../lib/evm/evm-process-dismissal-txs')
      const state = {
        [constants.state.STATE_KEY_LOOP_SLEEP_TIME]: 1,
        [constants.state.STATE_KEY_NETWORK_ID]: '0xe15503e4',
        [constants.state.STATE_KEY_DB]: { collection: 'collection' },
      }

      await maybeProcessNewRequestsAndDismiss(state)

      expect(findReportsSpy).toHaveBeenNthCalledWith(
        1,
        { collection: 'collection' },
        {
          eventName: 'OperationQueued',
          originatingNetworkId: '0xe15503e4',
          status: 'detected',
        }
      )
      expect(findReportsSpy).toHaveBeenNthCalledWith(
        2,
        { collection: 'collection' },
        {
          _id: {
            $in: [
              'useroperation_0x472a0730ed6fee11afda30c2701e8c5a0b8559f17b576c5c6447861e94146f31',
              'useroperation_0x09ef065ad6793a8f76d0cf3e02af4fead0b859d5eb196d1d172570916fd047dd',
              'useroperation_0x0373cb2ceeafd11a18902d21a0edbd7f3651ee3cea09442a12c060115a97bda1',
              'useroperation_0x32fe2ff93d26184c87287d7b8d3d92f48f6224dd79b353eadeacf1e399378c08',
            ],
          },
        }
      )
      expect(maybeBuildDismissalTxsAndPutInStateSpy).toHaveBeenNthCalledWith(
        1,
        {
          ...state,
          queuedDbReports: [
            queuedReports[0],
            queuedReports[1],
            queuedReports[2],
            queuedReports[3],
          ],
          toBeDismissedRequests: [
            queuedReports[0],
            queuedReports[1],
            queuedReports[2],
          ],
        }
      )
    })
  })
})
