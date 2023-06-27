const { getStateManagerAddress } = require('../lib/configuration-manager')

const TASK_NAME_GET_PROPERTIES = 'statemanager:get-properties'
const TASK_DESC_GET_PROPERTIES = 'Get StateManager contract properties'

const getPropertyTask = async (taskArgs, hre) => {
  const stateManagerAddress = await getStateManagerAddress(hre)
  const StateManagerContract = await hre.ethers.getContractFactory('StateManager')
  const stateManager = await StateManagerContract.attach(stateManagerAddress)

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
    console.info(properties[i], await stateManager[properties[i]]())
  }
}

task(TASK_NAME_GET_PROPERTIES, TASK_DESC_GET_PROPERTIES, getPropertyTask)
