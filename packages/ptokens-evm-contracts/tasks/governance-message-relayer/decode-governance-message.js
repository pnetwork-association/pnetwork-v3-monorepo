const { types } = require('hardhat/config')

const { getContractAddress } = require('../deploy/deploy-contract.task')
const {
  PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
  PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
  KEY_GOVERNANCE_MESSAGE_EMITTER,
  PARAM_NAME_TX_HASH,
  PARAM_DESC_TX_HASH,
  CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER,
} = require('../constants')

const TASK_NAME_DECODE_GOVERNANCE_MESSAGE = 'gm-relayer:decode-message'
const TASK_DESC_DECODE_GOVERNANCE_MESSAGE = 'Decode a governance message'

const GOVERNANCE_MESSAGE_TOPIC =
  '0x85aab78efe4e39fd3b313a465f645990e6a1b923f5f5b979957c176e632c5a07'

const main = async (_args, _hre) => {
  const GovernanceMessageEmitter = await ethers.getContractFactory(
    CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER
  )

  const governanceMessageEmitterAddress =
    _args[PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER] ||
    (await getContractAddress(_hre, KEY_GOVERNANCE_MESSAGE_EMITTER))

  const governanceMessageEmitter = await GovernanceMessageEmitter.attach(
    governanceMessageEmitterAddress
  )

  const receipt = await ethers.provider.getTransactionReceipt(_args[PARAM_NAME_TX_HASH])
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
  .addPositionalParam(PARAM_NAME_TX_HASH, PARAM_DESC_TX_HASH, undefined, types.string)
  .addOptionalParam(
    PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )

module.exports = {
  TASK_NAME_DECODE_GOVERNANCE_MESSAGE,
}
