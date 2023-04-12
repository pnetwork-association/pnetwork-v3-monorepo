const R = require('ramda')
const constants = require('ptokens-constants')
const queuedReports = require('../samples/queued-report-set.json')

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
        .mockResolvedValueOnce(queuedReports)
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
        [constants.state.STATE_KEY_NETWORK_ID]: '0x005fe7f9',
        [constants.state.STATE_KEY_DB]: { collection: 'collection' },
      }

      await maybeProcessNewRequestsAndDismiss(state)

      expect(findReportsSpy).toHaveBeenNthCalledWith(
        1,
        { collection: 'collection' },
        {
          eventName: 'OperationQueued',
          originatingNetworkId: '0x005fe7f9',
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
