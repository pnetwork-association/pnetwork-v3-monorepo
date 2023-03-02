const getInitialStateFromConfiguration = _config => Promise.resolve({})
// .then(getDbAndPutInState(_config))
// .then(getEventFromConfigurationAndPutInState(_config))
// .then(getChainIdFromConfigurationAndPutInState(_config))
// .then(getProviderUrlFromConfigurationAndPutInState(_config))

module.exports = {
  getInitialStateFromConfiguration,
}
