const { getHubAddress } = require('../lib/configuration-manager')

const TASK_NAME_GET_PROPERTIES = 'pnetworkhub:get-properties'
const TASK_DESC_GET_PROPERTIES = 'Get PNetworkHub contract properties'

const getPropertyTask = async (taskArgs, hre) => {
  const hubAddress = await getHubAddress(hre)
  const hubContract = await hre.ethers.getContractFactory('PNetworkHub')
  const hub = await hubContract.attach(hubAddress)

  const properties = [
    'allowedSourceChainId',
    'baseChallengePeriodDuration',
    'epochsManager',
    'factory',
    'getCurrentChallengePeriodDuration',
    'governanceMessageVerifier',
    'kChallengePeriod',
    'lockedAmountChallengePeriod',
    'maxOperationsInQueue',
    'numberOfOperationsInQueue',
  ]

  for (let i = 0; i < properties.length; i++) {
    console.info(properties[i], await hub[properties[i]]())
  }
}

task(TASK_NAME_GET_PROPERTIES, TASK_DESC_GET_PROPERTIES, getPropertyTask)
