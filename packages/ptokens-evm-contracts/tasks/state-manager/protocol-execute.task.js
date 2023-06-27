const TASK_NAME_SM_PEO = 'statemanager:execute'

const protocolExecuteOperation = async (_args, { ethers }) => {
  const StateManager = await ethers.getContractFactory('StateManager')
  const stateManager = await StateManager.attach(_args.stateManager)

  console.log('Executing the UserOperation ...')
  const tx = await stateManager.protocolExecuteOperation(
    [
      _args.originBlockHash,
      _args.originTransactionHash,
      _args.optionsMask,
      _args.nonce,
      _args.underlyingAssetDecimals,
      _args.assetAmount,
      _args.underlyingAssetTokenAddress,
      _args.originNetworkId,
      _args.destinationNetworkId,
      _args.underlyingAssetNetworkId,
      _args.destinationAccount,
      _args.underlyingAssetName,
      _args.underlyingAssetSymbol,
      _args.userData,
    ],
    {
      gasLimit: 4000000,
    }
  )

  console.log(tx.hash)
  await tx.wait(1)
}

task(TASK_NAME_SM_PEO, TASK_NAME_SM_PEO, protocolExecuteOperation)
  .addPositionalParam('stateManager')
  .addPositionalParam('originBlockHash')
  .addPositionalParam('originTransactionHash')
  .addPositionalParam('optionsMask')
  .addPositionalParam('nonce')
  .addPositionalParam('underlyingAssetDecimals')
  .addPositionalParam('assetAmount')
  .addPositionalParam('underlyingAssetTokenAddress')
  .addPositionalParam('originNetworkId')
  .addPositionalParam('destinationNetworkId')
  .addPositionalParam('underlyingAssetNetworkId')
  .addPositionalParam('destinationAccount')
  .addPositionalParam('underlyingAssetName')
  .addPositionalParam('underlyingAssetSymbol')
  .addPositionalParam('userData')

module.exports = {
  TASK_NAME_SM_PEO,
}
