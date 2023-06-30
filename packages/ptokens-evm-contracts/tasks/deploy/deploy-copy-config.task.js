const { updateConfiguration, getConfiguration } = require('../lib/configuration-manager')
const { createConfigEntryFromTaskArgs } = require('./deploy-contract.task')
const { types } = require('hardhat/config')
const {
  addNewUnderlyingAssetToConfig,
  TASK_PARAM_NAME,
  TASK_PARAM_DECIMALS,
  TASK_PARAM_SYMBOL,
  TASK_PARAM_TOTAL_SUPPLY,
} = require('./deploy-asset.task')
const {
  saveConfigurationEntry,
  TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME,
  TASK_PARAM_UNDERLYING_ASSET_ADDRESS,
} = require('./deploy-ptoken.task')
const { TASK_NAME_GET_NETWORK_ID } = require('../get-network-id/get-network-id.task')
const R = require('ramda')

const translateConfig = (hre, configJSON, contractName) =>
  getConfiguration().then(_config =>
    Object.prototype.hasOwnProperty.call(configJSON, contractName)
      ? updateConfiguration(
          _config,
          hre.network.name,
          contractName,
          createConfigEntryFromTaskArgs(
            { configurableName: contractName },
            configJSON[contractName]
          )
        )
      : null
  )

const addPropsToConfig = (networkName, props, values, component) =>
  getConfiguration().then(_config =>
    updateConfiguration(_config, networkName, component, R.zipObj(props, values))
  )

const addNetworkId = (networkName, component, value) =>
  getConfiguration().then(_config => updateConfiguration(_config, networkName, component, value))

const getNameFromNetworkId = networkId =>
  getConfiguration().then(_config => {
    const findNetworkName = R.pipe(
      R.toPairs,
      R.find(obj => obj.networkId === networkId),
      R.prop(0)
    )
    const NetworkName = findNetworkName(_config.get())
    return Promise.resolve(NetworkName)
  })

const generateConfig = async (taskArgs, hre) => {
  const configJSON = JSON.parse(taskArgs.configJSON)
  const underlyingNetworkName = await getNameFromNetworkId(
    configJSON.initArgs.underlyingAssetNetworkId
  )
  return hre
    .run(TASK_NAME_GET_NETWORK_ID, {
      quiet: true,
      chainId: hre.network.config.chainId,
    })
    .then(_networkId => addNetworkId(hre.network.name, 'networkId', _networkId))
    .then(translateConfig(hre, configJSON, 'pFactory'))
    .then(translateConfig(hre, configJSON, 'pRouter'))
    .then(translateConfig(hre, configJSON, 'stateManager'))
    .then(
      addPropsToConfig(
        hre.network.name,
        [
          'address',
          'baseChallengePeriodDuration',
          'allowedSourceChainId',
          'lockedAmountChallengePeriod',
          'kChallengePeriod',
          'maxOperationsInQueue',
          'telepathyRouter',
          'governanceMessageVerifier',
        ],
        [
          configJSON.stateManager,
          configJSON.initArgs.baseChallengePeriodDuration,
          configJSON.initArgs.allowedSourceChainId,
          configJSON.initArgs.lockedAmountChallengePeriod,
          configJSON.initArgs.kChallengePeriod,
          configJSON.initArgs.maxOperationsInQueue,
          configJSON.initArgs.telepathyRouter,
          configJSON.initArgs.governanceMessageVerifier,
        ],
        'stateManager'
      )
    )
    .then(translateConfig(hre, configJSON, 'epochsManager'))
    .then(translateConfig(hre, configJSON.initArgs, 'epochsManager'))
    .then(
      getConfiguration().then(_config =>
        addNewUnderlyingAssetToConfig(
          {
            [TASK_PARAM_NAME]: R.defaultTo('', configJSON.initArgs.underlyingAssetName),
            [TASK_PARAM_SYMBOL]: R.defaultTo('', configJSON.initArgs.underlyingAssetSymbol),
            [TASK_PARAM_DECIMALS]: R.defaultTo('', configJSON.initArgs.underlyingAssetDecimals),
            [TASK_PARAM_TOTAL_SUPPLY]: R.defaultTo(
              '',
              configJSON.initArgs.underlyingAssetTotalSupply
            ),
          },
          hre,
          _config,
          R.zipObj(['address'], [R.defaultTo('', configJSON.initArgs.underlyingAssetAddress)])
        )
      )
    )
    .then(
      saveConfigurationEntry(
        hre,
        {
          [TASK_PARAM_UNDERLYING_ASSET_ADDRESS]: R.defaultTo(
            '',
            configJSON.initArgs.underlyingAssetAddress
          ),
          [TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]: R.defaultTo('', underlyingNetworkName),
        },
        R.zipObj(['address'], [R.defaultTo('', configJSON.pToken)])
      )
    )
}

task('deploy:copy-from', 'copy configuration from JSON', generateConfig).addPositionalParam(
  'configJSON',
  'Insert config JSON to translate: {"pFactory": ... }',
  undefined,
  types.string
)

module.exports = {
  generateConfig,
}
