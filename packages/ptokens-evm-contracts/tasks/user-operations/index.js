const { types } = require('hardhat/config')
const mint = require('./user-send-mint.task.js')
const transfer = require('./user-send-transfer.task.js')
const burn = require('./user-send-burn.task.js')
const TASK_CONSTANTS = require('../constants')

const setCommonOptionalParams = () =>
  [mint, transfer, burn].map(lib => {
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
  ...mint,
  ...transfer,
  ...burn,
}
