const { updateConfiguration, getConfiguration } = require('../lib/configuration-manager')
const { createConfigEntryFromTaskArgs } = require('./deploy-contract.task')
const { addNewUnderlyingAssetToConfig, TASK_PARAM_NAME, TASK_PARAM_DECIMALS, TASK_PARAM_SYMBOL, TASK_PARAM_TOTAL_SUPPLY } = require('./deploy-asset.task')
const { saveConfigurationEntry, TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME, TASK_PARAM_UNDERLYING_ASSET_ADDRESS } = require('./deploy-ptoken.task')
const { TASK_NAME_DEPLOY_INIT } = require('./deploy-init.task')
const R = require('ramda')

const translateConfig = (configJSON, contractName) => {
  getConfiguration()
    .then(_config => configJSON.hasOwnProperty(contractName) ?
      updateConfiguration(
        _config,
        hre.network.name,
        contractName,
        createConfigEntryFromTaskArgs({'configurableName': contractName}, configJSON[contractName])
        )  
      : null)
}

const addPropsToConfig = (hre, props, values, component) => {
  getConfiguration()
    .then(_config => 
      updateConfiguration(
      _config,
      hre.network.name,
      component,
      R.zipObj(props, values)
      )
    )
}

const generateConfig = async (taskArgs, hre) => {
  const configJSON = JSON.parse(taskArgs.configJSON)
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(translateConfig(configJSON, 'pFactory'))
    .then(translateConfig(configJSON, 'pRouter'))
    .then(translateConfig(configJSON, 'stateManager'))
    .then(addPropsToConfig(
      hre,
      [
        'address', 
        'baseChallengePeriodDuration', 
        'allowedSourceChainId', 
        'lockedAmountChallengePeriod', 
        'kChallengePeriod', 
        'maxOperationsInQueue'
      ],
      [
        configJSON.stateManager,
        configJSON.initArgs.baseChallengePeriodDuration,
        configJSON.initArgs.allowedSourceChainId,
        configJSON.initArgs.lockedAmountChallengePeriod,
        configJSON.initArgs.kChallengePeriod,
        configJSON.initArgs.maxOperationsInQueue,
      ],
      'stateManager'
      )
    )
    .then(addPropsToConfig(['address'], [configJSON.epochsManager], 'epochsManager'))
    .then(addPropsToConfig(['address'], [configJSON.epochsManager], 'telepathyRouter'))
    .then(addPropsToConfig(['address'], [configJSON.epochsManager], 'governanceMessageVerifier'))
    .then(getConfiguration()
      .then(_config => addNewUnderlyingAssetToConfig(
        {
          [TASK_PARAM_NAME]: R.defaultTo('', configJSON.initArgs.underlyingAssetName),
          [TASK_PARAM_SYMBOL]: R.defaultTo('', configJSON.initArgs.underlyingAssetSymbol),
          [TASK_PARAM_DECIMALS]: R.defaultTo('', configJSON.initArgs.underlyingAssetDecimals),
          [TASK_PARAM_TOTAL_SUPPLY]: R.defaultTo('', configJSON.initArgs.underlyingAssetTotalSupply),
        },
        hre,
        _config,
        R.zipObj(['address'], [R.defaultTo('', configJSON.initArgs.underlyingAssetAddress)])
      )))
    .then(saveConfigurationEntry(
      hre,
      {
        [TASK_PARAM_UNDERLYING_ASSET_ADDRESS]: R.defaultTo('', configJSON.initArgs.underlyingAssetAddress),
        [TASK_PARAM_UNDERLYING_ASSET_CHAIN_NAME]: R.defaultTo('', configJSON.initArgs.underlyingAssetNetworkId),
      },
      R.defaultTo('', configJSON.pToken)
    ))
}

task(
  'deploy:copy-from',
  'copy configuration from JSON',
  generateConfig
)
.addPositionalParam(
  'configJSON',
  'Insert config JSON to translate: {"pFactory": ... }',
  undefined,
  types.string
)

module.exports = {
  generateConfig
}