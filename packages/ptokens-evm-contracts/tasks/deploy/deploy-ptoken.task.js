const TASK_CONSTANTS = require('../constants')
const R = require('ramda')
const { types } = require('hardhat/config')
const { attachToUnderlyingAsset } = require('./deploy-asset.task')
const {
  getConfiguration,
  updateConfiguration,
  checkHubIsDeployed,
} = require('../lib/configuration-manager')

const TASK_NAME_DEPLOY_PTOKEN = 'deploy:ptoken'
const TASK_DESC_DEPLOY_PTOKEN =
  'Deploy a pToken contract or attach to an existing one from the configuration.'

const changeHardhatNetworkAndReturnArg = R.curry((hre, _chainName, _arg) =>
  Promise.resolve(hre.changeNetwork(_chainName)).then(_ => _arg)
)

const createPtokenAssetEntry = taskArgs =>
  Promise.resolve({
    [TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]:
      taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_ADDRESS],
    [TASK_CONSTANTS.KEY_PTOKEN_UNDERLYING_ASSET_CHAIN_NAME]:
      taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME],
  })

const saveConfigurationEntry = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config => Promise.all([_config, createPtokenAssetEntry(taskArgs)]))
    .then(([_config, _entry]) =>
      Promise.all([_config, R.assoc(TASK_CONSTANTS.KEY_ADDRESS, _contract.address, _entry)])
    )
    .then(([_config, _entry]) =>
      R.not(
        R.any(
          R.equals(_entry),
          R.defaultTo([], _config.get(hre.network.name)[TASK_CONSTANTS.KEY_PTOKEN_LIST])
        )
      )
        ? updateConfiguration(_config, hre.network.name, TASK_CONSTANTS.KEY_PTOKEN_LIST, _entry)
        : null
    )
    .then(_ => _contract)
)

const getUnderlyingAsset = (taskArgs, hre) =>
  new Promise(resolve => {
    const underlyingAssetAddress = taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_ADDRESS]
    const underlyingAssetChainName = taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME]
    const selectedChain = hre.network.name

    return getConfiguration()
      .then(_config => _config.get(taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME]))
      .then(changeHardhatNetworkAndReturnArg(hre, underlyingAssetChainName))
      .then(_ => attachToUnderlyingAsset(taskArgs, hre, underlyingAssetAddress))
      .then(changeHardhatNetworkAndReturnArg(hre, selectedChain))
      .then(resolve)
  })

const getUnderlyingAssetNetworkId = taskArgs =>
  getConfiguration()
    .then(_config => _config.get(taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME]))
    .then(R.prop(TASK_CONSTANTS.KEY_NETWORK_ID))

const attachToContract = R.curry((hre, _contractName, _address) =>
  hre.ethers.getContractFactory(_contractName).then(_factory => _factory.attach(_address))
)

const getFactoryContract = hre =>
  getConfiguration()
    .then(_config => _config.get(hre.network.name))
    .then(R.path([TASK_CONSTANTS.KEY_PFACTORY, TASK_CONSTANTS.KEY_ADDRESS]))
    .then(attachToContract(hre, TASK_CONSTANTS.CONTRACT_NAME_PFACTORY))
    .catch(_err =>
      _err.message.includes('invalid contract address')
        ? Promise.reject(
            new Error(
              `Can't find any PFactory contract for '${hre.network.name}', have you deployed it?`
            )
          )
        : Promise.reject(_err)
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
    R.isNil(taskArgs[TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME])
      ? R.assoc(TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME, hre.network.name, taskArgs)
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

    const transaction = await pFactory.deploy(...args)
    const receipt = await transaction.wait()
    const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
    const { pTokenAddress } = event.args
    return await PToken.attach(pTokenAddress)
  }

const deployPTokenTask = (taskArgs, hre) =>
  checkHubIsDeployed(hre)
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
    TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_ADDRESS,
    TASK_CONSTANTS.PARAM_DESC_UNDERLYING_ASSET_ADDRESS,
    undefined,
    types.string
  )
  .addOptionalParam(
    TASK_CONSTANTS.PARAM_NAME_UNDERLYING_ASSET_CHAIN_NAME,
    TASK_CONSTANTS.PARAM_DESC_UNDERLYING_ASSET_CHAIN_NAME,
    undefined,
    types.string
  )
  .addOptionalParam(
    TASK_CONSTANTS.PARAM_NAME_GAS,
    TASK_CONSTANTS.PARAM_DESC_GAS,
    undefined,
    types.int
  )
  .addOptionalParam(
    TASK_CONSTANTS.PARAM_NAME_GASPRICE,
    TASK_CONSTANTS.PARAM_DESC_GASPRICE,
    undefined,
    types.int
  )

module.exports = {
  getUnderlyingAsset,
  deployPToken,
  saveConfigurationEntry,
}
