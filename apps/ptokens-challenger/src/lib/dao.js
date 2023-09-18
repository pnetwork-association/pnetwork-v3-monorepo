import { configDotenv } from 'dotenv'
configDotenv()
import { getContract } from 'viem'

import EpochsManagerABI from '../abi/EpochsManager.json' assert { type: 'json' }
import RegistrationManagerABI from '../abi/RegistrationManager.json' assert { type: 'json' }

const isValidActor = async ({ actor, actorType, client }) => {
  const registrationManager = getContract({
    address: process.env.REGISTRATION_MANAGER_ADDRESS,
    abi: RegistrationManagerABI,
    publicClient: client,
  })

  const epochsManager = getContract({
    address: process.env.EPOCHS_MANAGER_ADDRESS,
    abi: EpochsManagerABI,
    publicClient: client,
  })
  const currentEpoch = await epochsManager.read.currentEpoch()

  if (actorType === 'guardian') {
    const registration = await registrationManager.read.guardianRegistration([actor])
    if (currentEpoch >= registration.startEpoch && currentEpoch <= registration.endEpoch)
      return true
  }

  if (actorType === 'sentinel') {
    const registration = await registrationManager.read.sentinelRegistration([actor])
    if (currentEpoch >= registration.startEpoch && currentEpoch <= registration.endEpoch)
      return true
  }

  return false
}

export { isValidActor }
