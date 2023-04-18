const ethers = require('ethers')

const getNetworkId = (
  chainId,
  version = 0x01,
  networkType = 0x01,
  extraData = 0x00
) =>
  ethers.utils.sha256(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes1', 'bytes1', 'uint256', 'bytes1'],
      [version, networkType, chainId, extraData]
    )
  )

module.exports = getNetworkId
