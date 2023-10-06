const { types } = require('hardhat/config')

const { getContractAddress } = require('../deploy/deploy-contract.task')
const TASK_CONSTANTS = require('../constants')
const { TASK_NAME_DECODE_GOVERNANCE_MESSAGE } = require('./decode-governance-message')

const TASK_NAME_HANDLE_TELEPATHY = 'gm-relayer:handle-telepathy'
const TASK_DESC_HANDLE_TELEPATHY = 'Call handleTelepathy (tests only)'

const INITIALIZED_TOPIC = '0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498'
const ACTORS_PROPAGATED_TOPIC = '0x7d394dea630b3e42246f284e4e4b75cff4f959869b3d753639ba8ae6120c67c3'

const getLogs = async (_address, _topics, _fromBlock) =>
  ethers.provider
    .getLogs({
      address: _address,
      topics: _topics,
      fromBlock: _fromBlock,
    })
    .then(_logs =>
      _logs.sort((_a, _b) =>
        _a.blockNumber > _b.blockNumber ? 1 : _b.blockNumber < _a.blockNumber ? -1 : 0
      )
    )

const getRegistrationManagerDeployBlock = async _registrationManagerAddress => {
  const log = await getLogs(_registrationManagerAddress, [INITIALIZED_TOPIC], 10000)
  if (log.length === 1) return log[0].blockNumber
  else throw new Error('Unable to get initialization block')
}

/* eslint-disable no-console */
const main = async (_args, _hre) => {
  const selectedChain = _hre.network.name

  // switch to interim chain polygon
  await _hre.changeNetwork('polygon')
  const GovernanceMessageEmitter = await ethers.getContractFactory(
    TASK_CONSTANTS.CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER
  )

  const governanceMessageEmitterAddress =
    _args[TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER] ||
    (await getContractAddress(_hre, TASK_CONSTANTS.KEY_GOVERNANCE_MESSAGE_EMITTER))

  const governanceMessageEmitter = await GovernanceMessageEmitter.attach(
    governanceMessageEmitterAddress
  )

  const epochsManagerAddress = await governanceMessageEmitter.epochsManager()
  const EpochsManager = await ethers.getContractFactory(TASK_CONSTANTS.CONTRACT_NAME_EPOCHS_MANAGER)
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

  if (propagatedEvents.length === 0) {
    console.warn('No actors propagated for the current epoch')
    return
  }

  const decodedMessage = await _hre.run(TASK_NAME_DECODE_GOVERNANCE_MESSAGE, {
    txHash: propagatedEvents.at(-1).transactionHash,
  })

  await _hre.changeNetwork(selectedChain)
  const PNetworkHub = await ethers.getContractFactory(TASK_CONSTANTS.CONTRACT_NAME_PNETWORKHUB)
  const pNetworkHubAddress = await getContractAddress(_hre, TASK_CONSTANTS.KEY_PNETWORKHUB)
  const accounts = await _hre.ethers.getSigners()
  const pNetworkHub = PNetworkHub.attach(pNetworkHubAddress)
  const tx = await pNetworkHub.handleTelepathy(1, accounts[0].address, decodedMessage[3])
  console.info(`Tx mined @ ${tx.hash}`)
}

task(TASK_NAME_HANDLE_TELEPATHY, TASK_DESC_HANDLE_TELEPATHY, main)
  .addOptionalParam(
    TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    TASK_CONSTANTS.PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )
  .addFlag('force', 'force propagation for current epoch', false, types.boolean)
