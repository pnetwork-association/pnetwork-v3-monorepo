const {
  KEY_ADDRESS,
  KEY_PFACTORY,
  KEY_NETWORK_ID,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
  CONTRACT_NAME_PFACTORY,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
} = require('../constants')
const R = require('ramda')
const { types } = require('hardhat/config')
const { attachToUnderlyingAsset } = require('./deploy-asset.task')
const { getConfiguration, updateConfiguration } = require('./lib/configuration-manager')

const TASK_PARAM_GAS = 'gas'
const TASK_PARAM_GASPRICE = 'gasPrice'
const TASK_PARAM_UNDERLYING_ASSET_ADDRESS = 'underlyingAssetAddress'
const TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME = 'underlyingAssetChainName'
const TASK_NAME_DEPLOY_PTOKEN = 'deploy:ptoken'
const TASK_DESC_DEPLOY_PTOKEN =
  'Deploy a pToken contract or attach to an existing one from the configuration.'

// TODO: export to ptokens-utils
const rejectIfNil = R.curry((_errMsg, _thing) =>
  R.isNil(_thing) ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_thing)
)

// TODO: export to ptokens-utils
const rejectIfLength0 = R.curry((_errMsg, _array) =>
  _array.length === 0 ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_array)
)

const isAssetAddressEqualTo = _address => R.compose(R.equals(_address), R.prop(KEY_ADDRESS))

const changeHardhatNetworkAndReturnArg = R.curry((hre, _chainName, _arg) =>
  Promise.resolve(hre.changeNetwork(_chainName)).then(_ => _arg)
)

const saveConfigurationEntry = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config =>
      updateConfiguration(_config, hre.network.name, KEY_PTOKEN_LIST, {
        [KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]: taskArgs.underlyingAssetAddress,
        [KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]: taskArgs.underlyingAssetChainName
          ? taskArgs.underlyingAssetChainName
          : hre.network.name,
        [KEY_ADDRESS]: _contract.address,
      })
    )
    .then(_ => _contract)
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
        rejectIfLength0(
          `Could not find any underlying asset with address ${underlyingAssetAddress}`
        )
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

const getUnderlyingAssetNetworkId = taskArgs =>
  getConfiguration()
    .then(_config => _config.get(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]))
    .then(R.prop(KEY_NETWORK_ID))

const attachToContract = R.curry((hre, _contractName, _address) =>
  hre.ethers.getContractFactory(_contractName).then(_factory => _factory.attach(_address))
)

const getFactoryContract = hre =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([KEY_PFACTORY, KEY_ADDRESS]))
    .then(attachToContract(hre, CONTRACT_NAME_PFACTORY))
    .catch(_err =>
      _err.message.includes('invalid contract address')
        ? Promise.reject(
            new Error(
              `Can't find any PFactory contract for '${hre.network.name}', have you deployed it?`
            )
          )
        : Promise.reject(_err)
    )

const checkStateManagerIsDeployed = hre =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([KEY_STATEMANAGER, KEY_ADDRESS]))
    .then(
      rejectIfNil(
        `Could not find any StateManager address for '${hre.network.name}', have you deployed it?`
      )
    )

const checkPRouterIsDeployed = hre =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([KEY_PROUTER, KEY_ADDRESS]))
    .then(
      rejectIfNil(
        `Could not find any PRouter address for '${hre.network.name}', have you deployed it?`
      )
    )

const getPTokenDeployArgs = (taskArgs, hre) =>
  getUnderlyingAsset(taskArgs, hre)
    .then(_underlyingAssetContract =>
      Promise.all([
        _underlyingAssetContract,
        getUnderlyingAssetNetworkId(taskArgs),
        getFactoryContract(hre),
      ])
    )
    .then(([_underlyingAssetContract, _underlyingAssetNetworkId, pFactory]) =>
      Promise.all([
        _underlyingAssetContract.name(),
        _underlyingAssetContract.symbol(),
        _underlyingAssetContract.decimals(),
        _underlyingAssetContract.address,
        _underlyingAssetNetworkId,
        { pFactory },
        taskArgs.gas,
      ])
    )

const maybeOverwriteParamsWithDefaultValues = (taskArgs, hre) =>
  Promise.resolve(
    R.isNil(taskArgs[TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME])
      ? R.assoc(TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME, hre.network.name, taskArgs)
      : taskArgs
  )

const deployPToken = async (
  _underlyingAssetName,
  _underlyingAssetSymbol,
  _underlyingAssetDecimals,
  _underlyingAssetTokenAddress,
  _underlyingAssetChainId,
  { pFactory }
) =>
  // _gasLimit = 0 // FIXME: I think this function interface needs a bit of redesign in order to pass gas+gasprice
  {
    const PToken = await ethers.getContractFactory('PToken')
    const args = [
      _underlyingAssetName,
      _underlyingAssetSymbol,
      _underlyingAssetDecimals,
      _underlyingAssetTokenAddress,
      _underlyingAssetChainId,
    ]
    // if (R.isNotNil(_gasLimit)) args.push({ gasLimit: _gasLimit })

    console.log(args)
    const transaction = await pFactory.deploy(...args)
    console.log(transaction)
    const receipt = await transaction.wait()
    const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
    const { pTokenAddress } = event.args
    return await PToken.attach(pTokenAddress)
  }

const deployPTokenTask = (taskArgs, hre) =>
  checkPRouterIsDeployed(hre)
    .then(_ => checkStateManagerIsDeployed(hre))
    .then(_ => maybeOverwriteParamsWithDefaultValues(taskArgs, hre))
    .then(_taskArgs => getPTokenDeployArgs(_taskArgs, hre))
    .then(_args => deployPToken(..._args))
    .then(_pToken => saveConfigurationEntry(hre, taskArgs, _pToken))
    .catch(_err =>
      _err.message.includes('cannot estimate gas')
        ? console.error(
            'Error: gas estimation failed, are you sure the pToken is not deployed already? If yes, try to overwrite the gas options.'
          )
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

module.exports = {
  getUnderlyingAsset,
  deployPToken,
}
