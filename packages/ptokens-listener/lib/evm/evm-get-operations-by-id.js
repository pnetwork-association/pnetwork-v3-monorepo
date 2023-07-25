const R = require('ramda')
const constants = require('ptokens-constants')
const {
  createContract,
  getEthersProvider,
  getEventFilter,
  getTopicFromEventFragment,
  isEventFragment,
} = require('./evm-utils')
const { buildStandardizedEvmEventObjectFromLog } = require('./evm-build-standardized-event')

const filterById = _id => R.filter(_report => _report[constants.db.KEY_ID].includes(_id))

const buildOperationObjectFromReport = _r => ({
  eventName: R.prop(constants.db.KEY_EVENT_NAME, _r),
  txHash: R.prop(constants.db.KEY_TX_HASH, _r),
})

const getContractEventsTopics = _contract =>
  Promise.all(_contract.interface.fragments.filter(isEventFragment).map(getTopicFromEventFragment))

const getEvmOperationsById = (_providerUrl, _networkId, _id, _hubAddress, _fromBlock) =>
  createContract(_hubAddress, [
    `event ${constants.evm.events.OPERATION_CANCELLED_SIGNATURE}`,
    `event ${constants.evm.events.OPERATION_EXECUTED_SIGNATURE}`,
    `event ${constants.evm.events.OPERATION_QUEUED_SIGNATURE}`,
  ])
    .then(_contract =>
      Promise.all([
        _contract.interface,
        getContractEventsTopics(_contract).then(_topics =>
          getEventFilter({
            topics: _topics,
            contractAddress: _hubAddress,
            fromBlock: _fromBlock,
          })
        ),
        getEthersProvider(_providerUrl),
      ])
    )
    .then(([_interface, _filter, _provider]) =>
      _provider
        .getLogs(_filter)
        .then(_logs =>
          Promise.all(_logs.map(buildStandardizedEvmEventObjectFromLog(_networkId, _interface)))
        )
        .then(filterById(_id))
        .then(R.map(buildOperationObjectFromReport))
    )

module.exports = { getEvmOperationsById }
