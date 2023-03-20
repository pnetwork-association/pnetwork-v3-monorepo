const { STATE_PROPOSED_DB_REPORTS_KEY } = require('../../lib/state/constants')
const schemas = require('ptokens-schemas')
const proposedReports = require('../samples/proposed-report-set')

describe('Challenge period expired report filtering', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('maybefilterForExpiredProposalsAndPutThemInState', () => {
    it('Should filter the correct reports', async () => {
      const now = '2023-03-07T16:45:38.835Z'
      jest.useFakeTimers({ now: Date.parse(now) })

      const state = {
        [schemas.constants.SCHEMA_CHALLENGE_PERIOD]: 20, // 20mins
        [STATE_PROPOSED_DB_REPORTS_KEY]: proposedReports,
      }

      const {
        maybefilterForExpiredProposalsAndPutThemInState,
      } = require('../../lib/evm/evm-filter-for-expired-challenge-period')

      const result = await maybefilterForExpiredProposalsAndPutThemInState(
        state
      )

      expect(result).toStrictEqual({
        ...state,
        [STATE_PROPOSED_DB_REPORTS_KEY]: [
          proposedReports[0],
          proposedReports[2],
        ],
      })
    })
  })
})
