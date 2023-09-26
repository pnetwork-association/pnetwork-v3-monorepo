const { types } = require('hardhat/config')
const statusOf = require('./protocol-status-of.task')
const protocolQueue = require('./protocol-queue.task')
const protocolCancel = require('./protocol-cancel.task')
const protocolExecute = require('./protocol-execute.task')
const getProperties = require('./protocol-get-properties.task')
const TASK_CONSTANTS = require('../constants')

const setCommonOptionalParams = () =>
  [protocolExecute, protocolQueue, protocolCancel].map(lib => {
    task(lib['TASK_NAME'])
      .addOptionalParam(
        TASK_CONSTANTS.PARAM_NAME_GASPRICE,
        TASK_CONSTANTS.PARAM_DESC_GASPRICE,
        undefined,
        types.int
      )
      .addOptionalParam(
        TASK_CONSTANTS.PARAM_NAME_GAS,
        TASK_CONSTANTS.PARAM_DESC_GAS,
        undefined,
        types.int
      )
  })

setCommonOptionalParams()

module.exports = {
  ...statusOf,
  ...getProperties,
  ...protocolQueue,
  ...protocolCancel,
  ...protocolExecute,
}
