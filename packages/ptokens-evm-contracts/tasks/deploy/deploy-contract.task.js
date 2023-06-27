const {
  KEY_ADDRESS,
  KEY_UNDERLYING_ASSET_LIST,
  KEY_PFACTORY,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  KEY_ASSET_NAME,
  KEY_ASSET_SYMBOL,
  KEY_ASSET_DECIMALS,
  KEY_ASSET_TOTAL_SUPPLY,
} = require('../constants')
const { utils } = require('ptokens-utils')
const { types } = require('hardhat/config')
const { errors } = require('ptokens-utils')
const { TASK_NAME_DEPLOY_INIT } = require('./deploy-init.task')
const { getConfiguration, updateConfiguration } = require('../lib/configuration-manager')
const R = require('ramda')

const TASK_NAME_DEPLOY_CONTRACT = 'deploy:contract'
const TASK_DESC_DEPLOY_CONTRACT = 'Subtask to deploy a contract.'

const configEntryLookup = {
  [KEY_UNDERLYING_ASSET_LIST]: (_taskArgs, _contractAddress) => ({
    [KEY_ASSET_NAME]: _taskArgs.deployArgsArray[0],
    [KEY_ASSET_SYMBOL]: _taskArgs.deployArgsArray[1],
    [KEY_ASSET_DECIMALS]: _taskArgs.deployArgsArray[2],
    [KEY_ASSET_TOTAL_SUPPLY]: _taskArgs.deployArgsArray[3],
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_PFACTORY]: (_taskArgs, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_PROUTER]: (_taskArgs, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
  [KEY_STATEMANAGER]: (_taskArgs, _contractAddress) => ({
    [KEY_ADDRESS]: _contractAddress,
  }),
}

const createConfigEntryFromTaskArgs = (_taskArgs, _contractAddress) => {
  const configEntryFn = configEntryLookup[_taskArgs.configurableName]
  return configEntryFn ? configEntryFn(_taskArgs, _contractAddress) : _contractAddress
}

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

const attachToContract = R.curry((hre, taskArgs, _address) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factoryContract => _factoryContract.attach(_address))
    .then(
      _contract =>
        console.info(`${taskArgs.configurableName} found: ${JSON.stringify(_contract.address)}`) ||
        _contract
    )
)

const awaitTxSaveAddressAndReturnContract = R.curry((hre, taskArgs, _contract) =>
  _contract.deployTransaction
    .wait()
    .then(
      _tx =>
        console.info(`Tx mined @ ${_tx.transactionHash}`) ||
        console.info(`${taskArgs.configurableName} address: ${_tx.contractAddress}`) ||
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

const deployContractTask = (taskArgs, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(utils.getKeyFromObjThroughPath([taskArgs.configurableName, KEY_ADDRESS]))
    .then(attachToContract(hre, taskArgs))
    .catch(deployContractErrorHandler(hre, taskArgs))

subtask(TASK_NAME_DEPLOY_CONTRACT, TASK_DESC_DEPLOY_CONTRACT)
  .addParam(
    'configurableName',
    'Configuration property where the address will be stored',
    undefined,
    types.string
  )
  .addParam('contractFactoryName', 'Contract factory name (i.e. PFactory)', undefined, types.string)
  .addVariadicPositionalParam(
    'deployArgsArray',
    'Contract constructor arguments array',
    [],
    types.json
  )
  .setAction(deployContractTask)

module.exports = {
  TASK_NAME_DEPLOY_CONTRACT,
}
