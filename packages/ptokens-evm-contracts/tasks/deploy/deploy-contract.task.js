const { TASK_NAME_DEPLOY_INIT, TASK_NAME_DEPLOY_CONTRACT, KEY_ADDRESS } = require('../constants')
const { utils } = require('ptokens-utils')
const { types } = require('hardhat/config')
const { errors } = require('ptokens-utils')
const R = require('ramda')
const { saveConfigurationEntry } = require('./lib/utils-contracts')

const TASK_DESC_DEPLOY_CONTRACT = 'Deploy a contract.'

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
