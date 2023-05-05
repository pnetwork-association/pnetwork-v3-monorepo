const R = require('ramda')
const {
  KEY_ASSET_NAME,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMAL,
  KEY_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS,
  KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID,
  CONTRACT_NAME_PTOKEN,
  KEY_ASSET_TOTAL_SUPPLY,
  CONTRACT_NAME_UNDERLYING_ASSET,
} = require('../../constants')
const { errors } = require('ptokens-utils')
const { getConfiguration, updateConfiguration } = require('./configuration-manager')

const configEntryLookup = {
  [CONTRACT_NAME_PTOKEN]: (_taskArgs, _contractAddress) => ({
    [KEY_ASSET_NAME]: _taskArgs.deployArgsArray[0],
    [KEY_ASSET_SYMBOL]: _taskArgs.deployArgsArray[1],
    [KEY_ASSET_DECIMAL]: _taskArgs.deployArgsArray[2],
    [KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]: _taskArgs.deployArgsArray[3],
    [KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]: _taskArgs.deployArgsArray[4],
    [KEY_ASSET_ADDRESS]: _contractAddress,
  }),
  [CONTRACT_NAME_UNDERLYING_ASSET]: (_taskArgs, _contractAddress) => ({
    [KEY_ASSET_NAME]: _taskArgs.deployArgsArray[0],
    [KEY_ASSET_SYMBOL]: _taskArgs.deployArgsArray[1],
    [KEY_ASSET_DECIMAL]: _taskArgs.deployArgsArray[2],
    [KEY_ASSET_TOTAL_SUPPLY]: _taskArgs.deployArgsArray[3],
    [KEY_ASSET_ADDRESS]: _contractAddress,
  }),
};

const createConfigEntryFromTaskArgs  = (_taskArgs, _contractAddress) => {
  const configEntryFn = configEntryLookup[_taskArgs.configurableName];
  return configEntryFn ? configEntryFn(_taskArgs, _contractAddress) : _contractAddress;
};

const saveConfigurationEntry = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config =>
      updateConfiguration(
        _config,
        hre.network.name,
        taskArgs.configurableName,
        createConfigEntryFromTaskArgs(taskArgs, _contract.address)
      )
    )
    .then(_ => _contract)
)

const awaitTxSaveAddressAndReturnContract = R.curry((hre, taskArgs, _contract) =>
  _contract.deployTransaction
    .wait()
    .then(
      _tx =>
        console.info(`Tx mined @ ${_tx.transactionHash}`) ||
        console.info(`${taskArgs.configurableName} @ ${_tx.contractAddress}`) ||
        saveConfigurationEntry(hre, taskArgs, _contract)
    )
    .then(_ => _contract)
)

const deployAndSaveConfigurationEntry = (hre, taskArgs) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factory => _factory.deploy(...taskArgs.deployArgsArray))
    .then(awaitTxSaveAddressAndReturnContract(hre, taskArgs))

const deployContractErrorHandler = R.curry((hre, taskArgs, _err) =>
  _err.message.includes(errors.ERROR_KEY_NOT_FOUND)
    ? deployAndSaveConfigurationEntry(hre, taskArgs)
    : console.error(_err)
)

const attachToContract = R.curry((hre, taskArgs, _address) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factoryContract => _factoryContract.attach(_address))
    .then(
      _contract =>
        console.info(`${taskArgs.configurableName} found @ ${JSON.stringify(_contract.address)}`) ||
        _contract
    )
)

module.exports = {
  attachToContract,
  deployContractErrorHandler,
}
