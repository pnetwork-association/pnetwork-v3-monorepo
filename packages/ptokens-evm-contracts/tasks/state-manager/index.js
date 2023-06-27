const { types } = require('hardhat/config')
const protocolExecute = require('./protocol-execute.task')
const protocolQueue = require('./protocol-queue.task')
const protocolCancel = require('./protocol-cancel.task')
const getProperties = require('./get-properties')
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
  ...protocolExecute,
  ...getProperties,
  ...protocolQueue,
  ...protocolCancel,
}
