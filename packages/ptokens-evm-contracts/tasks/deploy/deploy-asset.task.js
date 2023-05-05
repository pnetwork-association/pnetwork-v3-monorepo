const R = require('ramda')
const {
  TASK_NAME_DEPLOY_INIT,
  TASK_NAME_DEPLOY_ASSET,
  TASK_DESC_DEPLOY_ASSET,
  CONTRACT_NAME_PTOKEN,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_ASSET_NAME,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMAL,
  KEY_ASSET_TOTAL_SUPPLY,
} = require('../constants')
const { errors } = require('ptokens-utils')
const { attachToContract, deployContractErrorHandler } = require('./lib/utils-contracts')

const findPtokenWithUnderlyingAsset = R.curry((pTokenList, args) =>
  pTokenList ? R.find(R.propEq(args[3], KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS))(pTokenList) : undefined
)

const findUnderlyingAsset = R.curry((underlyingAssetList, args) =>
  underlyingAssetList
    ? R.find(
        R.whereEq({
          [KEY_ASSET_NAME]: args[0],
          [KEY_ASSET_SYMBOL]: args[1],
          [KEY_ASSET_DECIMAL]: args[2],
          [KEY_ASSET_TOTAL_SUPPLY]: args[3],
        })
      )(underlyingAssetList)
    : undefined
)

const getAssetFromConfig = R.curry((taskArgs, store) =>
  new Promise((resolve, reject) => {
    const [ findAssetFunction, assetsList, errorMsg ] = taskArgs.configurableName === CONTRACT_NAME_PTOKEN ?
      [ findPtokenWithUnderlyingAsset, store[KEY_PTOKEN_LIST], `${errors.ERROR_KEY_NOT_FOUND} (No pToken found for underlying asset: ${taskArgs.deployArgsArray[3]})` ] :
      [ findUnderlyingAsset, store[KEY_UNDERLYING_ASSET_LIST], `${errors.ERROR_KEY_NOT_FOUND} (No underlyingAsset found for underlying asset: ${taskArgs.deployArgsArray[0]})` ]
    
    const assetFound = findAssetFunction(assetsList, taskArgs.deployArgsArray)
    
    return R.isNotNil(assetFound)
      ? resolve(assetFound)
      : reject(new Error(errorMsg))
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
  .addVariadicPositionalParam(
    'deployArgsArray',
    'Contract constructor arguments array',
    [],
    types.array
  )
  .setAction(deployAssetTask)
