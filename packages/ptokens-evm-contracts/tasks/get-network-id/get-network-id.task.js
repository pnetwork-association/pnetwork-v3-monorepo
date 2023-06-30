const R = require('ramda')
const { types } = require('hardhat/config')

const TASK_NAME_GET_NETWORK_ID = 'get-network-id'
const TASK_DESC_GET_NETWORK_ID = 'Get the pNetwork id for the given chain id'

const maybePrintToStdoutAndReturn = R.curry((_quiet, _value) =>
  Promise.resolve(_quiet ? _value : console.log(_value) || _value)
)

const getNetworkId = ({ chainId, versionByte, extraData, networkType, quiet }, hre) =>
  Promise.resolve(
    hre.ethers.utils.sha256(
      hre.ethers.utils.defaultAbiCoder.encode(
        ['bytes1', 'bytes1', 'uint256', 'bytes1'],
        [versionByte, networkType, chainId, extraData]
      )
    )
  )
    .then(R.slice(0, 10))
    .then(maybePrintToStdoutAndReturn(quiet))

task(TASK_NAME_GET_NETWORK_ID, TASK_DESC_GET_NETWORK_ID)
  .addOptionalParam('versionByte', 'Version byte', 0x01, types.int)
  .addOptionalParam('extraData', 'Extra data byte', 0x00, types.int)
  .addOptionalParam('networkType', 'Network type byte', 0x01, types.int)
  .addFlag('quiet', "Don't print the value to stdout", false, types.boolean)
  .addPositionalParam('chainId', 'The underlying chain id number', undefined, types.int)
  .setAction(getNetworkId)

module.exports = {
  getNetworkId,
  TASK_NAME_GET_NETWORK_ID,
}
