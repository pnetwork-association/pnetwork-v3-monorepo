const R = require('ramda')
const { logger } = require('../get-logger')
const constants = require('ptokens-constants')

const userOperationTuple =
  'tuple(' +
  'bytes32 originBlockHash, ' +
  'bytes32 originTransactionHash, ' +
  'bytes32 optionsMask, ' +
  'uint256 nonce, ' +
  'uint256 underlyingAssetDecimals, ' +
  'uint256 assetAmount, ' +
  'uint256 protocolFeeAssetAmount, ' +
  'uint256 networkFeeAssetAmount, ' +
  'uint256 forwardNetworkFeeAssetAmount, ' +
  'address underlyingAssetTokenAddress, ' +
  'bytes4 originNetworkId, ' +
  'bytes4 destinationNetworkId, ' +
  'bytes4 forwardDestinationNetworkId, ' +
  'bytes4 underlyingAssetNetworkId, ' +
  'string destinationAccount, ' +
  'string underlyingAssetName, ' +
  'string underlyingAssetSymbol, ' +
  'bytes userData, ' +
  ')'

const hubErrors = [
  `error OperationAlreadyQueued(${userOperationTuple} operation)`,
  `error OperationAlreadyExecuted(${userOperationTuple} operation)`,
  `error OperationAlreadyCancelled(${userOperationTuple} operation)`,
  `error OperationCancelled(${userOperationTuple} operation)`,
  `error OperationNotQueued(${userOperationTuple} operation)`,
  `error GovernanceOperationAlreadyCancelled(${userOperationTuple} operation)`,
  `error GuardianOperationAlreadyCancelled(${userOperationTuple} operation)`,
  `error SentinelOperationAlreadyCancelled(${userOperationTuple} operation)`,
  'error ChallengePeriodNotTerminated(uint64 startTimestamp, uint64 endTimestamp)',
  'error ChallengePeriodTerminated(uint64 startTimestamp, uint64 endTimestamp)',
  'error InvalidUnderlyingAssetName(string underlyingAssetName, string expectedUnderlyingAssetName)',
  'error InvalidUnderlyingAssetSymbol(string underlyingAssetSymbol, string expectedUnderlyingAssetSymbol)',
  'error InvalidUnderlyingAssetDecimals(uint256 underlyingAssetDecimals, uint256 expectedUnderlyingAssetDecimals)',
  'error InvalidAssetParameters(uint256 assetAmount, address assetTokenAddress)',
  'error SenderIsNotHub()',
  'error InvalidUserOperation()',
  'error NoUserOperation()',
  'error PTokenNotCreated(address pTokenAddress)',
  'error InvalidNetwork(bytes4 networkId)',
  'error NotContract(address addr)',
  'error LockDown()',
  'error InvalidGovernanceStateReader(address expectedGovernanceMessageEmitter, address governanceMessageEmitter)',
  'error InvalidTopic(bytes32 expectedTopic, bytes32 topic)',
  'error InvalidReceiptsRootMerkleProof()',
  'error InvalidRootHashMerkleProof()',
  'error InvalidHeaderBlock()',
  'error NotRouter(address sender, address router)',
  'error InvalidAmount(uint256 amount, uint256 expectedAmount)',
  'error InvalidSourceChainId(uint32 sourceChainId, uint32 expectedSourceChainId)',
  'error InvalidGovernanceMessageVerifier(address governanceMessagerVerifier,address expectedGovernanceMessageVerifier)',
  'error InvalidSentinelRegistration(bytes1 kind)',
  'error InvalidGovernanceMessage(bytes message)',
  'error InvalidLockedAmountChallengePeriod(uint256 lockedAmountChallengePeriod,uint256 expectedLockedAmountChallengePeriod)',
  'error CallFailed()',
  'error QueueFull()',
]

const getProtocolOperationAbi = _operationName => {
  const abi = [`function ${_operationName}(${userOperationTuple} calldata operation)`]
  return R.concat(abi, hubErrors)
}

