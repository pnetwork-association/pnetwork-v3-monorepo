const R = require('ramda')
const {
  TASK_NAME_DEPLOY_INIT,
  TASK_NAME_DEPLOY_ASSET,
  TASK_DESC_DEPLOY_ASSET,
  KEY_PTOKEN_ADDRESS,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ADDRESS,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_UNDERLYING_NAME,
  KEY_UNDERLYING_SYMBOL,
  KEY_UNDERLYING_DECIMAL,
  KEY_UNDERLYING_TOTAL_SUPPLY,
} = require('../constants')
const { errors } = require('ptokens-utils')
const { attachToContract, deployContractErrorHandler } = require('./utils/utils-contracts')

const findPtokenWithUnderlyingAsset = R.curry((underlyingAddress, pTokenList) =>
  pTokenList ? R.find(R.propEq(underlyingAddress, KEY_UNDERLYING_ADDRESS))(pTokenList) : undefined
)

const findUnderlyingAsset = R.curry((underlyingAssetList, props) =>
  underlyingAssetList
    ? R.find(
        R.whereEq({
          [KEY_UNDERLYING_NAME]: props[0],
          [KEY_UNDERLYING_SYMBOL]: props[1],
          [KEY_UNDERLYING_DECIMAL]: props[2],
          [KEY_UNDERLYING_TOTAL_SUPPLY]: props[3],
        })
      )(underlyingAssetList)
    : undefined
)

const getAssetFromConfig = R.curry((taskArgs, store) =>
  taskArgs.configurableName == KEY_PTOKEN_ADDRESS
    ? new Promise((resolve, reject) => {
        const foundPtoken = findPtokenWithUnderlyingAsset(
          taskArgs.underlyingAsset,
          store[KEY_PTOKEN_LIST]
        )
        R.isNotNil(foundPtoken)
          ? resolve(foundPtoken)
          : reject(
              new Error(
                `${errors.ERROR_KEY_NOT_FOUND} (No pToken found for underlying asset: ${taskArgs.underlyingAsset})`
              )
            )
      })
    : new Promise((resolve, reject) => {
        const foundUnderlyingAsset = findUnderlyingAsset(
          store[KEY_UNDERLYING_ASSET_LIST],
          taskArgs.deployArgsArray
        )
        R.isNotNil(foundUnderlyingAsset)
          ? resolve(foundUnderlyingAsset)
          : reject(
              new Error(
                `${errors.ERROR_KEY_NOT_FOUND} (No underlyingAsset found for underlying asset: ${taskArgs.deployArgsArray[0]})`
              )
            )
      })
)

const deployAssetTask = (taskArgs, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(getAssetFromConfig(taskArgs))
    .then(attachToContract(hre, taskArgs))
    .catch(deployContractErrorHandler(hre, taskArgs))

subtask(TASK_NAME_DEPLOY_ASSET, TASK_DESC_DEPLOY_ASSET)
  .addParam(
    'configurableName',
    'Configuration property where the address will be stored',
    undefined,
    types.string
  )
  .addParam('contractFactoryName', 'Contract factory name (i.e. PFactory)', undefined, types.string)
  .addParam(
    'underlyingAsset',
    'address for the underlying asset (undefined if not needed)',
    undefined,
    types.string
  )
  .addVariadicPositionalParam(
    'deployArgsArray',
    'Contract constructor arguments array',
    [],
    types.array
  )
  .setAction(deployAssetTask)
