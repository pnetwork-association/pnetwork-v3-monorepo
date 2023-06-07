const TASK_NAME_SM_PEO = 'state-manager:execute-operation'

const protocolExecuteOperation = async (_, hre) => {
  const signer = await hre.ethers.getSigner()
  console.log(signer.address)

  const StateManagerContract = await hre.ethers.getContractFactory('StateManager')

  const StateManager = await StateManagerContract.attach(
    '0x220f1347d38ABb3CebF94897a998db0EF58ef5E6'
  )

  console.log(StateManagerContract)
  // const parsedAmount = hre.ethers.utils.parseEther(amount)
  // console.log('Approving ...')
  // await token.approve(pTokenAddress, parsedAmount)
  console.log('Generating an UserOperation ...')

  const tx = await StateManager.protocolQueueOperation(
    [
      '0x1207c4de0a8f60a982a453403b2a9c25a8f1514a3d9706f760743e85413fb9f3',
      '0x3953cd8f3679aee486d51fd831eec05411cd3c5d4454da3abd81cc0cd91d1bb5',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '52389',
      18,
      '100000000000000000000',
      '0xdB4791bb0946E621C1Fd2C5542bd541c6C7280A6',
      '0xadc11660',
      '0xadc11660',
      '0xadc11660',
      '0xa41657bf225F8Ec7E2010C89c3F084172948264D',
      'Token',
      'TKN',
      '0x',
    ],
    {
      gasLimit: 200000,
    }
  )
  await tx.wait(1)
}

task(TASK_NAME_SM_PEO, TASK_NAME_SM_PEO, protocolExecuteOperation)

module.exports = {
  TASK_NAME_SM_PEO,
}
