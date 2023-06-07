const R = require('ramda')
const {
  KEY_ADDRESS,
  KEY_ASSET_NAME,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMALS,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  KEY_PTOKEN_LIST,
  KEY_ASSET_TOTAL_SUPPLY,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_PROUTER,
  KEY_PFACTORY,
  KEY_STATEMANAGER,
} = require('../../constants')
const { getConfiguration, updateConfiguration } = require('./configuration-manager')

const configEntryLookup = {
  [KEY_PTOKEN_LIST]: (_taskArgs, networkName, _contractAddress) => ({
    [KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]: _taskArgs.underlyingAssetAddress,
    [KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]: _taskArgs.underlyingAssetChainName
      ? _taskArgs.underlyingAssetChainName
      : networkName,
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_UNDERLYING_ASSET_LIST]: (_taskArgs, networkName, _contractAddress) => ({
    [KEY_ASSET_NAME]: _taskArgs.deployArgsArray[0],
    [KEY_ASSET_SYMBOL]: _taskArgs.deployArgsArray[1],
    [KEY_ASSET_DECIMALS]: _taskArgs.deployArgsArray[2],
    [KEY_ASSET_TOTAL_SUPPLY]: _taskArgs.deployArgsArray[3],
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_PFACTORY]: (_taskArgs, networkName, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_PROUTER]: (_taskArgs, networkName, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_STATEMANAGER]: (_taskArgs, networkName, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
}

const createConfigEntryFromTaskArgs = (_taskArgs, networkName, _contractAddress) => {
  const configEntryFn = configEntryLookup[_taskArgs.configurableName]
  return configEntryFn ? configEntryFn(_taskArgs, networkName, _contractAddress) : _contractAddress
}

const saveConfigurationEntry = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config =>
      updateConfiguration(
        _config,
        hre.network.name,
        taskArgs.configurableName,
        createConfigEntryFromTaskArgs(taskArgs, hre.network.name, _contract.address)
      )
    )
    .then(_ => _contract)
)

module.exports = {
  saveConfigurationEntry,
}
