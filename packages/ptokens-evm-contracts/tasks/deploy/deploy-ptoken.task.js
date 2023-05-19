const {
  KEY_ADDRESS,
  KEY_PFACTORY,
  KEY_NETWORK_ID,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  CONTRACT_NAME_PFACTORY,
  KEY_ASSET_NAME,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMALS,
} = require('../constants')
const R = require('ramda')
const { types } = require('hardhat/config')
const assetTypes = require('./lib/asset-types')
const { deployPToken } = require('../../test/utils')
const { attachToUnderlyingAsset } = require('./deploy-asset.task')
const { getConfiguration } = require('./lib/configuration-manager')

const TASK_PARAM_GAS = 'gas'
const TASK_PARAM_GASPRICE = 'gasPrice'
const TASK_PARAM_UNDERLYING_ASSET_ADDRESS = 'underlyingAssetAddress'
const TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME = 'underlyingAssetChainName'

// TODO: export to ptokens-utils
const rejectIfNil = R.curry((_errMsg, _thing) =>
  R.isNil(_thing) ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_thing)
)

// TODO: export to ptokens-utils
const rejectIfLength0 = R.curry((_errMsg, _array) =>
  _array.length === 0 ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_array)
)

const getPFactoryAddress = (hre, _config) =>
  Promise.resolve(_config.get(hre.network.name))
    .then(R.path([KEY_PFACTORY, KEY_ADDRESS]))
    .then(
      rejectIfNil(
        `Could not find any ${KEY_PFACTORY} address for '${hre.network.name}' network, is it deployed?`
      )
    )
    .then(_address => console.info(`Found ${KEY_PFACTORY} @ ${_address}`) || _address)

const isAssetAddressEqualTo = _address => R.compose(R.equals(_address), R.prop(KEY_ADDRESS))

const changeHardhatNetworkAndReturnArg = R.curry((hre, _chainName, _arg) =>
  Promise.resolve(hre.changeNetwork(_chainName))
    .then(_ => _arg)
)

const getUnderlyingAsset = (taskArgs, hre) =>
  new Promise(resolve => {
  const underlyingAssetAddress = taskArgs[TASK_PARAM_UNDERLYING_ASSET_ADDRESS]
  const underlyingAssetChainName = taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]
  const selectedChain = hre.network.name

  return getConfiguration()
    .then(_config => _config.get(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]))
    .then(R.prop(KEY_UNDERLYING_ASSET_LIST))
    .then(R.filter(isAssetAddressEqualTo(underlyingAssetAddress)))
    .then(
      rejectIfLength0(`Could not find any underlying asset with address ${underlyingAssetAddress}`)
    )
    .then(R.prop(0))
    .then(
      _underlyingAsset =>
        console.info(`Underlying asset for ${underlyingAssetAddress} found!`) || _underlyingAsset
    )
    .then(changeHardhatNetworkAndReturnArg(hre, underlyingAssetChainName))
    .then(attachToUnderlyingAsset(taskArgs, hre))
    .then(changeHardhatNetworkAndReturnArg(hre, selectedChain))
    .then(resolve)
})

const getUnderlyingAssetNetworkId = (taskArgs, hre) =>
  getConfiguration()
    .then(_config => _config.get(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]))
    .then(R.prop(KEY_NETWORK_ID))

const attachToContract = R.curry(
  (hre, _contractName, _address) =>
    hre.ethers.getContractFactory(_contractName).then(_factory => _factory.attach(_address))
)

const getFactoryContract = (taskArgs, hre) =>
  getConfiguration()
    .then(_config => _config.get(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]))
    .then(R.path([KEY_PFACTORY, KEY_ADDRESS]))
    .then(attachToContract(hre, CONTRACT_NAME_PFACTORY))
    .catch(_err =>
      _err.message.includes('invalid contract address')
        ? Promise.reject(new Error(`Can't find any PFactory contract for '${hre.network.name}', have you deployed it?`))
        : Promise.reject(_err)
    )

const checkStateManagerIsDeployed = (taskArgs, hre) =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([KEY_STATEMANAGER, KEY_ADDRESS]))
    .then(rejectIfNil(`Could not find any StateManager address for '${hre.network.name}', have you deployed it?`))

const checkPRouterIsDeployed = (taskArgs, hre) =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([KEY_PROUTER, KEY_ADDRESS]))
    .then(rejectIfNil(`Could not find any PRouter address for '${hre.network.name}', have you deployed it?`))

const getPTokenDeployArgs = (taskArgs, hre) =>
  Promise.all([
    getUnderlyingAsset(taskArgs, hre),
    getUnderlyingAssetNetworkId(taskArgs, hre),
    getFactoryContract(taskArgs, hre),
  ])
  .then(
    ([
      _underlyingAssetContract,
      _underlyingAssetNetworkId,
      pFactory,
    ]) => console.log(_underlyingAssetContract) ||Promise.all([
      _underlyingAssetContract.name(),
      _underlyingAssetContract.symbol(),
      _underlyingAssetContract.decimals(),
      _underlyingAssetContract.address,
      _underlyingAssetNetworkId,
      { pFactory },
    ])
  )

const maybeOverwriteParamsWithDefaultValues = (taskArgs, hre) =>
  Promise.resolve(
    R.isNil(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME])
      ? R.assoc(TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME, hre.network.name, taskArgs)
      : taskArgs
  )

const deployPTokenTask = (taskArgs, hre) =>
  checkPRouterIsDeployed(taskArgs, hre)
    .then(_ => checkStateManagerIsDeployed(taskArgs, hre))
    .then(_ => maybeOverwriteParamsWithDefaultValues(taskArgs, hre))
    .then(_taskArgs => getPTokenDeployArgs(_taskArgs, hre))
    .then(_args => deployPToken(..._args))
    .catch(_err =>
      _err.message.includes('cannot estimate gas')
        ? console.error('Error: gas estimation failed, are you sure the pToken is not deployed already? If yes, try to overwrite the gas options.')
        : Promise.reject(_err)
    )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam(
    TASK_PARAM_UNDERLYING_ASSET_ADDRESS,
    'Underlying asset asset address we want to wrap',
    undefined,
    types.string
  )
  .addOptionalParam(
    TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME,
    'Underlying Asset chain name (defaults to the selected network)',
    undefined,
    types.string
  )
  .addOptionalParam(TASK_PARAM_GAS, 'Optional gas limit setting', undefined, types.int)
  .addOptionalParam(TASK_PARAM_GASPRICE, 'Optional gas price setting', undefined, types.int)
