const { types } = require('hardhat/config')
const slash = require('./slash.task')
const statusOf = require('./status-of.task')
const protocolQueue = require('./queue.task')
const protocolCancel = require('./cancel.task')
const protocolExecute = require('./execute.task')
const getProperties = require('./properties.task')
const userOperations = require('./user-send.task')
const startChallenge = require('./start-challenge.task')
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
  ...slash,
  ...statusOf,
  ...getProperties,
  ...protocolQueue,
  ...protocolCancel,
  ...startChallenge,
  ...protocolExecute,
  ...userOperations,
}
