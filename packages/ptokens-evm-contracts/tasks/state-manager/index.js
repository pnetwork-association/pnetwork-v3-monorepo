const { types } = require('hardhat/config')
const statusOf = require('./protocol-status-of.task')
const protocolQueue = require('./protocol-queue.task')
const protocolCancel = require('./protocol-cancel.task')
const protocolExecute = require('./protocol-execute.task')
const getProperties = require('./protocol-get-properties.task')
const {
  TASK_PARAM_GASPRICE,
  TASK_PARAM_GASLIMIT,
  TASK_PARAM_GASPRICE_DESC,
  TASK_PARAM_GASLIMIT_DESC,
} = require('../constants')

const setCommonOptionalParams = () =>
  [protocolExecute, protocolQueue, protocolCancel].map(lib => {
    task(lib['TASK_NAME'])
      .addOptionalParam(TASK_PARAM_GASPRICE, TASK_PARAM_GASPRICE_DESC, undefined, types.int)
      .addOptionalParam(TASK_PARAM_GASLIMIT, TASK_PARAM_GASLIMIT_DESC, undefined, types.int)
  })

setCommonOptionalParams()

module.exports = {
  ...statusOf,
  ...getProperties,
  ...protocolQueue,
  ...protocolCancel,
  ...protocolExecute,
}
