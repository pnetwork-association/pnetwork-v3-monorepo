const R = require('ramda')
const {
  KEY_PTOKEN_ADDRESS,
  KEY_UNDERLYING_ADDRESS,
  KEY_UNDERLYING_NAME,
  KEY_UNDERLYING_SYMBOL,
  KEY_UNDERLYING_DECIMAL,
  KEY_UNDERLYING_TOTAL_SUPPLY,
  KEY_PTOKEN_NAME,
  KEY_PTOKEN_SYMBOL,
  KEY_PTOKEN_DECIMAL,
} = require('../../constants')
const { errors } = require('ptokens-utils')
const { getConfiguration, updateConfiguration } = require('../lib/configuration-manager')

const createDataToStore = (_taskArgs, _contractAddress) =>
  _taskArgs.configurableName == KEY_PTOKEN_ADDRESS
    ? {
        [KEY_UNDERLYING_NAME]: _taskArgs.deployArgsArray[0],
        [KEY_UNDERLYING_SYMBOL]: _taskArgs.deployArgsArray[1],
        [KEY_UNDERLYING_DECIMAL]: _taskArgs.deployArgsArray[2], // these in reality are the underlying token name symbol and decimal
        [KEY_UNDERLYING_ADDRESS]: _taskArgs.underlyingAsset,
        [KEY_PTOKEN_ADDRESS]: _contractAddress,
      }
    : _taskArgs.configurableName == KEY_UNDERLYING_ADDRESS
    ? {
        [KEY_UNDERLYING_NAME]: _taskArgs.deployArgsArray[0],
        [KEY_UNDERLYING_SYMBOL]: _taskArgs.deployArgsArray[1],
        [KEY_UNDERLYING_DECIMAL]: _taskArgs.deployArgsArray[2],
        [KEY_UNDERLYING_TOTAL_SUPPLY]: _taskArgs.deployArgsArray[3],
        [KEY_UNDERLYING_ADDRESS]: _contractAddress,
      }
    : _contractAddress

const saveContractAddress = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config =>
      updateConfiguration(
        _config,
        hre.network.name,
        taskArgs.configurableName,
        createDataToStore(taskArgs, _contract.address)
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
        saveContractAddress(hre, taskArgs, _contract)
    )
    .then(_ => _contract)
)

const deployAndSaveContractAddress = (hre, taskArgs) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factory => _factory.deploy(...taskArgs.deployArgsArray))
    .then(awaitTxSaveAddressAndReturnContract(hre, taskArgs))

const deployContractErrorHandler = R.curry((hre, taskArgs, _err) =>
  _err.message.includes(errors.ERROR_KEY_NOT_FOUND)
    ? deployAndSaveContractAddress(hre, taskArgs)
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

const execAndPass = R.curry(async (funToExecute, funParameters, contract) => {
  try {
    const executedFunc =
      funParameters.length == 0 ? await funToExecute() : await R.apply(funToExecute, funParameters)
    if (Array.isArray(contract))
      return new Promise(resolve => resolve(R.concat(contract, [executedFunc])))
    else return new Promise(resolve => resolve(R.concat([contract], [executedFunc])))
  } catch (_err) {
    return new Promise((resolve, reject) => reject(_err))
  }
})

module.exports = {
  execAndPass,
  attachToContract,
  deployContractErrorHandler,
}
