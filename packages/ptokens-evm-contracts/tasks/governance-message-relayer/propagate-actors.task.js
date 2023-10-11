const R = require('ramda')
const { types } = require('hardhat/config')

const { getContractAddress } = require('../deploy/deploy-contract.task')
const { getLogs } = require('../lib/evm-utils')
const {
  FLAG_NAME_FORCE,
  FLAG_NAME_DRY,
  PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
  PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
} = require('../constants')
const registrationManagerAbi = require('./abi/registration-manager.json')

const FLAG_DESC_FORCE = 'Force propagation for current epoch'
const FLAG_DESC_DRY = 'Do not push transaction'

const GUARDIAN_REGISTRATION_UPDATED_TOPIC =
  '0xafb67f2df87eac9d09ceb6895eb788a32942fe447f270883a9cc0d8cdcda6c8f'
const SENTINEL_REGISTRATION_UPDATED_TOPIC =
  '0x32916106661bfd30613f1610cbfe60c88d0cd21bede41ff71b2e48ccede4cf3a'
const INITIALIZED_TOPIC = '0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498'
const ACTORS_PROPAGATED_TOPIC = '0x7d394dea630b3e42246f284e4e4b75cff4f959869b3d753639ba8ae6120c67c3'

const decodeRegistrationLog = _log => getRegistrationManagerInterface().parseLog(_log)

const getRegistrations = R.curry((_topic, _registrationManagerAddress, _fromBlock) =>
  getLogs(_registrationManagerAddress, [_topic], _fromBlock)
    .then(R.map(decodeRegistrationLog))
    .then(R.map(R.prop('args')))
)

const getGuardianRegistrations = getRegistrations(GUARDIAN_REGISTRATION_UPDATED_TOPIC)

const getSentinelRegistrations = getRegistrations(SENTINEL_REGISTRATION_UPDATED_TOPIC)

const getRegistrationManagerInterface = () => new ethers.utils.Interface(registrationManagerAbi)

const getRegistrationManagerDeployBlock = async _registrationManagerAddress => {
  const log = await getLogs(_registrationManagerAddress, [INITIALIZED_TOPIC], 10000)
  if (log.length === 1) return log[0].blockNumber
  else throw new Error('Unable to get inizialization block')
}

const filterForCurrentEpoch = R.curry(
  (_epoch, _registration) => _registration.startEpoch <= _epoch && _epoch <= _registration.endEpoch
)
const getAddressFromRegistrationLog = _registration =>
  _registration.guardian || _registration.sentinel

const getActiveRegistrationsByEpoch = (_registations, _epoch) =>
  _registations.filter(filterForCurrentEpoch(_epoch)).map(getAddressFromRegistrationLog)

/* eslint-disable no-console */
const main = async (_args, _hre) => {
  const GovernanceMessageEmitter = await ethers.getContractFactory('GovernanceMessageEmitter')

  const governanceMessageEmitterAddress =
    _args[PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER] ||
    (await getContractAddress(_hre, PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER))

  const governanceMessageEmitter = await GovernanceMessageEmitter.attach(
    governanceMessageEmitterAddress
  )

  const epochsManagerAddress = await governanceMessageEmitter.epochsManager()
  const EpochsManager = await ethers.getContractFactory('EpochsManager')
  const epochsManager = await EpochsManager.attach(epochsManagerAddress)

  const currentEpoch = await epochsManager.currentEpoch()

  const registrationManagerAddress = await governanceMessageEmitter.registrationManager()
  const registrationManagerDeploymentBlock = await getRegistrationManagerDeployBlock(
    registrationManagerAddress
  )

  const propagatedEvents = await getLogs(
    governanceMessageEmitter.address,
    [ACTORS_PROPAGATED_TOPIC, ethers.utils.hexZeroPad(currentEpoch, 32)],
    registrationManagerDeploymentBlock
  )

  if (propagatedEvents.length > 0 && !_args[FLAG_NAME_DRY] && !_args[FLAG_NAME_FORCE]) {
    console.warn('Actors already propagated')
    return
  }

  const guardianRegistrations = await getGuardianRegistrations(
    registrationManagerAddress,
    registrationManagerDeploymentBlock
  )
  const sentinelRegistrations = await getSentinelRegistrations(
    registrationManagerAddress,
    registrationManagerDeploymentBlock
  )

  const guardians = getActiveRegistrationsByEpoch(guardianRegistrations, currentEpoch)
  const sentinels = getActiveRegistrationsByEpoch(sentinelRegistrations, currentEpoch)
  console.info('epoch: ', currentEpoch)
  console.info('guardians\n', guardians)
  console.info('sentinels\n', sentinels)

  if (!_args[FLAG_NAME_DRY]) {
    const trasaction = await governanceMessageEmitter.propagateActors(guardians, sentinels)
    console.log('Actor addresses succesfully propagated ...', trasaction.hash)
  }
}

task('gm-relayer:propagate-actors', 'Start the actors addresses propagation', main)
  .addOptionalParam(
    PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )
  .addFlag(FLAG_NAME_FORCE, FLAG_DESC_FORCE, false, types.boolean)
  .addFlag(FLAG_NAME_DRY, FLAG_DESC_DRY, false, types.boolean)
