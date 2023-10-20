const { types } = require('hardhat/config')
const userSend = require('./user-send.task.js')
const TASK_CONSTANTS = require('../constants')

const setCommonOptionalParams = () =>
  [userSend].map(lib => {
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
  ...userSend,
}
