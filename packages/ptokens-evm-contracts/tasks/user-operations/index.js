const { types } = require('hardhat/config')
const mint = require('./user-send-mint.task.js')
const transfer = require('./user-send-transfer.task.js')
const burn = require('./user-send-burn.task.js')
const {
  TASK_PARAM_GASPRICE,
  TASK_PARAM_GASLIMIT,
  TASK_PARAM_GASPRICE_DESC,
  TASK_PARAM_GASLIMIT_DESC,
} = require('../constants')

const setCommonOptionalParams = () =>
  [mint, transfer, burn].map(lib => {
    task(lib['TASK_NAME'])
      .addOptionalParam(TASK_PARAM_GASPRICE, TASK_PARAM_GASPRICE_DESC, undefined, types.int)
      .addOptionalParam(TASK_PARAM_GASLIMIT, TASK_PARAM_GASLIMIT_DESC, undefined, types.int)
  })

setCommonOptionalParams()

module.exports = {
  ...mint,
  ...transfer,
  ...burn,
}
