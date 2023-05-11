const {
  KEY_ADDRESS,
  KEY_NETWORK_ID,
  CONTRACT_NAME_PTOKEN,
  TASK_DESC_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_PTOKEN,
  TASK_NAME_DEPLOY_ASSET,
  KEY_PROUTER,
  KEY_STATEMANAGER,
  KEY_PTOKEN_LIST,
  TASK_NAME_DEPLOY_PROUTER,
  TASK_NAME_DEPLOY_STATEMANAGER,
  TASK_NAME_CONFIG_PFACTORY,
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

const deployPTokenTask = ({ tokenAddress, underlyingAssetChainName, challengePeriod = '120' }, hre) =>
  deployPFactoryTask(null, hre)
    .then(_ => hre.run(TASK_NAME_DEPLOY_PROUTER))
    .then(_ => hre.run(TASK_NAME_DEPLOY_STATEMANAGER, {challengePeriod: challengePeriod}))
    .then(_ => hre.run(TASK_NAME_CONFIG_PFACTORY))
    .then(_ => Promise.all([getUnderlyingAssetContract(tokenAddress, underlyingAssetChainName, hre), getConfiguration()]))
    .then(([_props, _config]) =>
      console.info('Deploying pToken ...') ||
      hre.run(TASK_NAME_DEPLOY_ASSET, {
        configurableName: KEY_PTOKEN_LIST,
        contractFactoryName: CONTRACT_NAME_PTOKEN,
        deployArgsArray: [
          _props.name,
          _props.symbol,
          _props.decimals,
          tokenAddress,
          _config.get(underlyingAssetChainName)[KEY_NETWORK_ID],
          // _config.get(hre.network.name)[KEY_PROUTER][KEY_ADDRESS],
          // _config.get(hre.network.name)[KEY_STATEMANAGER][KEY_ADDRESS],
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
  .addOptionalParam("challengePeriod", "Define a challenge period for the state manager if not already deployed", undefined, types.string)
