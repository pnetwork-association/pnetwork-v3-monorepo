const constants = require('ptokens-constants')
const schemas = require('ptokens-schemas')
const R = require('ramda')
const {
  STATE_DETECTED_DB_REPORTS_KEY,
  STATE_ONCHAIN_REQUESTS_KEY,
  STATE_PROPOSED_DB_REPORTS_KEY,
} = require('../../lib/state/constants')

describe('Tests for already processed requests filtering', () => {
  describe('filterOutAlreadyProcessedRequests', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      jest.resetModules()
    })

    it('Should put already processed requests in db', async () => {
      const target = require('../../lib/evm/evm-filter-out-onchain-requests')
      const txSamples = require('../samples/detected-report-set.json')
      const onchainRequests = [
        R.assoc(schemas.constants.reportFields.SCHEMA_ID_KEY, txSamples[0]._id, {}),
        R.assoc(schemas.constants.reportFields.SCHEMA_ID_KEY, txSamples[1]._id, {}),
      ]

      const receivedRequests = [txSamples[0], txSamples[2], txSamples[3], txSamples[4]]

      const state = {
        [constants.state.KEY_NETWORK_ID]: '0x005fe7f9',
        [STATE_DETECTED_DB_REPORTS_KEY]: receivedRequests,
        [STATE_ONCHAIN_REQUESTS_KEY]: onchainRequests,
        [STATE_PROPOSED_DB_REPORTS_KEY]: [],
        [constants.state.KEY_DB]: { collection: 'collection' },
      }

      const _state = await target.filterOutOnChainRequestsAndPutInState(state)

      const expectedProposedDb = [
        R.assoc(
          schemas.constants.reportFields.SCHEMA_STATUS_KEY,
          schemas.db.enums.txStatus.PROPOSED,
          txSamples[0]
        ),
      ]

      const expectedDetectedDb = [txSamples[2], txSamples[3], txSamples[4]]

      expect(_state[STATE_PROPOSED_DB_REPORTS_KEY]).toEqual(expectedProposedDb)
      expect(_state[STATE_DETECTED_DB_REPORTS_KEY]).toEqual(expectedDetectedDb)
    })
  })
})
