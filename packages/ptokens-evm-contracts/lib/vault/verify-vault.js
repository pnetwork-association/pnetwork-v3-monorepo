const { checkEthAddress } = require('./utils')
const { checkNetwork } = require('./check-network')
const { executeCommand } = require('./execute-command')
const { ETHERSCAN_ENV_VAR_KEY } = require('../constants')
const { maybeHandleEtherscanTrimErrMsg } = require('./utils')
const { getEnvConfiguration } = require('./get-env-configuration')
const { checkEnvironmentVariableExists } = require('./get-environment-variable')

const getVerificationCommand = (_address, _network) => {
  return `npx hardhat verify --contract contracts/Erc20Vault.sol:Erc20Vault --network ${_network} ${_address}`
}

const executeVerificationCommand = executeCommand(
  '✔ Executing verification command...'
)

const verifyVault = (_network, _address) =>
  console.info('✔ Verifying vault contract...') ||
  getEnvConfiguration()
    .then(_ => checkEthAddress(_address))
    .then(_ => checkNetwork(_network))
    .then(_ => checkEnvironmentVariableExists(ETHERSCAN_ENV_VAR_KEY))
    .then(_ => getVerificationCommand(_address, _network))
    .then(executeVerificationCommand)
    .then(console.info)
    .catch(maybeHandleEtherscanTrimErrMsg)

module.exports = { verifyVault }
