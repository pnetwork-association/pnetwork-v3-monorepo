const {
  KEY_NETWORK_ID,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
  KEY_PROUTER_ADDRESS,
  TASK_NAME_DEPLOY_CONTRACT,
  CONTRACT_NAME_PROUTER,
  KEY_PFACTORY_ADDRESS,
  KEY_STATEMANAGER_ADDRESS,
  CONTRACT_NAME_STATEMANAGER,
} = require('../constants')
const { types } = require('hardhat/config')
const { deployPFactoryTask } = require('./deploy-pfactory.task')
const { getConfiguration } = require('./lib/configuration-manager')

const getUnderlyingAssetContract = async (underlyingAssetAddress, underlyingAssetChainName, hre) => {
  const originalChainName = hre.network.name
  hre.changeNetwork(underlyingAssetChainName)
  const ERC20 = await hre.ethers.getContractFactory('ERC20')
  const token = await ERC20.attach(underlyingAssetAddress)
  const name = await token.name()
  const symbol = await token.symbol()
  const decimals = await token.decimals()
  hre.changeNetwork(originalChainName)
  return {name: name.toString(), symbol: symbol.toString(), decimals: decimals.toString()}
};

const deployPTokenTask = ({ tokenAddress, underlyingAssetChainName }, hre) =>
  deployPFactoryTask(null, hre)
    .then(getConfiguration)
    .then(_config => hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_PROUTER_ADDRESS,
      contractFactoryName: CONTRACT_NAME_PROUTER,
      deployArgsArray: [_config.get(hre.network.name)[KEY_PFACTORY_ADDRESS]], }))
    .then(getConfiguration)
    .then(_config => hre.run(TASK_NAME_DEPLOY_CONTRACT, {
      configurableName: KEY_STATEMANAGER_ADDRESS,
      contractFactoryName: CONTRACT_NAME_STATEMANAGER,
      deployArgsArray: [_config.get(hre.network.name)[KEY_PFACTORY_ADDRESS], '120'], // to be parametrized
    }))
    .then(() => Promise.all([getUnderlyingAssetContract(tokenAddress, underlyingAssetChainName, hre), getConfiguration()]))
    .then(([_props, _config]) =>
      hre.run(TASK_NAME_DEPLOY_ASSET, {
        configurableName: CONTRACT_NAME_PTOKEN,
        contractFactoryName: CONTRACT_NAME_PTOKEN,
        deployArgsArray: [
          _props.name,
          _props.symbol,
          _props.decimals,
          tokenAddress,
          _config.get(underlyingAssetChainName)[KEY_NETWORK_ID],
          _config.get(hre.network.name)[KEY_PROUTER_ADDRESS],
          _config.get(hre.network.name)[KEY_STATEMANAGER_ADDRESS],
        ],
      })
    )

task(TASK_NAME_DEPLOY_PTOKEN, TASK_DESC_DEPLOY_PTOKEN, deployPTokenTask)
  .addPositionalParam(
    'tokenAddress',
    'Underlying token asset we want to wrap',
    undefined,
    types.string
  )
  .addPositionalParam('underlyingAssetChainName', 'Underlying Asset chain name', undefined, types.string)
