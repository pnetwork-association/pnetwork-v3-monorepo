const constants = require('ptokens-constants')
const proposedReports = require('../samples/proposed-report-set')
const { jestMockContractConstructor } = require('./mock/jest-utils')
const { STATE_PROPOSED_DB_REPORTS } = require('../../lib/state/constants')

describe('Challenge period expired report filtering', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('maybefilterForExpiredProposalsAndPutThemInState', () => {
    it('Should filter the correct reports', async () => {
      const ethers = require('ethers')
      const now = '2023-04-04T14:05:00.000Z'

      const mockChallengePeriodOf = jest
        .fn()
        .mockResolvedValueOnce([1680615440, 1680616620])
        .mockResolvedValueOnce([1680615440, 1680619040])
        .mockResolvedValueOnce([1680615440, 1680622640])
        .mockResolvedValueOnce([1680615440, 1680616620])
        .mockResolvedValueOnce([1680615440, 1680616620])

      jest.useFakeTimers({ now: Date.parse(now) })
      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(jestMockContractConstructor('challengePeriodOf', mockChallengePeriodOf))

      const state = {
        [constants.state.KEY_CHALLENGE_PERIOD]: 10, // 20mins
        [STATE_PROPOSED_DB_REPORTS]: proposedReports,
      }

      const {
        maybefilterForExpiredProposalsAndPutThemInState,
      } = require('../../lib/evm/evm-filter-for-expired-challenge-period')

      const result = await maybefilterForExpiredProposalsAndPutThemInState(state)

      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(mockChallengePeriodOf).toHaveBeenCalledTimes(4) // Because 1 report is skipped for the basic challenge period condition
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(2)
      expect(result).toStrictEqual({
        ...state,
        [STATE_PROPOSED_DB_REPORTS]: [proposedReports[1], proposedReports[4]],
      })
    })

    it('Should add a stored operation even if its challenge period is not queued', async () => {
      const ethers = require('ethers')
      const now = '2023-04-04T14:05:00.000Z'

      const mockChallengePeriodOf = jest.fn().mockResolvedValueOnce([0, 0]) // Contract return this when operation is not queued

      jest.useFakeTimers({ now: Date.parse(now) })
      jest
        .spyOn(ethers, 'Contract')
        .mockImplementation(jestMockContractConstructor('challengePeriodOf', mockChallengePeriodOf))

      const state = {
        [constants.state.KEY_CHALLENGE_PERIOD]: 10, // 20mins
        [STATE_PROPOSED_DB_REPORTS]: [proposedReports[3]],
      }

      const {
        maybefilterForExpiredProposalsAndPutThemInState,
      } = require('../../lib/evm/evm-filter-for-expired-challenge-period')

      const result = await maybefilterForExpiredProposalsAndPutThemInState(state)

      expect(result).toHaveProperty(STATE_PROPOSED_DB_REPORTS)
      expect(mockChallengePeriodOf).toHaveBeenCalledTimes(1)
      expect(result[STATE_PROPOSED_DB_REPORTS]).toHaveLength(1)
    })
  })
})
