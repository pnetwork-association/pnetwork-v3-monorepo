const R = require('ramda')
const {
  TASK_NAME_DEPLOY_INIT,
  TASK_NAME_DEPLOY_CONTRACT,
  TASK_DESC_DEPLOY_CONTRACT,
} = require('../constants')
const { utils, errors } = require('ptokens-utils')
const {
  getConfiguration,
  updateConfiguration,
} = require('./lib/configuration-manager')
const { types } = require('hardhat/config')

const saveContractAddress = R.curry((hre, taskArgs, _contract) =>
  getConfiguration()
    .then(_config =>
      updateConfiguration(
        _config,
        hre.network.name,
        taskArgs.configurableName,
        _contract.address
      )
    )
    .then(_ => _contract)
)

const awaitTxSaveAddressAndReturnContract = R.curry(
  (hre, taskArgs, _contract) =>
    _contract.deployTransaction
      .wait()
      .then(
        _tx =>
          console.info(`Tx mined @ ${_tx.transactionHash}`) ||
          console.info(
            `${taskArgs.configurableName} @ ${_tx.contractAddress}`
          ) ||
          saveContractAddress(hre, taskArgs, _contract)
      )
      .then(_ => _contract)
)

const deployAndSaveContractAddress = (hre, taskArgs) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factory => _factory.deploy(...taskArgs.deployArgsArray))
    .then(awaitTxSaveAddressAndReturnContract(hre, taskArgs))

const attachToContract = R.curry((hre, taskArgs, _address) =>
  hre.ethers
    .getContractFactory(taskArgs.contractFactoryName)
    .then(_factoryContract => _factoryContract.attach(_address))
    .then(
      _contract =>
        console.info(
          `${taskArgs.configurableName} found @ ${_contract.address}`
        ) || _contract
    )
)

const deployContractErrorHandler = R.curry((hre, taskArgs, _err) =>
  _err.message.includes(errors.ERROR_KEY_NOT_FOUND)
    ? deployAndSaveContractAddress(hre, taskArgs)
    : console.error(_err)
)

const deployContractTask = (taskArgs, hre) =>
  hre
    .run(TASK_NAME_DEPLOY_INIT)
    .then(utils.getKeyFromObj(taskArgs.configurableName))
    .then(attachToContract(hre, taskArgs))
    .catch(deployContractErrorHandler(hre, taskArgs))

subtask(TASK_NAME_DEPLOY_CONTRACT, TASK_DESC_DEPLOY_CONTRACT)
  .addParam(
    'configurableName',
    'Configuration property where the address will be stored',
    undefined,
    types.string
  )
  .addParam(
    'contractFactoryName',
    'Contract factory name (i.e. PFactory)',
    undefined,
    types.string
  )
  .addVariadicPositionalParam(
    'deployArgsArray',
    'Contract constructor arguments array',
    [],
    types.array
  )
  .setAction(deployContractTask)
