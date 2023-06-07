const {
  KEY_PFACTORY,
  KEY_ADDRESS,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  CONTRACT_NAME_PFACTORY,
} = require('../constants')
const { getConfiguration } = require('./lib/configuration-manager')

const TASK_NAME_CONFIG_PFACTORY = 'config-pfactory'
const TASK_DESC_CONFIG_PFACTORY =
  'Config the pFactory contract with the pRouter and pStateManager in the configuration'

const configPFactoryTask = (_, hre) =>
  console.info('Configuring pFactory ...') ||
  hre.ethers
    .getContractFactory(CONTRACT_NAME_PFACTORY)
    .then(_pFactory => Promise.all([_pFactory, getConfiguration()]))
    .then(([_pFactory, _config]) =>
      Promise.all([
        _pFactory.attach(_config.get(hre.network.name)[KEY_PFACTORY][KEY_ADDRESS]),
        _config,
      ])
    )
    .then(
      ([_pFactory, _config]) =>
        console.info('Setting pRouter ...') ||
        Promise.all([
          _pFactory,
          _config,
          _pFactory.setRouter(_config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS]),
        ])
    )
    .then(
      ([_pFactory, _config]) =>
        console.info('Setting stateManager ...') ||
        Promise.all([
          _pFactory,
          _pFactory.setStateManager(_config.get(hre.network.name)[KEY_STATEMANAGER][KEY_ADDRESS]),
        ])
    )

task(TASK_NAME_CONFIG_PFACTORY, TASK_DESC_CONFIG_PFACTORY, configPFactoryTask)

module.exports = {
  configPFactoryTask,
}
