const constants = require('ptokens-constants')
const { getSlasherAddress } = require('../lib/configuration-manager')
const TASK_DESC = 'Resume a guardian'
const TASK_NAME = 'hub:light-resume'
const registrationManagerAbi = require('../abi/RegistrationManager.json')

const lightResume = async (_args, _hre) => {
  const actor = await _hre.ethers.getSigner()

  console.log('actor.address:', actor.address)

  const Slasher = await _hre.ethers.getContractFactory('Slasher')
  const slasherAddress = await getSlasherAddress(_hre)

  console.log('slasherAddress:', slasherAddress)

  const slasher = await Slasher.attach(slasherAddress)

  const registrationManagerAddress = await slasher.registrationManager()

  const registrationManager = new ethers.Contract(
    registrationManagerAddress,
    registrationManagerAbi,
    actor
  )
  console.log('actor.address:', actor.address)

  const registration = await registrationManager.registrationOf(actor.address)

  if (registration[0] === constants.evm.ZERO_ADDRESS) {
    console.log('Actor not registered! Aborting...')
    console.log('registration:', registration)
  }
  const nonce = Number(await registrationManager.getSignatureNonceByOwner(actor.address))

  console.log('nonce:', nonce)

  const message = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [actor.address, nonce])
  )
  const signature = await actor.signMessage(ethers.utils.arrayify(message))

  console.log('signature:', signature)

  const tx = await registrationManager.lightResume(signature, nonce)
  const receipt = await tx.wait(1)
  console.info(`Tx mined @ ${receipt.transactionHash}`)
}

task(TASK_NAME, TASK_DESC).setAction(lightResume)

module.exports = {
  TASK_NAME,
}
