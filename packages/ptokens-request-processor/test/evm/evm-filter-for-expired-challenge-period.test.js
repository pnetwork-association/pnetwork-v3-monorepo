const constants = require('ptokens-constants')
const { STATE_PROPOSED_DB_REPORTS } = require('../../lib/state/constants')
const proposedReports = require('../samples/proposed-report-set')

describe('Challenge period expired report filtering', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('maybefilterForExpiredProposalsAndPutThemInState', () => {
    it('Should filter the correct reports', async () => {
      const now = '2023-04-04T13:37:00.000Z'
      jest.useFakeTimers({ now: Date.parse(now) })

      const state = {
        [constants.state.KEY_CHALLENGE_PERIOD]: 20, // 20mins
        [STATE_PROPOSED_DB_REPORTS]: proposedReports,
      }

      const {
        maybefilterForExpiredProposalsAndPutThemInState,
      } = require('../../lib/evm/evm-filter-for-expired-challenge-period')

      const result = await maybefilterForExpiredProposalsAndPutThemInState(state)

      expect(result).toStrictEqual({
        ...state,
        [STATE_PROPOSED_DB_REPORTS]: [proposedReports[0], proposedReports[1], proposedReports[2]],
      })
    })
  })
})
