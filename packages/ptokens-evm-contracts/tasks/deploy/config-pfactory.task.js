const {
  KEY_PFACTORY,
  CONTRACT_NAME_PFACTORY,
  TASK_DESC_CONFIG_PFACTORY,
  TASK_NAME_CONFIG_PFACTORY,
  KEY_ADDRESS,
  KEY_PROUTER,
  KEY_STATEMANAGER,
} = require('../constants')
const { getConfiguration } = require('./lib/configuration-manager')

const configPFactoryTask = (_, hre) =>
  console.info('Configuring pFactory ...') || 
  hre.ethers
    .getContractFactory(CONTRACT_NAME_PFACTORY)
    .then(_pFactory => Promise.all([_pFactory, getConfiguration()]))
    .then(([_pFactory, _config]) =>
      Promise.all([
      _pFactory.attach(_config.get(hre.network.name)[KEY_PFACTORY][KEY_ADDRESS]),
      _config,
    ]))
    .then(([_pFactory, _config]) =>
      console.info('Setting pRouter ...') ||
      Promise.all([
      _pFactory,
      _config,
      _pFactory.setRouter(_config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS]),
    ]))
    .then(([_pFactory, _config]) => 
      console.info('Setting stateManager ...') ||
      Promise.all([
      _pFactory,
      _pFactory.setStateManager(_config.get(hre.network.name)[KEY_STATEMANAGER][KEY_ADDRESS]),
    ]))
    // .then(([_pFactory]) => 
    //   console.info('Renouncing ownership ...') ||
    //   Promise.all([
    //   _pFactory.renounceOwnership()
    // ]))

task(TASK_NAME_CONFIG_PFACTORY, TASK_DESC_CONFIG_PFACTORY, configPFactoryTask)

module.exports = {
  configPFactoryTask,
}