const getProtocolGuardianCancelOperationAbi = () => {
  const abi = [
    `function protocolGuardianCancelOperation(${userOperationTuple} calldata operation, bytes calldata proof)`,
  ]
  return R.concat(abi, hubErrors)
}

const getOperationStatusOfAbi = () => {
  const abi = [
    `function operationStatusOf(${userOperationTuple} calldata operation) public view returns (bytes1)`,
  ]
  return R.concat(abi, hubErrors)
}

const getChallengePeriodOfAbi = () => {
  const abi = [
    `function challengePeriodOf(${userOperationTuple} calldata operation) public view returns (uint64, uint64)`,
  ]
  return R.concat(abi, hubErrors)
}

const logUserOperationFromAbiArgs = (_operationName, _args) => {
  logger.info(`function ${_operationName}([`)
  logger.info(`  bytes32 originBlockHash ${_args[0][0]}`)
  logger.info(`  bytes32 originTransactionHash ${_args[0][1]}`)
  logger.info(`  bytes32 optionsMask ${_args[0][2]}`)
  logger.info(`  uint256 nonce ${_args[0][3]}`)
  logger.info(`  uint256 underlyingAssetDecimals ${_args[0][4]}`)
  logger.info(`  uint256 amount ${_args[0][5]}`)
  logger.info(`  address underlyingAssetTokenAddress ${_args[0][6]}`)
  logger.info(`  bytes4 originNetworkId ${_args[0][7]}`)
  logger.info(`  bytes4 destinationNetworkId ${_args[0][8]}`)
  logger.info(`  bytes4 underlyingAssetNetworkId ${_args[0][9]}`)
  logger.info(`  string destinationAccount ${_args[0][10]}`)
  logger.info(`  string underlyingAssetName ${_args[0][11]}`)
  logger.info(`  string underlyingAssetSymbol ${_args[0][12]}`)
  logger.info(`  bytes userData ${_args[0][13]}`)
  logger.info('])')
}

const getLockedAmountChallengePeriodAbi = () => [
  {
    inputs: [],
    name: 'lockedAmountChallengePeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

const getProtocolQueueOperationAbi = () => getProtocolOperationAbi('protocolQueueOperation')
const getProtocolExecuteOperationAbi = () => getProtocolOperationAbi('protocolExecuteOperation')

const getUserOperationAbiArgsFromReport = _eventReport => [
  [
    _eventReport[constants.db.KEY_ORIGINATING_BLOCK_HASH] ||
      _eventReport[constants.db.KEY_BLOCK_HASH],
    _eventReport[constants.db.KEY_ORIGINATING_TX_HASH] || _eventReport[constants.db.KEY_TX_HASH],
    _eventReport[constants.db.KEY_OPTIONS_MASK],
    _eventReport[constants.db.KEY_NONCE],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_DECIMALS],
    _eventReport[constants.db.KEY_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_PROTOCOL_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_NETWORK_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_FORWARD_NETWORK_FEE_ASSET_AMOUNT],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_TOKEN_ADDRESS],
    _eventReport[constants.db.KEY_ORIGINATING_NETWORK_ID] ||
      _eventReport[constants.db.KEY_NETWORK_ID],
    _eventReport[constants.db.KEY_DESTINATION_NETWORK_ID],
    _eventReport[constants.db.KEY_FORWARD_DESTINATION_NETWORK_ID],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_NETWORK_ID],
    _eventReport[constants.db.KEY_DESTINATION_ACCOUNT],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_NAME],
    _eventReport[constants.db.KEY_UNDERLYING_ASSET_SYMBOL],
    _eventReport[constants.db.KEY_USER_DATA],
  ],
]

module.exports = {
  getOperationStatusOfAbi,
  getChallengePeriodOfAbi,
  logUserOperationFromAbiArgs,
  getProtocolQueueOperationAbi,
  getProtocolExecuteOperationAbi,
  getUserOperationAbiArgsFromReport,
  getLockedAmountChallengePeriodAbi,
  getProtocolGuardianCancelOperationAbi,
}
