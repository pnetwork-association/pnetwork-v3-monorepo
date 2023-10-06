const { types } = require('hardhat/config')

const { getContractAddress } = require('../deploy/deploy-contract.task')
const TASK_CONSTANTS = require('../constants')

const TASK_NAME_DECODE_GOVERNANCE_MESSAGE = 'governance-message-relayer:decode-message'
const TASK_DESC_DECODE_GOVERNANCE_MESSAGE = 'Decode a governance message'

const GOVERNANCE_MESSAGE_TOPIC =
  '0x85aab78efe4e39fd3b313a465f645990e6a1b923f5f5b979957c176e632c5a07'

const main = async (_args, _hre) => {
  const GovernanceMessageEmitter = await ethers.getContractFactory('GovernanceMessageEmitter')

  const governanceMessageEmitterAddress =
    _args[TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER] ||
    (await getContractAddress(_hre, TASK_CONSTANTS.KEY_GOVERNANCE_MESSAGE_EMITTER))

  const governanceMessageEmitter = await GovernanceMessageEmitter.attach(
    governanceMessageEmitterAddress
  )

  const receipt = await ethers.provider.getTransactionReceipt(_args.txHash)
  const governanceMessageLog = receipt.logs.find(_log =>
    _log.topics.includes(GOVERNANCE_MESSAGE_TOPIC)
  )
  const decodedLog = governanceMessageEmitter.interface.parseLog(governanceMessageLog)
  const messageData = decodedLog.args.data

  const abiCoder = new ethers.utils.AbiCoder()

  const decodedMessage = abiCoder.decode(['uint256', 'uint32[]', 'address[]', 'bytes'], messageData)
  return decodedMessage
}

task(TASK_NAME_DECODE_GOVERNANCE_MESSAGE, TASK_DESC_DECODE_GOVERNANCE_MESSAGE, main)
  .addPositionalParam(
    TASK_CONSTANTS.PARAM_NAME_TX_HASH,
    TASK_CONSTANTS.PARAM_DESC_TX_HASH,
    undefined,
    types.string
  )
  .addOptionalParam(
    TASK_CONSTANTS.PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    TASK_CONSTANTS.PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )

module.exports = {
  TASK_NAME_DECODE_GOVERNANCE_MESSAGE,
}
