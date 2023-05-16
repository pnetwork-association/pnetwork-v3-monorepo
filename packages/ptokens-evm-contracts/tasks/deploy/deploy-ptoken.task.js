const {
  KEY_ADDRESS,
  KEY_PFACTORY,
  KEY_NETWORK_ID,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  KEY_PTOKEN_LIST,
  KEY_UNDERLYING_ASSET_LIST,
} = require('../constants')
const R = require('ramda')
const { types } = require('hardhat/config')
const { getConfiguration } = require('./lib/configuration-manager')

// TODO: export to ptokens-utils
const rejectIfNil = R.curry((_errMsg, _thing) =>
  R.isNil(_thing) ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_thing)
)

// TODO: export to ptokens-utils
const rejectIfLength0 = R.curry((_errMsg, _array) =>
  _array.length === 0 ? Promise.reject(new Error(_errMsg)) : Promise.resolve(_array)
)

const getPFactoryAddress = (hre, _config) =>
  Promise.resolve(_config.get(hre.network.name))
    .then(R.path([KEY_PFACTORY, KEY_ADDRESS]))
    .then(rejectIfNil(`Could not find any ${KEY_PFACTORY} address for '${hre.network.name}' network, is it deployed?`))
    .then(_address => console.info(`Found ${KEY_PFACTORY} @ ${_address}`) || _address)

const getPRouterAddress = (hre, _config) =>
  Promise.resolve(_config.get(hre.network.name))
    .then(R.path([KEY_PROUTER, KEY_ADDRESS]))
    .then(rejectIfNil(`Could not find any ${KEY_PROUTER} address for '${hre.network.name}' network, is it deployed?`))
    .then(_address => console.info(`Found ${KEY_PROUTER} @ ${_address}`) || _address)

const getStateManagerAddress = (hre, _config) =>
  Promise.resolve(_config.get(hre.network.name))
    .then(R.path([KEY_STATEMANAGER, KEY_ADDRESS]))
    .then(rejectIfNil(`Could not find any ${KEY_STATEMANAGER} address for '${hre.network.name}' network, is it deployed?`))
    .then(_address => console.info(`Found ${KEY_STATEMANAGER} @ ${_address}`) || _address)

const isAssetAddressEqualTo = _address => R.compose(R.equals(_address), R.prop(KEY_ADDRESS))

const getUnderlyingAsset = (_chainName, _config, _underlyingAssetAddress) =>
  Promise.resolve(_config.get(_chainName))
    .then(R.prop(KEY_UNDERLYING_ASSET_LIST))
    .then(R.filter(isAssetAddressEqualTo(_underlyingAssetAddress)))
    .then(
      rejectIfLength0(`Could not find any underlying asset with address ${_underlyingAssetAddress}`)
    )
    .then(R.prop(0))
    .then(
      _underlyingAsset =>
        console.info(`Underlying asset for ${_underlyingAssetAddress} found!`) || _underlyingAsset
    )

const deployPTokenTask = ({ underlyingAssetAddress, underlyingChain }, hre) =>
  getConfiguration()
    .then(_config =>
      Promise.all([
        getPFactoryAddress(hre, _config),
        getPRouterAddress(hre, _config),
        getStateManagerAddress(hre, _config),
        _config.get(underlyingChain)[KEY_NETWORK_ID],
        getUnderlyingAsset(underlyingChain, _config, underlyingAssetAddress),
      ])
    )
    .then(
      ([
        _pFactoryAddress,
        _pRouterAddress,
        _pStateManagerAddress,
        _underlyingAssetNetworkId,
        _underlyingAsset,
      ]) =>
        hre.run(TASK_NAME_DEPLOY_ASSET, {
          configurableName: KEY_PTOKEN_LIST,
          contractFactoryName: CONTRACT_NAME_PTOKEN,
          deployArgsArray: [
            _underlyingAsset.name,
            _underlyingAsset.symbol,
            _underlyingAsset.decimals,
            _underlyingAsset.address,
            _underlyingAssetNetworkId,
            // _pRouterAddress,
            // _pStateManagerAddress,
          ],
        })
    )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam(
    'underlyingAssetAddress',
    'Underlying asset asset address we want to wrap',
    undefined,
    types.string
  )
  .addPositionalParam(
    'underlyingChain',
    'Underlying Asset chain name',
    undefined,
    types.string
  )
  .addOptionalParam(
    'challengePeriod',
    'Define a challenge period for the state manager if not already deployed',
    undefined,
    types.string
  )
