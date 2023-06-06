// const { ethers } = require('hardhat')

module.exports.deployPToken = async (
  _underlyingAssetName,
  _underlyingAssetSymbol,
  _underlyingAssetDecimals,
  _underlyingAssetTokenAddress,
  _underlyingAssetChainId,
  { pFactory }
) => {
  const PToken = await ethers.getContractFactory('PToken')
  const transaction = await pFactory.deploy(
    _underlyingAssetName,
    _underlyingAssetSymbol,
    _underlyingAssetDecimals,
    _underlyingAssetTokenAddress,
    _underlyingAssetChainId,
    {
      gasLimit: 30000000,
    }
  )
  const receipt = await transaction.wait()
  const event = receipt.events.find(({ event }) => event === 'PTokenDeployed')
  const { pTokenAddress } = event.args

  return await PToken.attach(pTokenAddress)
}

module.exports.getOptionMaskWithOptionEnabledForBit = (
  _position,
  _optionMask = '0x'.padEnd(66, '0')
) => {
  const binaryString = BigInt(_optionMask).toString(2).padStart(256, '0')
  const binaryArray = binaryString.split('')
  binaryArray[255 - _position] = '1'
  return (
    '0x' +
    BigInt('0b' + binaryArray.join(''))
      .toString(16)
      .padStart(64, '0')
  )
}

module.exports.getOptionMaskWithOptionEnabledForBit = (
  _position,
  _optionMask = '0x'.padEnd(66, '0')
) => {
  const binaryString = BigInt(_optionMask).toString(2).padStart(256, '0')
  const binaryArray = binaryString.split('')
  binaryArray[255 - _position] = '1'
  return (
    '0x' +
    BigInt('0b' + binaryArray.join(''))
      .toString(16)
      .padStart(64, '0')
  )
}
