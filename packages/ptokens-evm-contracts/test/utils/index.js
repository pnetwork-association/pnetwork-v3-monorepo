const { ethers } = require('hardhat')

module.exports.deployPToken = async (
  _underlyingAssetName,
  _underlyingAssetSymbol,
  _underlyingAssetDecimals,
  _underlyingAssetTokenAddress,
  _underlyingAssetChainId,
  { pFactory }
) => {
  const ERC20 = await ethers.getContractFactory('ERC20')
  const transaction = await pFactory.deploy(
    _underlyingAssetName,
    _underlyingAssetSymbol,
    _underlyingAssetDecimals,
    _underlyingAssetTokenAddress,
    _underlyingAssetChainId
  )
  const receipt = await transaction.wait()
  const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
  const { pTokenAddress } = event.args
  return await ERC20.attach(pTokenAddress)
}
