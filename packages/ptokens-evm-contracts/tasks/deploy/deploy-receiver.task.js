const TASK_NAME_DEPLOY_RECEIVER = 'deploy:receiver'
const TASK_DESC_DEPLOY_RECEIVER = 'Deploy a simple contract to receive metadata'

const deployReceiverTask = async (_taskArgs, _hre) => {
  console.info('Deploying TestReceiver contract...')
  const TestReceiver = await _hre.ethers.getContractFactory('TestReceiver')
  const receiver = await TestReceiver.deploy()

  console.log('Receiver deployed @', receiver.address)
}

task(TASK_NAME_DEPLOY_RECEIVER, TASK_DESC_DEPLOY_RECEIVER, deployReceiverTask)
