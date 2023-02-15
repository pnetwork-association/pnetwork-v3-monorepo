const { curry } = require('ramda')
const { logic } = require('ptokens-utils')
const { logger } = require('./get-logger')

const LOOP_CONFIGURATION = {
  rounds: logic.LOOP_MODE.INFINITE
}

const maybeProcessNewRequests = _state =>
  getQueuedRequestAndPutInState(_state)
    .then(getNewRequestsFromDbAndPutInState)
    .then(maybeBuildProposalsTxsAndPutInState)
    .then(maybeBroadcastTxs)

const pollForRequests = _state =>
  logic.loop(LOO)

module.exports = {
  pollForRequests
}