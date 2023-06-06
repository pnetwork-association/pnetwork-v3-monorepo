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
  CONTRACT_NAME_PFACTORY,
  CONTRACT_NAME_PTOKEN,
} = require('../../constants')
const { errors } = require('ptokens-utils')
const { getConfiguration, updateConfiguration } = require('./configuration-manager')

const configEntryLookup = {
  [KEY_PTOKEN_LIST]: (_taskArgs, _contractAddress) => ({
    [KEY_PTOKEN_UNDERLYING_ASSET_ADDRESS]: _taskArgs.underlyingAssetAddress,
    [KEY_PTOKEN_UNDERLYING_ASSET_NETWORKID]: _taskArgs.underlyingAssetChainName,
    [KEY_ADDRESS]: _contractAddress,
  }),
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
  taskArgs.contractFactoryName === CONTRACT_NAME_PTOKEN
    ? hre.ethers
        .getContractFactory(CONTRACT_NAME_PFACTORY)
        .then(_factory => Promise.all([_factory, getConfiguration()]))
        .then(([_factory, _config]) =>
          _factory.attach(_config.get(hre.network.name)[KEY_PFACTORY][KEY_ADDRESS])
        )
        .then(_factory => _factory.deploy(...taskArgs.deployArgsArray, taskArgs.overrides))
        .then(_factoryContract => _factoryContract.wait())
        .then(_ptokenTx =>
          Promise.all([
            _ptokenTx.events.find(({ event }) => event === 'PTokenDeployed'),
            hre.ethers.getContractFactory(CONTRACT_NAME_PTOKEN),
          ])
        )
        .then(([_event, _ptoken]) => _ptoken.attach(_event.args.pTokenAddress))
        .then(saveConfigurationEntry(hre, taskArgs))
    : hre.ethers
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
        console.info(`${taskArgs.configurableName} found: ${JSON.stringify(_contract.address)}`) ||
        _contract
    )
)

const deployPToken = async (
  _underlyingAssetName,
  _underlyingAssetSymbol,
  _underlyingAssetDecimals,
  _underlyingAssetTokenAddress,
  _underlyingAssetChainId,
  { pFactory },
  _gasLimit = 0
) => {
  const PToken = await ethers.getContractFactory('PToken')
  const args = _gasLimit
    ? [
        _underlyingAssetName,
        _underlyingAssetSymbol,
        _underlyingAssetDecimals,
        _underlyingAssetTokenAddress,
        _underlyingAssetChainId,
        { gasLimit: _gasLimit },
      ]
    : [
        _underlyingAssetName,
        _underlyingAssetSymbol,
        _underlyingAssetDecimals,
        _underlyingAssetTokenAddress,
        _underlyingAssetChainId,
      ]

  const transaction = await pFactory.deploy(...args)
  const receipt = await transaction.wait()
  const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
  const { pTokenAddress } = event.args
  return await PToken.attach(pTokenAddress)
}

module.exports = {
  attachToContract,
  deployContractErrorHandler,
  deployPToken,
  saveConfigurationEntry,
}
