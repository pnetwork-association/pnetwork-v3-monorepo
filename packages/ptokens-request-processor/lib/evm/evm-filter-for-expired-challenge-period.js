const R = require('ramda')
const ethers = require('ethers')
const abi = require('./abi/PNetworkHub')
const constants = require('ptokens-constants')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const { STATE_PROPOSED_DB_REPORTS } = require('../state/constants')
const { parseUserOperationFromReport } = require('./evm-parse-user-operation')

const ERROR_OPERATION_NOT_EXPIRED = 'Not over basic challenge period'

const returnEventIfExpiredChallengePeriod = R.curry(
  (_proposedEvent, _expirationDate) =>
    new Promise(resolve => {
      const now = new Date()
      const slicedTxHash = _proposedEvent[constants.db.KEY_TX_HASH].slice(0, 10)
      const isExpired = now > _expirationDate
      logger.debug('%s: %s > %s => %s', slicedTxHash, now, _expirationDate, isExpired)
      return isExpired ? resolve(_proposedEvent) : resolve(null)
    })
)

const maybeGetExpirationDate = (_hubContract, _basicChallengePeriodMinutes, _proposedEvent) =>
  Promise.resolve(new Date(_proposedEvent[constants.db.KEY_PROPOSAL_TS]))
    .then(utils.date.addMinutesToDate(_basicChallengePeriodMinutes))
    .then(_basicExpirationTimestamp => {
      const now = new Date()
      const slicedTxHash = _proposedEvent[constants.db.KEY_TX_HASH].slice(0, 10)
      const checkChallengePeriodOnChain = now > _basicExpirationTimestamp
      if (!checkChallengePeriodOnChain) {
        logger.debug(
          '%s: %s > %s (basic) => %s (skipping)',
          slicedTxHash,
          now,
          _basicExpirationTimestamp,
          checkChallengePeriodOnChain
        )
        return Promise.reject(new Error(ERROR_OPERATION_NOT_EXPIRED))
      }

      return Promise.resolve(parseUserOperationFromReport(_proposedEvent))
        .then(_args => _hubContract.challengePeriodOf(..._args))
        .then(([_, _endTs]) => parseInt(_endTs))
        .then(R.multiply(1000)) // We need the ts in ms
        .then(_endTs => new Date(_endTs))
    })

const checkIfOperationIsExpiredOrReject = _err =>
  _err.message.includes(ERROR_OPERATION_NOT_EXPIRED) ? Promise.resolve(null) : Promise.reject(_err)

const isOperationExpired = (_hubContract, _basicChallengePeriod, _proposedEvent) =>
  logger.debug(`Checking expiration of ${_proposedEvent[constants.db.KEY_ID]}...`) ||
  maybeGetExpirationDate(_hubContract, _basicChallengePeriod, _proposedEvent)
    .then(returnEventIfExpiredChallengePeriod(_proposedEvent))
    .catch(checkIfOperationIsExpiredOrReject)

const filterForExpiredProposalsAndPutThemInState = _state =>
  new Promise(resolve => {
    const providerUrl = _state[constants.state.KEY_PROVIDER_URL]
    const provider = new ethers.JsonRpcProvider(providerUrl)
    const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS] || []
    const hubAddress = _state[constants.state.KEY_HUB_ADDRESS]
    const hub = new ethers.Contract(hubAddress, abi, provider)
    const basicChallengePeriod = _state[constants.state.KEY_CHALLENGE_PERIOD]

    logger.info(`Checking if ${proposedEvents.length} have expired...`)
    return Promise.all(
      proposedEvents.map(_report => isOperationExpired(hub, basicChallengePeriod, _report))
    )
      .then(utils.removeNilsFromList)
      .then(
        _expiredOperations =>
          logger.info(`Found ${R.length(_expiredOperations)} expired events...`) ||
          R.assoc(STATE_PROPOSED_DB_REPORTS, _expiredOperations, _state)
      )
      .then(resolve)
  })

const maybefilterForExpiredProposalsAndPutThemInState = _state => {
  logger.info('Maybe filter for expired proposals...')
  const proposedEvents = _state[STATE_PROPOSED_DB_REPORTS] || []
  const proposedEventsLength = R.length(proposedEvents)

  return proposedEventsLength === 0
    ? logger.info('No proposed events so far, skipping challenge period filtering...') ||
        Promise.resolve(_state)
    : filterForExpiredProposalsAndPutThemInState(_state)
}

module.exports = {
  maybefilterForExpiredProposalsAndPutThemInState,
}
