const { PNETWORK_NETWORK_IDS } = require('../constants')

module.exports = class Operation {
  constructor(_opts = {}) {
    const {
      originBlockHash = '0x'.padEnd(66, '0'),
      originTransactionHash = '0x'.padEnd(66, '0'),
      optionsMask = '0x'.padEnd(66, '0'),
      nonce = 0,
      underlyingAssetDecimals = 0,
      assetAmount = '0',
      protocolFeeAssetAmount = '0',
      underlyingAssetTokenAddress = '0x'.padEnd(42, '0'),
      originNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      destinationNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      underlyingAssetNetworkId = PNETWORK_NETWORK_IDS.hardhat,
      forwardDestinationNetworkId = PNETWORK_NETWORK_IDS.ethereumMainnet,
      destinationAccount = '0x'.padEnd(42, '0'),
      underlyingAssetName = 'NAME',
      underlyingAssetSymbol = 'SYMBOL',
      userData = '0x',
    } = _opts

    this.originBlockHash = originBlockHash
    this.originTransactionHash = originTransactionHash
    this.optionsMask = optionsMask
    this.nonce = nonce
    this.underlyingAssetDecimals = underlyingAssetDecimals
    this.assetAmount = assetAmount
    this.underlyingAssetTokenAddress = underlyingAssetTokenAddress
    this.originNetworkId = originNetworkId
    this.destinationNetworkId = destinationNetworkId
    this.underlyingAssetNetworkId = underlyingAssetNetworkId
    this.destinationAccount = destinationAccount
    this.underlyingAssetName = underlyingAssetName
    this.underlyingAssetSymbol = underlyingAssetSymbol
    this.userData = userData
    this.protocolFeeAssetAmount = protocolFeeAssetAmount
    this.forwardDestinationNetworkId = forwardDestinationNetworkId
  }

  serialize() {
    return [
      this.originBlockHash,
      this.originTransactionHash,
      this.optionsMask,
      this.nonce,
      this.underlyingAssetDecimals,
      this.assetAmount,
      this.protocolFeeAssetAmount,
      this.underlyingAssetTokenAddress,
      this.originNetworkId,
      this.destinationNetworkId,
      this.forwardDestinationNetworkId,
      this.underlyingAssetNetworkId,
      this.destinationAccount,
      this.underlyingAssetName,
      this.underlyingAssetSymbol,
      this.userData,
    ]
  }

  get() {
    return this.serialize()
  }

  getFee() {
    return this.assetAmount.mul(20).div(10000)
  }
}
