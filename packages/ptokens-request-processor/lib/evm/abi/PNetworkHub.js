module.exports = {
  _format: 'hh-sol-artifact-1',
  contractName: 'PNetworkHub',
  sourceName: 'contracts/core/PNetworkHub.sol',
  abi: [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'factory_',
          type: 'address',
        },
        {
          internalType: 'uint32',
          name: 'baseChallengePeriodDuration_',
          type: 'uint32',
        },
        {
          internalType: 'address',
          name: 'epochsManager_',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'feesManager_',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'telepathyRouter',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'governanceMessageVerifier',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'slasher_',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'lockedAmountChallengePeriod_',
          type: 'uint256',
        },
        {
          internalType: 'uint16',
          name: 'kChallengePeriod_',
          type: 'uint16',
        },
        {
          internalType: 'uint16',
          name: 'maxOperationsInQueue_',
          type: 'uint16',
        },
        {
          internalType: 'bytes4',
          name: 'interimChainNetworkId_',
          type: 'bytes4',
        },
        {
          internalType: 'uint256',
          name: 'lockedAmountOpenChallenge_',
          type: 'uint256',
        },
        {
          internalType: 'uint64',
          name: 'maxChallengeDuration_',
          type: 'uint64',
        },
        {
          internalType: 'uint32',
          name: 'expectedSourceChainId',
          type: 'uint32',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'CallFailed',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengeNotFound',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint64',
          name: 'startTimestamp',
          type: 'uint64',
        },
        {
          internalType: 'uint64',
          name: 'endTimestamp',
          type: 'uint64',
        },
      ],
      name: 'ChallengePeriodNotTerminated',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint64',
          name: 'startTimestamp',
          type: 'uint64',
        },
        {
          internalType: 'uint64',
          name: 'endTimestamp',
          type: 'uint64',
        },
      ],
      name: 'ChallengePeriodTerminated',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'GovernanceOperationAlreadyCancelled',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'GuardianOperationAlreadyCancelled',
      type: 'error',
    },
    {
      inputs: [],
      name: 'Inactive',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum IPNetworkHub.ActorStatus',
          name: 'status',
          type: 'uint8',
        },
        {
          internalType: 'enum IPNetworkHub.ActorStatus',
          name: 'expectedStatus',
          type: 'uint8',
        },
      ],
      name: 'InvalidActorStatus',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'assetAmount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'assetTokenAddress',
          type: 'address',
        },
      ],
      name: 'InvalidAssetParameters',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'enum IPNetworkHub.ChallengeStatus',
          name: 'status',
          type: 'uint8',
        },
        {
          internalType: 'enum IPNetworkHub.ChallengeStatus',
          name: 'expectedStatus',
          type: 'uint8',
        },
      ],
      name: 'InvalidChallengeStatus',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
      ],
      name: 'InvalidEpoch',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes',
          name: 'message',
          type: 'bytes',
        },
      ],
      name: 'InvalidGovernanceMessage',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'governanceMessagerVerifier',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'expectedGovernanceMessageVerifier',
          type: 'address',
        },
      ],
      name: 'InvalidGovernanceMessageVerifier',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'guardian',
          type: 'address',
        },
      ],
      name: 'InvalidGuardian',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'lockedAmountChallengePeriod',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'expectedLockedAmountChallengePeriod',
          type: 'uint256',
        },
      ],
      name: 'InvalidLockedAmountChallengePeriod',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'lockedAmountStartChallenge',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'expectedLockedAmountStartChallenge',
          type: 'uint256',
        },
      ],
      name: 'InvalidLockedAmountStartChallenge',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'bytes4',
          name: 'networkId',
          type: 'bytes4',
        },
      ],
      name: 'InvalidNetwork',
      type: 'error',
    },
    {
      inputs: [],
      name: 'InvalidNetworkFeeAssetAmount',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'InvalidProtocolFee',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'protocolFeeAssetAmount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'protocolFeeAssetTokenAddress',
          type: 'address',
        },
      ],
      name: 'InvalidProtocolFeeAssetParameters',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sentinel',
          type: 'address',
        },
      ],
      name: 'InvalidSentinel',
      type: 'error',
    },
    {
      inputs: [],
      name: 'InvalidUserOperation',
      type: 'error',
    },
    {
      inputs: [],
      name: 'LockDown',
      type: 'error',
    },
    {
      inputs: [],
      name: 'MaxChallengeDurationMustBeLessOrEqualThanMaxChallengePeriodDuration',
      type: 'error',
    },
    {
      inputs: [],
      name: 'MaxChallengeDurationNotPassed',
      type: 'error',
    },
    {
      inputs: [],
      name: 'MaxChallengeDurationPassed',
      type: 'error',
    },
    {
      inputs: [],
      name: 'NearToEpochEnd',
      type: 'error',
    },
    {
      inputs: [],
      name: 'NoUserOperation',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'addr',
          type: 'address',
        },
      ],
      name: 'NotContract',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'router',
          type: 'address',
        },
      ],
      name: 'NotRouter',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationAlreadyCancelled',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationAlreadyExecuted',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationAlreadyQueued',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationNotFound',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'pTokenAddress',
          type: 'address',
        },
      ],
      name: 'PTokenNotCreated',
      type: 'error',
    },
    {
      inputs: [],
      name: 'QueueFull',
      type: 'error',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'SentinelOperationAlreadyCancelled',
      type: 'error',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'sourceChainId',
          type: 'uint32',
        },
        {
          internalType: 'uint32',
          name: 'expectedSourceChainId',
          type: 'uint32',
        },
      ],
      name: 'UnsupportedChainId',
      type: 'error',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengeCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengePartiallyUnsolved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengePending',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengeSolved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'ChallengeUnsolved',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'GovernanceOperationCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'GuardianOperationCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'guardian',
          type: 'address',
        },
      ],
      name: 'GuardianResumed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'guardian',
          type: 'address',
        },
      ],
      name: 'GuardianSlashed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationExecuted',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'OperationQueued',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          indexed: false,
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'SentinelOperationCancelled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sentinel',
          type: 'address',
        },
      ],
      name: 'SentinelResumed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sentinel',
          type: 'address',
        },
      ],
      name: 'SentinelSlashed',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'nonce',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'originAccount',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'destinationAccount',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'bytes4',
          name: 'destinationNetworkId',
          type: 'bytes4',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'underlyingAssetName',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'string',
          name: 'underlyingAssetSymbol',
          type: 'string',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'underlyingAssetDecimals',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'underlyingAssetTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes4',
          name: 'underlyingAssetNetworkId',
          type: 'bytes4',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'assetTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'assetAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'protocolFeeAssetTokenAddress',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'protocolFeeAssetAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'networkFeeAssetAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'forwardNetworkFeeAssetAmount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'bytes4',
          name: 'forwardDestinationNetworkId',
          type: 'bytes4',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'userData',
          type: 'bytes',
        },
        {
          indexed: false,
          internalType: 'bytes32',
          name: 'optionsMask',
          type: 'bytes32',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'isForProtocol',
          type: 'bool',
        },
      ],
      name: 'UserOperation',
      type: 'event',
    },
    {
      inputs: [],
      name: 'FEE_BASIS_POINTS_DIVISOR',
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
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_GUARDIANS',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_RESUME_GUARDIAN',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_RESUME_SENTINEL',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_SENTINELS',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_SLASH_GUARDIAN',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'GOVERNANCE_MESSAGE_SLASH_SENTINEL',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'baseChallengePeriodDuration',
      outputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'challengeIdOf',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'challengePeriodOf',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'challengesNonce',
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
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'claimLockedAmountStartChallenge',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'epochsManager',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'expectedSourceChainId',
      outputs: [
        {
          internalType: 'uint32',
          name: '',
          type: 'uint32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'factory',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'feesManager',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'getChallengeEpoch',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'getChallengeStatus',
      outputs: [
        {
          internalType: 'enum IPNetworkHub.ChallengeStatus',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getCurrentActiveActorsAdjustmentDuration',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getCurrentChallengePeriodDuration',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getCurrentQueuedOperationsAdjustmentDuration',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
      ],
      name: 'getGuardiansMerkleRootForEpoch',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getNetworkId',
      outputs: [
        {
          internalType: 'bytes4',
          name: '',
          type: 'bytes4',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
        {
          internalType: 'address',
          name: 'actor',
          type: 'address',
        },
      ],
      name: 'getPendingChallengeIdByEpochOf',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: 'epoch',
          type: 'uint16',
        },
      ],
      name: 'getSentinelsMerkleRootForEpoch',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getTotalNumberOfInactiveActorsForCurrentEpoch',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'governanceMessageVerifier',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint32',
          name: 'sourceChainId',
          type: 'uint32',
        },
        {
          internalType: 'address',
          name: 'sourceSender',
          type: 'address',
        },
        {
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'handleTelepathy',
      outputs: [
        {
          internalType: 'bytes4',
          name: '',
          type: 'bytes4',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'interimChainNetworkId',
      outputs: [
        {
          internalType: 'bytes4',
          name: '',
          type: 'bytes4',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'kChallengePeriod',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
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
    {
      inputs: [],
      name: 'lockedAmountStartChallenge',
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
    {
      inputs: [],
      name: 'maxChallengeDuration',
      outputs: [
        {
          internalType: 'uint64',
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'maxOperationsInQueue',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'numberOfOperationsInQueue',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'operationIdOf',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'operationStatusOf',
      outputs: [
        {
          internalType: 'enum IPNetworkHub.OperationStatus',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'protocolExecuteOperation',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'protocolGovernanceCancelOperation',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
      ],
      name: 'protocolGuardianCancelOperation',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
      ],
      name: 'protocolQueueOperation',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'originBlockHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'originTransactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'bytes32',
              name: 'optionsMask',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'underlyingAssetDecimals',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'assetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'protocolFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'networkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'forwardNetworkFeeAssetAmount',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'underlyingAssetTokenAddress',
              type: 'address',
            },
            {
              internalType: 'bytes4',
              name: 'originNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'destinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'forwardDestinationNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'bytes4',
              name: 'underlyingAssetNetworkId',
              type: 'bytes4',
            },
            {
              internalType: 'string',
              name: 'originAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'destinationAccount',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetName',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'underlyingAssetSymbol',
              type: 'string',
            },
            {
              internalType: 'bytes',
              name: 'userData',
              type: 'bytes',
            },
            {
              internalType: 'bool',
              name: 'isForProtocol',
              type: 'bool',
            },
          ],
          internalType: 'struct IPNetworkHub.Operation',
          name: 'operation',
          type: 'tuple',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes',
        },
      ],
      name: 'protocolSentinelCancelOperation',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
      ],
      name: 'slashByChallenge',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'slasher',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
      ],
      name: 'solveChallengeGuardian',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: 'uint256',
              name: 'nonce',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'actor',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'challenger',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'timestamp',
              type: 'uint64',
            },
            {
              internalType: 'bytes4',
              name: 'networkId',
              type: 'bytes4',
            },
          ],
          internalType: 'struct IPNetworkHub.Challenge',
          name: 'challenge',
          type: 'tuple',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
        {
          internalType: 'bytes',
          name: 'signature',
          type: 'bytes',
        },
      ],
      name: 'solveChallengeSentinel',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'guardian',
          type: 'address',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
      ],
      name: 'startChallengeGuardian',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sentinel',
          type: 'address',
        },
        {
          internalType: 'bytes32[]',
          name: 'proof',
          type: 'bytes32[]',
        },
      ],
      name: 'startChallengeSentinel',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'telepathyRouter',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 'destinationAccount',
          type: 'string',
        },
        {
          internalType: 'bytes4',
          name: 'destinationNetworkId',
          type: 'bytes4',
        },
        {
          internalType: 'string',
          name: 'underlyingAssetName',
          type: 'string',
        },
        {
          internalType: 'string',
          name: 'underlyingAssetSymbol',
          type: 'string',
        },
        {
          internalType: 'uint256',
          name: 'underlyingAssetDecimals',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'underlyingAssetTokenAddress',
          type: 'address',
        },
        {
          internalType: 'bytes4',
          name: 'underlyingAssetNetworkId',
          type: 'bytes4',
        },
        {
          internalType: 'address',
          name: 'assetTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'assetAmount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'protocolFeeAssetTokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'protocolFeeAssetAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'networkFeeAssetAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'forwardNetworkFeeAssetAmount',
          type: 'uint256',
        },
        {
          internalType: 'bytes',
          name: 'userData',
          type: 'bytes',
        },
        {
          internalType: 'bytes32',
          name: 'optionsMask',
          type: 'bytes32',
        },
      ],
      name: 'userSend',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  bytecode:
    '0x346200038157620061c438819003610240601f8201601f19168101906001600160401b0382119082101762000386576101c0928291604052610240391262000381576200004e6102406200039c565b6200005b610260620003b1565b90620000696102806200039c565b90620000776102a06200039c565b90620000856102c06200039c565b92620000936102e06200039c565b92620000a16103006200039c565b610320519690620000b4610340620003c3565b92620000c2610360620003c3565b61038051969095906001600160e01b03198816880362000381576103a0516103c051909a90996001600160401b038b168b036200038157620001066103e0620003b1565b9160805260a05260c052600160005561ffff8062000130886200012a8b80620003d3565b620003d3565b169063ffffffff9182881601908282116200036b578816908216038181116200036b57166001600160401b038a1611620003595760e052610100526101205261014052610160526101e0958652610180526101a0526101c05261020091825261022090815260405191615dd69384620003ee853960805184818161150501526125ad015260a0518481816126030152612779015260c05184818161220201526125d8015260e051848181610ce1015281816116580152613b8f01526101005184818161034101528181610844015281816113400152818161187b01528181611f2a015281816121b6015281816124a60152818161289401528181612eef01528181613195015281816144cc015281816146df015281816148f201528181614a3901528181614bec0152614e24015261012051848181612a7f01526152b90152610140518481816105020152818161063d015261175f0152610160518481816102a4015281816119ae0152818161332e0152613364015261018051848181610b6a0152818161198501526132f001526101a051848181611834015261194601526101c0518481816104d801528181610e8501528181611dd70152613be9015251838181610a19015281816117a6015281816119f6015281816120e80152614b7e015251828181610469015281816113ea015281816127de01528181614ca301528181614e590152615a8a0152518181816103c4015281816116030152818161478f0152614c700152f35b60405163ad73538160e01b8152600490fd5b634e487b7160e01b600052601160045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036200038157565b519063ffffffff821682036200038157565b519061ffff821682036200038157565b91909161ffff808094169116029182169182036200036b5756fe6101a080604052600436101561001457600080fd5b600090813560e01c90816305a9e07314612a6b5750806325ea04b914612a505780632aa88f7c146128015780632b0d4569146127c65780632b4a78aa146127a857806330efc5e21461276357806339c5f3fc1461272e5780633a8bcc05146126f35780633b059aaa146126a35780633bdc60d61461253f5780633c55b50d1461247e5780634a8ec934146124345780634af37ad0146124205780634eb535fa146123e55780634ee92c66146122df57806359fb19c7146122925780636784dba01461222657806371af8f00146121e5578063727b1ac6146121a0578063732076ce14611e2f5780637693347214611e0757806379d7a90814611dc15780637d5a809514611d735780637edcf34714611d2457806387670cfb14611ce95780638fa6f97b14611cae57806390a884d314611858578063932e088d146118195780639568e386146117e65780639c59e289146117c9578063a5d095891461178e578063b134427114611749578063b3fc6961146116af578063c3f10e0314611687578063c45a015514611642578063cd159ea814611627578063d2177bdd146115e3578063d5245d82146115c1578063dadf95f41461156f578063dca841f714611534578063dcc63290146114ef578063e52778b0146114b4578063e903ccf11461130b578063f19eb86b14610b8e578063f5e1af1814610b4f578063f67ff4cb1461080d578063f78486a2146102fb578063f9951f13146102c8578063fe6320e6146102875763fe8a6b431461024857600080fd5b34610284578060031936011261028457602061027361026561317f565b61026d6132d6565b9061328d565b6001600160401b0360405191168152f35b80fd5b5034610284578060031936011261028457602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461028457602036600319011261028457604060209161ffff6102ea612c32565b168152600983522054604051908152f35b50346102845760031960a0368201126108095761031f61031a36612c9b565b612d3a565b604051630ecce30160e31b815290916020916001600160a01b039083816004817f000000000000000000000000000000000000000000000000000000000000000086165afa9081156107fe5786916107c9575b5061ffff80911694858752600d855260408720818852855260ff60408820541660068110156107b5578015610797576001810361077057506001600160401b03606435818116810361076b576103e9907f00000000000000000000000000000000000000000000000000000000000000009061328d565b1642111561075957858752600d85526040872090875284526040862060ff1990600382825416179055858752600e85526040872083610426612e4b565b166000528552600260406000209182541617905584865260108452604086208261044e612e4b565b1660005284528560406000205585808080610467612e61565b7f0000000000000000000000000000000000000000000000000000000000000000905af1610493612e8b565b50156107475785948552600f84526040852090815490600181831601169061ffff19161790556104c863ffffffff4616615b54565b6001600160e01b031990811691907f00000000000000000000000000000000000000000000000000000000000000001682810361061057507f00000000000000000000000000000000000000000000000000000000000000001661052b30615bde565b61055d610536612e4b565b9561054f610542612e61565b6040519889938401614383565b03601f198101875286612b60565b813b1561060c5785610598936105a7829660405198899788968795632471e25d60e21b8752600487015260606024870152606486019061439d565b9184830301604485015261439d565b03925af18015610601576105ed575b50505b7ffbdb879d119dbabefa19d6aa1e8288147bc97c314400c7252a6190c63d7c1164604051806105e781612ddf565b0390a180f35b6105f690612b32565b6102845780386105b6565b6040513d84823e3d90fd5b8580fd5b9392505050600080516020615d8183398151915292506107305a91604061063630615bde565b94816106617f0000000000000000000000000000000000000000000000000000000000000000615bde565b936106bf61066d612e4b565b95610698610679612e61565b9761068a8651998a92878401614383565b03601f198101895288612b60565b6106b284519a8b9a8b5261026080868d01528b019061439d565b90898203858b015261439d565b92606088015289878403918260808a015281855280830160a08a01528401528960c08801528960e08801528961010088015289610120880152896101408801528961016088015289610180880152896101a0880152896101c0880152896101e088015201610200860152019061439d565b8461022083015260016102408301520390a16105b9565b604051633204506f60e01b8152600490fd5b6040516328ae338160e11b8152600490fd5b600080fd5b604051633ee76d3160e11b815260449161078e906004830190612ade565b60016024820152fd5b604051632bf1274f60e01b8152806107b160048201612ddf565b0390fd5b634e487b7160e01b88526021600452602488fd5b90508381813d83116107f7575b6107e08183612b60565b8101031261060c576107f190612dd0565b38610372565b503d6107d6565b6040513d88823e3d90fd5b5080fd5b50346102845761081c36612bd3565b610825816133fc565b604051630ecce30160e31b81526020916001600160a01b0383836004817f000000000000000000000000000000000000000000000000000000000000000085165afa928315610b4357600093610b0c575b5061ffff809316600052600e84526040600020336000528452600260ff604060002054166108a381614379565b14610afa57816000526007845260ff604060002054166004811015610ae457600281036108e5576040516330fec77b60e11b8152806107b18860048301613866565b6003810361090857604051633380868b60e01b8152806107b18860048301613866565b8015610ac95761091890836143c2565b906001600160401b039182421691838216831015610aa05750506040519261093f84612b01565b33845286840191825284600052600287528060406000205416610a855760008581526002885260409020935184546001600160a01b0319169116178355516109899291169061434e565b7fccfe75fd75d3296dd0e310659f272ed3d47425b6cadd4afb87ad1a333e2132a9604051806109b88782613866565b0390a160005260068252604060002091600283549360ff60018187160116908160ff19809716179055146109ea578480f35b6007916012549060001981831601169061ffff19161760125552600360406000209182541617905560008080807f0000000000000000000000000000000000000000000000000000000000000000815af1610a43612e8b565b501561074757610a7a7f2c4c3f1ebc7e7a6c814ed2315a9e1ef863749841a858f5c27437ecf53ca8b39f9160405191829182613866565b0390a1388080808480f35b60405163147d598560e01b8152806107b18a60048301613866565b604051639cc019e960e01b81526001600160401b03918216600482015291166024820152604490fd5b604051637448d61760e01b8152806107b18860048301613866565b634e487b7160e01b600052602160045260246000fd5b604051632e8acb0d60e01b8152600490fd5b90928482813d8311610b3c575b610b238183612b60565b810103126102845750610b3590612dd0565b9138610876565b503d610b19565b6040513d6000823e3d90fd5b5034610284578060031936011261028457602060405161ffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5034610284576101e0366003190112610284576004356001600160401b03811161080957610bc0903690600401612c05565b6024356001600160e01b031981169003611307576044356001600160401b03811161130357610bf3903690600401612c05565b906064356001600160401b03811161060c57610c13903690600401612c05565b94909360a4356001600160a01b03811690036112ff5760c4356001600160e01b0319811690036112ff5760e4356001600160a01b03811690036112ff57610124356001600160a01b03811690036112ff576101a4356001600160401b0381116112fb57610c84903690600401612c05565b92909461010435158015809181926112e7575b81156112c5575b506112995761010435610164351161128757604051637af806df60e01b815260208180610cdd8d8d8c60c4359260a435928b6084359360048901613a23565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561127c578b9161124e575b50803b1561122c57610d2c602435615b33565b91156110f05761014435158015906110db575b6110ae578a9160a4356001600160a01b0390811660e4359091161480806110a7575b15610fb95750506001600160a01b0381163b1561080957816040518092636e91340160e11b8252818381610d9c610104353360048401613a75565b03926001600160a01b03165af1801561060157610fa1575b50505b5a96610dc233615bde565b98610dce60c435615b33565b15610f9757610de260843561010435615bbc565b965b610def60c435615b33565b15610f8d57610e0360843561014435615bbc565b935b610e1060c435615b33565b15610f8357610e2460843561016435615bbc565b955b8d610e3260c435615b33565b159050610f7957610e4860843561018435615bbc565b975b6040519d8e9d8e528d6102609081602082015201610e679161439d565b908d8083039060400152610e7a926133db565b9063ffffffff60e01b7f00000000000000000000000000000000000000000000000000000000000000001660608d01528b820360808d0152610ebb926133db565b9089820360a08b0152610ecd926133db565b60843560c08901526001600160a01b0360a435811660e08a01526001600160e01b031960c43581166101008b015260e43582166101208b01526101408a019790975261012435166101608901526101808801919091526101a08701919091526101c08601919091526024359092166101e0850152838203610200850152610f53926133db565b6101c4356102208301528361024083015203600080516020615d8183398151915291a180f35b6101843597610e4a565b6101643595610e26565b6101443593610e05565b6101043596610de4565b610faa90612b32565b610fb5578838610db4565b8880fd5b8061109f575b1561102c57506001600160a01b0381163b15610809578160405180926358c88e0760e01b8252818381610ff9610104353360048401613a75565b03926001600160a01b03165af1801561060157611018575b5050610db7565b61102190612b32565b610fb5578838611011565b9091506001600160a01b0380831660e435909116149081611096575b50156110845789906001600160a01b0381163b15610809578160405180926337f3a8ed60e21b8252818381610ff9610104353360048401613a75565b604051634d5499ab60e01b8152600490fd5b90501538611048565b508015610fbf565b5081610d61565b604051634a24857f60e11b8152610144356004820152610124356001600160a01b03166024820152604490fd5b50610124356001600160a01b03161515610d3f565b851561121a5761014435158015611206575b6110ae578a9160a4356001600160a01b039081166101243590911614806111fe575b1561115e57506001600160a01b0381163b15610809578160405180926358c88e0760e01b8252818381610ff9610144353360048401613a75565b9091506001600160a01b03808316610124359091161490816111f5575b5015611084576001600160a01b0381163b156111f1578960405180926337f3a8ed60e21b82528183816111b5610144353360048401613a75565b03926001600160a01b03165af180156111e6576111d3575b50610db7565b6111df90999199612b32565b97386111cd565b6040513d8c823e3d90fd5b8980fd5b9050153861117b565b508015611124565b50610124356001600160a01b031615611102565b604051633c26f6a960e21b8152600490fd5b604051638c40da6160e01b81526001600160a01b039091166004820152602490fd5b61126f915060203d8111611275575b6112678183612b60565b810190613a04565b38610d19565b503d61125d565b6040513d8d823e3d90fd5b6040516339ddd98760e21b8152600490fd5b604051633d04c3cd60e11b815261010435600482015260e4356001600160a01b03166024820152604490fd5b9050806112d3575b38610c9e565b5060e4356001600160a01b031615156112cd565b60e4356001600160a01b0316159150610c97565b8780fd5b8680fd5b8380fd5b8280fd5b50346102845760a03660031901126102845761132961031a36612c9b565b604051630ecce30160e31b815260209081816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156114a9578491611474575b5061ffff80611385612ede565b16911681101561145c57808452600d825260408420838552825260ff6040852054166006811015611448578015610797576001810361077057508352600d8152604083209183525260408120600460ff19825416179055808080806113e8612e61565b7f0000000000000000000000000000000000000000000000000000000000000000905af1611414612e8b565b5015610747577fad4b9df10beb0c2005ed5ebd8a7ef385e62f3f0975eb5cf4b12770a4e58d75ab604051806105e781612ddf565b634e487b7160e01b85526021600452602485fd5b602490604051906301ee2cc760e41b82526004820152fd5b90508181813d83116114a2575b61148b8183612b60565b810103126113035761149c90612dd0565b38611378565b503d611481565b6040513d86823e3d90fd5b503461028457806003193601126102845760206040517f8cea0bdc76946a856093a5fa1eeae765bb3795b3458ea1a00e6e22d0e1b5ac5b8152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461028457806003193601126102845760206040517f0abea1e3e92cf48dbad75e3c6f731e5ef04a7a2bff451ae7ed39d6eee2bcb0e78152f35b5061158e61157c36612c43565b906115889392936146cf565b836148d6565b1561159f5761159c90614e01565b80f35b60405163f38d406d60e01b81526001600160a01b039091166004820152602490fd5b5034610284578060031936011261028457602061ffff60125416604051908152f35b503461028457806003193601126102845760206040516001600160401b037f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461028457806003193601126102845760206102736132d6565b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346102845760a03660031901126102845760206116a761031a36612c9b565b604051908152f35b503461028457366003190160c081126108095760a0136102845760a4356001600160401b038111610809576116e8903690600401612aae565b6001600160a01b036116f8612e4b565b16331491821592611736575b505061171e5761159c61171961031a36612c9b565b614bc8565b60405163f38d406d60e01b8152336004820152602490fd5b6117419250336148d6565b153880611704565b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461028457806003193601126102845760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b503461028457806003193601126102845760206040516127108152f35b503461028457602036600319011261028457604060209161ffff611808612c32565b168152600883522054604051908152f35b5034610284578060031936011261028457602060405161ffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5061186236612bd3565b604051630ecce30160e31b815260206001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081168284600481845afa9384156107fe578694611c77575b5061ffff938481168752600884526040872054158015611c67575b8015611c34575b611b9c576040516327f843b560e11b81528481600481865afa928315611bf75785918994611c02575b5060405163a2b753c760e01b81529190829060049082905afa918215611bf75786918993611bc2575b509261193e9161193861194495612ff8565b1661447c565b9061448f565b7f0000000000000000000000000000000000000000000000000000000000000000906119e163ffffffff6119da61197b858061449c565b886119d2816119ab7f0000000000000000000000000000000000000000000000000000000000000000809561449c565b167f00000000000000000000000000000000000000000000000000000000000000006132a8565b9116906132c0565b164261448f565b610e0f198201918211611bae571015611b9c577f0000000000000000000000000000000000000000000000000000000000000000803403611b7e575083806012541691161115611b6c57611a34846133fc565b8086526007835260ff6040872054166004811015611b585760028103611a6f576040516330fec77b60e11b8152806107b18860048301613866565b60038103611a9257604051633380868b60e01b8152806107b18860048301613866565b600114611b3d577fe7bf22971bde3dd8a6a3bf8434e8b7a7c7554dad8328f741da1484d67b445c199492611b0c6105e7959360079360405191611ad483612b01565b338352848301906001600160401b039283421683528c526001865260408c2093511660018060a01b031984541617835551169061434e565b5260408520600160ff1982541617905560125490600181831601169061ffff19161760125560405191829182613866565b60405163f73ae5d960e01b8152806107b18760048301613866565b634e487b7160e01b87526021600452602487fd5b604051638acb5f2760e01b8152600490fd5b604490604051906307694a8d60e01b82523460048301526024820152fd5b604051639ceba7c560e01b8152600490fd5b634e487b7160e01b88526011600452602488fd5b86809294508193503d8311611bf0575b611bdc8183612b60565b810103126112fb575190859061193e611926565b503d611bd2565b6040513d8a823e3d90fd5b8281939295503d8311611c2d575b611c1a8183612b60565b810103126112fb575191849060046118fd565b503d611c10565b50600f845284604088205416600a855285611c608160408b205416600b88528260408c2054169061300b565b16146118d4565b50600984526040872054156118cd565b9093508281813d8311611ca7575b611c8f8183612b60565b8101031261060c57611ca090612dd0565b92386118b2565b503d611c85565b503461028457806003193601126102845760206040517f8a2b1cae51f0b9ccbdae5304e10caa93b35407a3d1fcfebf6994bd40987386348152f35b503461028457806003193601126102845760206040517f669026b2b50f0a0b1d5169dea8cb6e3774a80f68a648b0b0b45b722e519a65018152f35b50611d43611d3136612c43565b90611d3d9392936146cf565b83614a1d565b15611d515761159c90614e01565b60405163c2e6f3ad60e01b81526001600160a01b039091166004820152602490fd5b5034610284576040366003190112610284576040602091611d92612c32565b61ffff611d9d612aeb565b91168252601084528282206001600160a01b03909116825283522054604051908152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160e01b0319168152602090f35b50346102845760a0366003190112610284576020611e23612ede565b61ffff60405191168152f35b50346102845760031960603682011261080957600435906001600160401b039081831161130357610280908360040193360301126113075760243581811161130357611e7f903690600401612aae565b9060443583811161060c57611efc92611ef492611ea3611f02933690600401612c05565b611eae9591956144b5565b611eee611eba8a6133fc565b967f19457468657265756d205369676e6564204d6573736167653a0a3332000000008c5287601c52603c8c20923691612b9c565b90613789565b95909561368a565b84614a1d565b1561217f57604051630ecce30160e31b815260209390926001600160a01b03919085856004817f000000000000000000000000000000000000000000000000000000000000000087165afa948515611bf7578895612148575b5061ffff8095168852600e86528260408920911688528552600260ff604089205416611f8681614379565b14610afa578287526007855260ff60408820541660048110156107b55760028103611fc6576040516330fec77b60e11b8152806107b18960048301613866565b60038103611fe957604051633380868b60e01b8152806107b18960048301613866565b801561212d57611ff990846143c2565b82421691838216831015610aa05750506040519261201684612b01565b338452868401918252848952600487528060408a205416612112578489526004875260408920935184546001600160a01b03191691161783555161205c9291169061434e565b7fdf8b7f38babe8032cb674ac9a39e8fe3cf371cf1621a31afb3fc1969d700cc956040518061208b8782613866565b0390a18452600682526040842091600283549360ff60018187160116908160ff19809716179055146120bb578480f35b6007916012549060001981831601169061ffff1916176012555260036040842091825416179055818080807f0000000000000000000000000000000000000000000000000000000000000000815af1610a43612e8b565b604051636e1f8ed360e11b8152806107b18a60048301613866565b604051637448d61760e01b8152806107b18960048301613866565b9094508581813d8311612178575b6121608183612b60565b810103126112fb5761217190612dd0565b9338611f5b565b503d612156565b60405163c2e6f3ad60e01b81526001600160a01b0383166004820152602490fd5b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5034610284578060031936011261028457602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5061223036612bd3565b600282541461224d576122469060028355613a90565b6001815580f35b60405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606490fd5b5034610284576122c39060ff60406122b16122ac36612bd3565b6133fc565b928381526007602052205416906143c2565b604080516001600160401b039384168152919092166020820152f35b503461028457366003190160e081126108095760a013610284576001600160401b0360a43581811161130757612319903690600401612aae565b9160c4359081116113035761237f92612339612387923690600401612c05565b611eee61234b61031a97939736612c9b565b967f19457468657265756d205369676e6564204d6573736167653a0a333200000000895287601c52603c8920923691612b9c565b92909261368a565b6001600160a01b039283612399612e4b565b16938316938414928315936123d2575b5050506123ba575061159c90614bc8565b6024906040519063c2e6f3ad60e01b82526004820152fd5b6123dc9350614a1d565b153880806123a9565b503461028457806003193601126102845760206040517fa99e73b4e783e525d4e2d46801821de7174f02493f51782438793c12db10bb9e8152f35b50346102845760206116a76122ac36612bd3565b5034610284576124466122ac36612bd3565b8152600760205260ff60408220541660405190600481101561246a57602092508152f35b634e487b7160e01b83526021600452602483fd5b5034610284578060031936011261028457604051630ecce30160e31b815260209182826004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156125325781926124f9575b5060409061ffff8093168152600f8452205416604051908152f35b9091508281813d831161252b575b6125118183612b60565b8101031261080957612524604091612dd0565b91906124de565b503d612507565b50604051903d90823e3d90fd5b50346102845760603660031901126102845760043563ffffffff918282168092036102845761256c612aeb565b90604435906001600160401b0382116102845736602383011215610284575061259f903690602481600401359101612b9c565b6001600160a01b03939092907f0000000000000000000000000000000000000000000000000000000000000000858116330361268557507f0000000000000000000000000000000000000000000000000000000000000000168082036126675750507f0000000000000000000000000000000000000000000000000000000000000000928084169082160361264957612637826154e0565b604051631dee306b60e11b8152602090f35b604051631601661d60e01b8152928392506107b19160048401614383565b60449250604051916371a6259160e01b835260048301526024820152fd5b604051637090e53f60e01b81529081906107b1903360048401614383565b50346102845760a03660031901126102845760ff604060209261ffff6126c7612ede565b168152600d84528181206126dd61031a36612c9b565b825284522054166126f16040518092612ade565bf35b503461028457806003193601126102845760206040517fb35f2687d20e5aa1b3cb05007d7aa08c99d7388a13cfd4940efc0ddf50b58e8c8152f35b5034610284578060031936011261028457602061275063ffffffff4616615b54565b6040516001600160e01b03199091168152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346102845780600319360112610284576020601154604051908152f35b503461028457806003193601126102845760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b50346102845760031960403682011261080957600435906001600160401b039081831161130357610280908360040193360301126113075760243581811161130357612854612863913690600401612aae565b9061285d6144b5565b336148d6565b1561171e57612871826133fc565b604051630ecce30160e31b81526020929091906001600160a01b039084846004817f000000000000000000000000000000000000000000000000000000000000000086165afa938415612a45578794612a0e575b5061ffff8094168752600e8552604087203388528552600260ff6040892054166128ee81614379565b14610afa578287526007855260ff60408820541660048110156107b5576002810361292e576040516330fec77b60e11b8152806107b18960048301613866565b6003810361295157604051633380868b60e01b8152806107b18960048301613866565b801561212d5761296190846143c2565b82421691838216831015610aa05750506040519261297e84612b01565b338452868401918252848952600387528060408a2054166129f3578489526003875260408920935184546001600160a01b0319169116178355516129c49291169061434e565b7f54c2d295a1e57369238447058e1c72e090370c9c0424a4e6f700ff43d182b59d6040518061208b8782613866565b604051636dbf5d5d60e01b8152806107b18a60048301613866565b9093508481813d8311612a3e575b612a268183612b60565b810103126112ff57612a3790612dd0565b92386128c5565b503d612a1c565b6040513d89823e3d90fd5b5034610284578060031936011261028457602061027361317f565b9050346108095781600319360112610809577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b9181601f8401121561076b578235916001600160401b03831161076b576020808501948460051b01011161076b57565b906006821015610ae45752565b602435906001600160a01b038216820361076b57565b604081019081106001600160401b03821117612b1c57604052565b634e487b7160e01b600052604160045260246000fd5b6001600160401b038111612b1c57604052565b60a081019081106001600160401b03821117612b1c57604052565b90601f801991011681019081106001600160401b03821117612b1c57604052565b6001600160401b038111612b1c57601f01601f191660200190565b929192612ba882612b81565b91612bb66040519384612b60565b82948184528183011161076b578281602093846000960137010152565b6003199060208183011261076b57600435916001600160401b03831161076b57826102809203011261076b5760040190565b9181601f8401121561076b578235916001600160401b03831161076b576020838186019501011161076b57565b6004359061ffff8216820361076b57565b90604060031983011261076b576004356001600160a01b038116810361076b5791602435906001600160401b03821161076b57612c8291600401612aae565b9091565b35906001600160e01b03198216820361076b57565b60a090600319011261076b5760405190612cb482612b45565b6004358252816001600160a01b03602435818116810361076b576020830152604435908116810361076b5760408201526064356001600160401b038116810361076b576060820152608435906001600160e01b03198216820361076b5760800152565b60005b838110612d2a5750506000910152565b8181015183820152602001612d1a565b805160018060a01b039182602082015116926040820151166001600160401b03918260608201511690608063ffffffff60e01b9101511691604051956020870195865260408701526060860152608085015260a084015260a0835260c083019083821090821117612b1c5760209281612dbd600094826040528351928391612d17565b8101039060025afa15610b435760005190565b519061ffff8216820361076b57565b600435815260a0810191906001600160a01b036024358181169081900361076b57602083015260443590811680910361076b5760408201526064356001600160401b03811680910361076b5760608201526084359063ffffffff60e01b821680920361076b5760800152565b6024356001600160a01b038116810361076b5790565b6044356001600160a01b038116810361076b5790565b356001600160a01b038116810361076b5790565b3d15612eb6573d90612e9c82612b81565b91612eaa6040519384612b60565b82523d6000602084013e565b606090565b91908203918211612ec857565b634e487b7160e01b600052601160045260246000fd5b6040516327f843b560e11b815260207f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168183600481845afa928315610b4357600093612fc9575b5090806004926040519384809263a2b753c760e01b82525afa908115610b4357600091612f9d575b509050606435906001600160401b03821680920361076b57612f7791612ebb565b908015612f875761ffff91041690565b634e487b7160e01b600052601260045260246000fd5b82813d8311612fc2575b612fb18183612b60565b810103126102845750518038612f56565b503d612fa7565b90928282813d8311612ff1575b612fe08183612b60565b810103126102845750519181612f2e565b503d612fd6565b90600161ffff80931601918211612ec857565b91909161ffff80809416911601918211612ec857565b60009080156130e35780806001146130db576002146130d3576001918261013383101683600b841016176130bf5760058392935b8082116130825750508261ffff04821161306e57500290565b634e487b7160e01b81526011600452602490fd5b90938061ffff0481116130ab578185166130a2575b800293811c90613055565b80930292613097565b634e487b7160e01b83526011600452602483fd5b9291506005900a9161ffff831161306e5750565b509060209150565b505050600190565b5090565b60009080156130e35780806001146130db57600214613177576001918261013383101683600b841016176131615760028392935b8082116131365750508263ffffffff04821161306e57500290565b90938063ffffffff0481116130ab57818516613158575b800293811c9061311b565b8093029261314d565b9291506002900a9163ffffffff831161306e5750565b509060049150565b604051630ecce30160e31b8152602080826004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa918215610b435760009261323c575b50600f61ffff8093169182600052600a81526131fd8460406000205416600b835285604060002054169061300b565b9260005252818060406000205416911603818111612ec857613223826132289216613021565b612ff8565b168015612f875762278d000462ffffff1690565b90918282813d831161326c575b6132538183612b60565b81010312610284575061326590612dd0565b90386131ce565b503d613249565b90620697806001600160401b0380931601918211612ec857565b9190916001600160401b0380809416911601918211612ec857565b91909163ffffffff80809416911601918211612ec857565b63ffffffff9182169082160391908211612ec857565b61ffff8060125416801561335b576132ed906130e7565b907f0000000000000000000000000000000000000000000000000000000000000000168063ffffffff8093160290828216918203612ec857613352613357927f00000000000000000000000000000000000000000000000000000000000000006132a8565b6132c0565b1690565b505063ffffffff7f00000000000000000000000000000000000000000000000000000000000000001690565b356001600160e01b03198116810361076b5790565b903590601e198136030182121561076b57018035906001600160401b03821161076b5760200191813603831361076b57565b35801515810361076b5790565b908060209392818452848401376000828201840152601f01601f1916010190565b8061014052610140810161340f90613387565b61341d6101c083018361339c565b61018052906134306101e084018461339c565b929061343f6101608601613387565b61344c6101808701613387565b9061345b61020088018861339c565b90919061346c6102208a018a61339c565b9490956101208b0161347d90612e77565b9961348b6101a08d01613387565b9861349a6102408e018e61339c565b9b909d61026081016134ab906133ce565b610160526040519081610120523590602001526101405160200135610120516040015263ffffffff60e01b166101205160600152610140516060013561012051608001526101205160a0016102809052610120516102a00161018051613510926133db565b9061012051601f19818403019060c0015261352a926133db565b9263ffffffff60e01b166101205160e0015263ffffffff60e01b1661012051610100015261012051601f1981840301906101200152613568926133db565b9061012051601f1981840301906101400152613583926133db565b926101405160800135610120516101600152600160a01b600190031661012051610180015263ffffffff60e01b16610120516101a001526101405160a00135610120516101c001526101405160c00135610120516101e001526101405160e0013561012051610200015261014051610100013561012051610220015261012051601f1981840301906102400152613619926133db565b61014051604001356101205161026001526101605115156101205161028001526101205180910390601f1982019052610120519061365691612b60565b604051806101205181815160208193019161367092612d17565b810103905a916000916002602094fa15610b435760005190565b6005811015610ae4578061369b5750565b600181036136e35760405162461bcd60e51b815260206004820152601860248201527745434453413a20696e76616c6964207369676e617475726560401b6044820152606490fd5b600281036137305760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606490fd5b60031461373957565b60405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608490fd5b9060418151146000146137b357612c82916020820151906060604084015193015160001a906137bd565b5050600090600290565b9291906fa2a8918ca85bafe22016d0b997e4df60600160ff1b0383116138295791608094939160ff602094604051948552168484015260408301526060820152600093849182805260015afa156125325781516001600160a01b03811615613823579190565b50600190565b50505050600090600390565b9035601e198236030181121561076b5701602081359101916001600160401b03821161076b57813603831361076b57565b6020815281356020820152602082013560408201526040820135606082015260608201356080820152608082013560a082015260a082013560c082015260c082013560e082015261010060e083013581830152610120908301358183015282013560018060a01b03811680910361076b5761399e6139f1836139df6139d66139c36139ba6139a761398461397b6139668d6139366139558b6102a09f61394661392691610140908185015263ffffffff60e01b9586809481938a01612c86565b1661016090818701528801612c86565b1661018090818501528601612c86565b166101a0809201528301612c86565b166101c090818c0152810190613835565b6102809c8d9a6101e09b8c82015201916133db565b968c018c613835565b989096601f1999610200988d8a8d828603019101526133db565b958b018b613835565b6102209691898c840301888d01526133db565b93890189613835565b6102409491878a840301868b01526133db565b91870187613835565b906102609487840301858801526133db565b9301359182151580930361076b57015290565b9081602091031261076b57516001600160a01b038116810361076b5790565b95929093613a42608096999895613a509460a08a5260a08a01916133db565b9187830360208901526133db565b60408501969096526001600160a01b031660608401526001600160e01b031916910152565b6001600160a01b039091168152602081019190915260400190565b6000613a9a6144b5565b613aa3826133fc565b90818152600760205260ff604082205416600481101561433a5760028103613ae0576040516330fec77b60e11b8152806107b18660048301613866565b60038103613b0357604051633380868b60e01b8152806107b18660048301613866565b801561431f57613b1390836143c2565b906001600160401b03808316904216106142f6575050613b8b6020608085613b3f61020082018261339c565b9490613b4f61022084018461339c565b9091613b5e6101208601612e77565b91613b6c6101a08701613387565b93604051998a988998637af806df60e01b8a5201359360048901613a23565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156106015782916142d8575b5060a084013581846001600160e01b0319613be74663ffffffff16615b54565b7f00000000000000000000000000000000000000000000000000000000000000006001600160e01b0319169491168414614046575b613c2c935060e08801359061509c565b613c44613c3d6101e087018761339c565b3691612b9c565b83906002905b602a8210613e935750506001600160a01b03169181613d82575b5050610240840190613c76828661339c565b9050613cbf575b5050507f0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a691613cae613cba92614af9565b60405191829182613866565b0390a1565b803b15613d6a57613ced613cd66101408701613387565b613ce46101c088018861339c565b9290948861339c565b843b156112ff57869492613d47613d359795938793604051998a9889978896632471e25d60e21b885263ffffffff60e01b1660048801526060602488015260648701916133db565b848103600319016044860152916133db565b03925af1613d56575b80613c7d565b613d608291612b32565b6102845780613d50565b6024906040519063b5cf5b8f60e01b82526004820152fd5b6001600160a01b031690813b1561130357604051630922733d60e41b8152848180613db1858860048401613a75565b038183875af18015613e8857613e75575b50600160408701351615613c6457613de5613de06101a08801613387565b615b33565b15613e4657813b1561130357613e15849283926040519485809481936304d2799360e51b83528960048401613a75565b03925af18015613e3b5790839115613c6457613e3090612b32565b610809578138613c64565b6040513d85823e3d90fd5b6024613e556101a08801613387565b60405163240c6b3f60e21b81526001600160e01b03199091166004820152fd5b613e8190949194612b32565b9238613dc2565b6040513d87823e3d90fd5b9091600881901b610100600160a01b0316906001600160a01b03168015908204610100141715613f6857613ec78383615d0b565b5160f890811c906001850180861161403257613ee39085615d0b565b51901c6061918281101580614027575b15613fd757613f0190615d4e565b915b81101580613fcc575b15613f7c57613f1a90615d4e565b905b600481901b6010600160a01b0316906001600160a01b031680159082046010141715611bae57613f569291613f5091615d67565b90615d67565b9160028101809111613f685790613c4a565b634e487b7160e01b86526011600452602486fd5b604181101580613fc1575b15613f9b57613f9590615d35565b90613f1c565b90603082101580613fb6575b15613f1c5790613f9590615d1c565b506039821115613fa7565b506046811115613f87565b506066811115613f0c565b60418110158061401c575b15613ff657613ff090615d35565b91613f03565b91603083101580614011575b15613f035791613ff090615d1c565b506039831115614002565b506046811115613fe2565b506066811115613ef3565b634e487b7160e01b89526011600452602489fd5b5050614053869182615231565b916001600160e01b031961406a6101808401613387565b161415806142b9575b6140805750818482613c1c565b9390828260e08796959601356140959361509c565b9061409f90614af9565b5a926140af6101c086018661339c565b60805260a0526140c36101e086018661339c565b94906140d26101808801613387565b6140e061020089018961339c565b916140ef6102208b018b61339c565b9390946101208c0161410090612e77565b9a61410e6101a08e01613387565b9761411d6102408f018f61339c565b9e9060e0526102600161412f906133ce565b60c05260405180610100525261010051602001610260905261010051610260016080519060a05191614160926133db565b90610100518083039060400152614176926133db565b9163ffffffff60e01b16610100516060015261010051808303906080015261419d926133db565b90610100518083039060a001526141b3926133db565b9460808801356101005160c00152600160a01b60019003166101005160e0015263ffffffff60e01b16610100516101000152600160a01b60019003166101005161012001526101005161014001528061010051610160015280610100516101800152610100840135610100516101a0015280610100516101c00152610100516101e001526101005180820390610200015260e05191614251926133db565b604082013561010051610220015260c051151561010051610240015261010051809103600080516020615d8183398151915291a1604051614293819282613866565b037f0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a691a1565b506001600160e01b03196142d06101808301613387565b161515614073565b6142f0915060203d8111611275576112678183612b60565b38613bc7565b6040516345bbd2a360e11b81526001600160401b03918216600482015291166024820152604490fd5b604051637448d61760e01b8152806107b18660048301613866565b634e487b7160e01b82526021600452602482fd5b805467ffffffffffffffff60a01b191660a09290921b67ffffffffffffffff60a01b16919091179055565b60031115610ae457565b6001600160a01b0391821681529116602082015260400190565b906020916143b681518092818552858086019101612d17565b601f01601f1916010190565b91906004811015610ae4576001036144745760009180835260016020526001600160401b03604084205460a01c16906144056143ff61026561317f565b8361328d565b93818152600660205260ff6040822054161561446e57600360205260408120546001600160a01b0392908316614458575b8152600460205260409020541661444b579190565b9161445590613273565b90565b9490614465604092613273565b95909150614436565b50509190565b600091508190565b81810292918115918404141715612ec857565b91908201809211612ec857565b91909161ffff80809416911602918216918203612ec857565b60408051630ecce30160e31b8152600491906020907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169082818681855afa9081156146c45760009161468f575b5061ffff9081811660005260088452846000205415801561467f575b801561464c575b61463c5784516327f843b560e11b81529284848881845afa9384156145fd5787918691600096614608575b50875163a2b753c760e01b815292839182905afa9485156145fd576000956145ca575b50509161193e916119386145909594612ff8565b610e0f1981019081116145b5574210156145a8575050565b51639ceba7c560e01b8152fd5b601183634e487b7160e01b6000525260246000fd5b8181969293963d83116145f6575b6145e28183612b60565b81010312610284575051928161193861457c565b503d6145d8565b86513d6000823e3d90fd5b809350829196923d8311614635575b6146218183612b60565b810103126102845750848791519438614559565b503d614617565b8451639ceba7c560e01b81528690fd5b50600f845281856000205416600a85528261467881886000205416600b8852828960002054169061300b565b161461452e565b5060098452846000205415614527565b908382813d83116146bd575b6146a58183612b60565b8101031261028457506146b790612dd0565b3861450b565b503d61469b565b84513d6000823e3d90fd5b604080516327f843b560e11b81527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906020908181600481865afa9081156146c457600091614853575b508351630ecce30160e31b8152928284600481845afa93841561480d57600094614818575b508260049186519283809263a2b753c760e01b82525afa92831561480d576000936147da575b505061193e9061ffff61193861478295612ff8565b6147b56001600160401b037f0000000000000000000000000000000000000000000000000000000000000000164261448f565b610e0f198201918211612ec857116147ca5750565b5163061954d360e31b8152600490fd5b8181949293943d8311614806575b6147f28183612b60565b81010312610284575051908061ffff61476d565b503d6147e8565b85513d6000823e3d90fd5b90938382813d831161484c575b61482f8183612b60565b81010312610284575082614844600492612dd0565b949150614747565b503d614825565b908282813d8311614879575b6148698183612b60565b8101031261028457505138614722565b503d61485f565b9092916001600160401b038411612b1c578360051b60405192602080946148a982850182612b60565b809781520191810192831161076b57905b8282106148c75750505050565b813581529083019083016148ba565b604051630ecce30160e31b8152919392916020919082816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610b435760009161497c575b50946149779161ffff6144559697166000526009845260406000205493604051908101916001600160601b03199060601b1682526014815261496c81612b01565b519020933691614880565b6149c2565b908382813d83116149bb575b6149928183612b60565b810103126102845750946149779161ffff6149b06144559798612dd0565b92979650509161492b565b503d614988565b90926000925b8251841015614a14576020808560051b85010151916000838210600014614a0757506000525260406000205b926000198114612ec857600101926149c8565b91604093835252206149f4565b91509291501490565b604051630ecce30160e31b8152919392916020919082816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610b4357600091614ab3575b50946149779161ffff6144559697166000526008845260406000205493604051908101916001600160601b03199060601b1682526014815261496c81612b01565b908382813d8311614af2575b614ac98183612b60565b810103126102845750946149779161ffff614ae76144559798612dd0565b929796505091614a72565b503d614abf565b600080808381948252600760205260408220600260ff19825416179055614b7160405191614b2683612b01565b338352426001600160401b039081166020808601918252928652600590925260408520935184546001600160a01b0319166001600160a01b039182161785559151919391169061434e565b60016020526040822054167f0000000000000000000000000000000000000000000000000000000000000000905af1614ba8612e8b565b50156107475760125461ffff60001981831601169061ffff191617601255565b60408051630ecce30160e31b81526004926001600160a01b039160209190828187817f000000000000000000000000000000000000000000000000000000000000000088165afa801561480d57600090614dcb575b61ffff9150169485600052600d83528460002082600052835260ff8560002054166006811015614db6578015614d9e5760018103614d8157506001600160401b03606435818116810361076b57614c95907f00000000000000000000000000000000000000000000000000000000000000009061328d565b164211614d735760008080807f0000000000000000000000000000000000000000000000000000000000000000815af1614ccd612e8b565b5015614d65575084600052600d825283600020906000528152826000209360ff199460028682541617905580600052600e8252836000209460243593841680940361076b577fd76d6c4c98bee67a568807a2cd2275ce1af7a8ee2a20b2c716119ffa50af4f4f9584600052835284600020908154169055600052601081528260002091600052526000818120555180613cba81612ddf565b8451633204506f60e01b8152fd5b845163aa4e14eb60e01b8152fd5b8551633ee76d3160e11b8152604492909161078e91830190612ade565b8551632bf1274f60e01b8152806107b1818501612ddf565b602182634e487b7160e01b6000525260246000fd5b8382813d8311614dfa575b614de08183612b60565b810103126102845750614df561ffff91612dd0565b614c1d565b503d614dd6565b60408051630ecce30160e31b815290916001600160a01b039160209081816004817f000000000000000000000000000000000000000000000000000000000000000088165afa90811561480d57600091615067575b507f000000000000000000000000000000000000000000000000000000000000000080340361504a575061ffff169081600052600e8152838560002093169283600052815260ff856000205416614eac81614379565b8061502457509160a093917faca691efdfae0f5e89faf9cd63966d8b762215fee3d27e58419a7b75898601a2959360115494614eed63ffffffff4616615b54565b94815196614efa88612b45565b875282870192858452828801903382528260608a01956001600160401b0397884216885260808c019963ffffffff60e01b809c168b52614f398d612d3a565b9180600052600c8652886000208360005286528d896000209051815560026001820191878751169260a0600180911b0319938482541617905501908689511690825416178155614f8c8c8c51168261434e565b8d8d5190825491169060018060e01b031617905580600052600d8652886000208360005286528860002060ff199060018282541617905581600052600e87528960002083600052875260018a600020918254161790556000526010855287600020906000528452866000205560016011540160115585519a518b525116908901525116908601525116606084015251166080820152a1565b8551632219ef3f60e21b815260449161503c81614379565b600482015260006024820152fd5b604490865190630382b90560e01b82523460048301526024820152fd5b908282813d8311615095575b61507d8183612b60565b81010312610284575061508f90612dd0565b38614e56565b503d615073565b90919392600094831561522957855260016020526040808620546001600160a01b03908116923384146151c257610e74860291610e7319878404016140325761189c87029161189b19888404016151ae57899392911690813b1561130357845184818061511e630922733d60e41b9a8b83526127108099049060048401613a75565b038183875af180156151a457908591615190575b5050813b156113035783615156968651978895869485938452043360048401613a75565b03925af19081156151875750615173575b50614455929350612ebb565b61517d8591612b32565b6113035783615167565b513d87823e3d90fd5b61519990612b32565b611303578338615132565b86513d87823e3d90fd5b634e487b7160e01b8a52601160045260248afd5b969291961690813b1561130757846151f2928492838a51809681958294630922733d60e41b845260048401613a75565b03925af195861561521e5750614455949561520f575b5050612ebb565b61521890612b32565b38615208565b51913d9150823e3d90fd5b509093505050565b600092919060a0810135908115908115868180615473575b1561539a5750505060148202908282046014141715615386576127109004916001600160a01b03808216908690823b15610809576040928351630922733d60e41b815283818061529d8b3060048401613a75565b038183865af1801561536857908491615372575b5060206152f67f0000000000000000000000000000000000000000000000000000000000000000938a885194858094819363095ea7b360e01b83528960048401613a75565b03925af1801561536857615331575b501692833b1561080957615156938691838551809781958294631dc1a8e960e11b845260048401613a75565b6020813d8211615360575b8161534960209383612b60565b810103126113035751801515036113075738615305565b3d915061533c565b85513d86823e3d90fd5b61537b90612b32565b6113075782386152b1565b634e487b7160e01b85526011600452602485fd5b91949092506153b061024086989798018661339c565b9050151580615466575b6153f45750505050906153d061026083016133ce565b6153ef576040516357dbdfcd60e01b8152806107b18460048301613866565b905090565b60c09490940135936001600160a01b0316803b1561080957816040518092630922733d60e41b825281838161542d8b3060048401613a75565b03925af1801561060157615452575b50501561544d576144559250612ebb565b505090565b61545e91929550612b32565b92388061543c565b5060c085013515156153ba565b5061548261024084018461339c565b905015615249565b9081606091031261076b5761549e81612dd0565b9160406154ad60208401612dd0565b92015190565b919082604091031261076b5760206154ca83612dd0565b9201516001600160a01b038116810361076b5790565b90818051810191602092838101906040938491031261076b5783850151838601516001600160401b03811161076b5786019082603f8301121561076b57858201519161552b83612b81565b9261553887519485612b60565b8084528784019487828401011161076b5784876155559301612d17565b7f8cea0bdc76946a856093a5fa1eeae765bb3795b3458ea1a00e6e22d0e1b5ac5b8114615999577f0abea1e3e92cf48dbad75e3c6f731e5ef04a7a2bff451ae7ed39d6eee2bcb0e78114615958577fa99e73b4e783e525d4e2d46801821de7174f02493f51782438793c12db10bb9e8114615895577f8a2b1cae51f0b9ccbdae5304e10caa93b35407a3d1fcfebf6994bd409873863481146157d2577fb35f2687d20e5aa1b3cb05007d7aa08c99d7388a13cfd4940efc0ddf50b58e8c811461571a577f669026b2b50f0a0b1d5169dea8cb6e3774a80f68a648b0b0b45b722e519a650114615662575050506107b1905192839263295c2ddb60e21b84526004840152602483019061439d565b615674929550808591510101906154b3565b60018060a01b03169261ffff80921692600091848352600e81528183208684528152600260ff83852054166156a881614379565b146156b6575b505050505050565b7fec87e3fd8458c9d068e8c7a6a16eb984e76983a2e9fd6b2fc0eb666aac74ab6293858452600f82528284209081549060001981831601169061ffff1916179055600e81528183209086845252812060ff19815416905580a33880808080806156ae565b5061572d929550808591510101906154b3565b60018060a01b03169261ffff80921692600091848352600e81528183208684528152600260ff838520541661576181614379565b1461576e57505050505050565b7fb86ed35d90dce9295c134f71798e593a5bae4ad79805a9d176026df017c723c193858452600f82528284209081549060001981831601169061ffff1916179055600e81528183209086845252812060ff19815416905580a33880808080806156ae565b506157e5929550808591510101906154b3565b6001600160a01b0316926157f984836159da565b61ffff80921692600091848352600e8152818320868452815260ff828420541661582281614379565b1561582f57505050505050565b7fb45c6bd54d5903e8dd1ab0bdc81524279dd8094682e012aef8d7a6cc742f94c693858452600f825282842090815490600181831601169061ffff1916179055600e815281832090868452528120600260ff1982541617905580a33880808080806156ae565b506158a8929550808591510101906154b3565b6001600160a01b0316926158bc84836159da565b61ffff80921692600091848352600e8152818320868452815260ff82842054166158e581614379565b156158f257505050505050565b7fa7cc20b5345a6a6981164b4f2ff64c0ee5b801980ff2f35e608cbd65e1059d4e93858452600f825282842090815490600181831601169061ffff1916179055600e815281832090868452528120600260ff1982541617905580a33880808080806156ae565b5084600a95949396508161597093925101019061548a565b61ffff959294919580951660005260088252836000205552600020911661ffff19825416179055565b5084600b9594939650816159b193925101019061548a565b61ffff959294919580951660005260098252836000205552600020911661ffff19825416179055565b61ffff16906000828152602090601082526040918282209460018060a01b038095169586845282528383205480615a15575b50505050505050565b818452600c83528484208185528352848420968285526010845285852090855283528385812055818452600d835284842090845282528383209060ff19916005838254161790558352600e825283832090600187019186835416855283528484209081541690556002860192808080888754167f0000000000000000000000000000000000000000000000000000000000000000905af1615ab4612e8b565b5015615b225783519554865254841690850152549182169083015260a081811c6001600160401b031660608401526001600160e01b031990911660808301527f91bf47878f3965e58e34e6e35b89ab54e88db994a816e8fd6f8c1c0eea5fe5d691a138808080808080615a0c565b8351633204506f60e01b8152600490fd5b615b4263ffffffff4616615b54565b6001600160e01b031990811691161490565b6000615b9f60209260405163ffffffff85820192600160f81b808552604084015216606082015283608082015260808152615b8e81612b45565b604051928392839251928391612d17565b8101039060025afa15610b43576000516001600160e01b03191690565b906012039060128211612ec857604d8211612ec85761445591600a0a9061447c565b604051906001600160a01b0316606082016001600160401b03811183821017612b1c57604052602a8252602082016040368237825115615cf557603090538151600190811015615cf557607860218401536029905b808211615c87575050615c435790565b606460405162461bcd60e51b815260206004820152602060248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152fd5b9091600f81166010811015615ce0576f181899199a1a9b1b9c1cb0b131b232b360811b901a615cb68486615d0b565b5360041c918015615ccb576000190190615c33565b60246000634e487b7160e01b81526011600452fd5b60246000634e487b7160e01b81526032600452fd5b634e487b7160e01b600052603260045260246000fd5b908151811015615cf5570160200190565b6001600160a01b03908116602f190191908211612ec857565b6001600160a01b039081166036190191908211612ec857565b6001600160a01b039081166056190191908211612ec857565b6001600160a01b039182169082160191908211612ec85756fef4faec7e493ced73194f78a54c931da9a2d6c6b9552b223cc9ad2965322789b7a2646970667358221220571ff85ee7c64c791cbfee5e70c3ba0ff8f9b7d6579f8b027514b4b301fa1ff264736f6c63430008130033',
  deployedBytecode:
    '0x6101a080604052600436101561001457600080fd5b600090813560e01c90816305a9e07314612a6b5750806325ea04b914612a505780632aa88f7c146128015780632b0d4569146127c65780632b4a78aa146127a857806330efc5e21461276357806339c5f3fc1461272e5780633a8bcc05146126f35780633b059aaa146126a35780633bdc60d61461253f5780633c55b50d1461247e5780634a8ec934146124345780634af37ad0146124205780634eb535fa146123e55780634ee92c66146122df57806359fb19c7146122925780636784dba01461222657806371af8f00146121e5578063727b1ac6146121a0578063732076ce14611e2f5780637693347214611e0757806379d7a90814611dc15780637d5a809514611d735780637edcf34714611d2457806387670cfb14611ce95780638fa6f97b14611cae57806390a884d314611858578063932e088d146118195780639568e386146117e65780639c59e289146117c9578063a5d095891461178e578063b134427114611749578063b3fc6961146116af578063c3f10e0314611687578063c45a015514611642578063cd159ea814611627578063d2177bdd146115e3578063d5245d82146115c1578063dadf95f41461156f578063dca841f714611534578063dcc63290146114ef578063e52778b0146114b4578063e903ccf11461130b578063f19eb86b14610b8e578063f5e1af1814610b4f578063f67ff4cb1461080d578063f78486a2146102fb578063f9951f13146102c8578063fe6320e6146102875763fe8a6b431461024857600080fd5b34610284578060031936011261028457602061027361026561317f565b61026d6132d6565b9061328d565b6001600160401b0360405191168152f35b80fd5b5034610284578060031936011261028457602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461028457602036600319011261028457604060209161ffff6102ea612c32565b168152600983522054604051908152f35b50346102845760031960a0368201126108095761031f61031a36612c9b565b612d3a565b604051630ecce30160e31b815290916020916001600160a01b039083816004817f000000000000000000000000000000000000000000000000000000000000000086165afa9081156107fe5786916107c9575b5061ffff80911694858752600d855260408720818852855260ff60408820541660068110156107b5578015610797576001810361077057506001600160401b03606435818116810361076b576103e9907f00000000000000000000000000000000000000000000000000000000000000009061328d565b1642111561075957858752600d85526040872090875284526040862060ff1990600382825416179055858752600e85526040872083610426612e4b565b166000528552600260406000209182541617905584865260108452604086208261044e612e4b565b1660005284528560406000205585808080610467612e61565b7f0000000000000000000000000000000000000000000000000000000000000000905af1610493612e8b565b50156107475785948552600f84526040852090815490600181831601169061ffff19161790556104c863ffffffff4616615b54565b6001600160e01b031990811691907f00000000000000000000000000000000000000000000000000000000000000001682810361061057507f00000000000000000000000000000000000000000000000000000000000000001661052b30615bde565b61055d610536612e4b565b9561054f610542612e61565b6040519889938401614383565b03601f198101875286612b60565b813b1561060c5785610598936105a7829660405198899788968795632471e25d60e21b8752600487015260606024870152606486019061439d565b9184830301604485015261439d565b03925af18015610601576105ed575b50505b7ffbdb879d119dbabefa19d6aa1e8288147bc97c314400c7252a6190c63d7c1164604051806105e781612ddf565b0390a180f35b6105f690612b32565b6102845780386105b6565b6040513d84823e3d90fd5b8580fd5b9392505050600080516020615d8183398151915292506107305a91604061063630615bde565b94816106617f0000000000000000000000000000000000000000000000000000000000000000615bde565b936106bf61066d612e4b565b95610698610679612e61565b9761068a8651998a92878401614383565b03601f198101895288612b60565b6106b284519a8b9a8b5261026080868d01528b019061439d565b90898203858b015261439d565b92606088015289878403918260808a015281855280830160a08a01528401528960c08801528960e08801528961010088015289610120880152896101408801528961016088015289610180880152896101a0880152896101c0880152896101e088015201610200860152019061439d565b8461022083015260016102408301520390a16105b9565b604051633204506f60e01b8152600490fd5b6040516328ae338160e11b8152600490fd5b600080fd5b604051633ee76d3160e11b815260449161078e906004830190612ade565b60016024820152fd5b604051632bf1274f60e01b8152806107b160048201612ddf565b0390fd5b634e487b7160e01b88526021600452602488fd5b90508381813d83116107f7575b6107e08183612b60565b8101031261060c576107f190612dd0565b38610372565b503d6107d6565b6040513d88823e3d90fd5b5080fd5b50346102845761081c36612bd3565b610825816133fc565b604051630ecce30160e31b81526020916001600160a01b0383836004817f000000000000000000000000000000000000000000000000000000000000000085165afa928315610b4357600093610b0c575b5061ffff809316600052600e84526040600020336000528452600260ff604060002054166108a381614379565b14610afa57816000526007845260ff604060002054166004811015610ae457600281036108e5576040516330fec77b60e11b8152806107b18860048301613866565b6003810361090857604051633380868b60e01b8152806107b18860048301613866565b8015610ac95761091890836143c2565b906001600160401b039182421691838216831015610aa05750506040519261093f84612b01565b33845286840191825284600052600287528060406000205416610a855760008581526002885260409020935184546001600160a01b0319169116178355516109899291169061434e565b7fccfe75fd75d3296dd0e310659f272ed3d47425b6cadd4afb87ad1a333e2132a9604051806109b88782613866565b0390a160005260068252604060002091600283549360ff60018187160116908160ff19809716179055146109ea578480f35b6007916012549060001981831601169061ffff19161760125552600360406000209182541617905560008080807f0000000000000000000000000000000000000000000000000000000000000000815af1610a43612e8b565b501561074757610a7a7f2c4c3f1ebc7e7a6c814ed2315a9e1ef863749841a858f5c27437ecf53ca8b39f9160405191829182613866565b0390a1388080808480f35b60405163147d598560e01b8152806107b18a60048301613866565b604051639cc019e960e01b81526001600160401b03918216600482015291166024820152604490fd5b604051637448d61760e01b8152806107b18860048301613866565b634e487b7160e01b600052602160045260246000fd5b604051632e8acb0d60e01b8152600490fd5b90928482813d8311610b3c575b610b238183612b60565b810103126102845750610b3590612dd0565b9138610876565b503d610b19565b6040513d6000823e3d90fd5b5034610284578060031936011261028457602060405161ffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5034610284576101e0366003190112610284576004356001600160401b03811161080957610bc0903690600401612c05565b6024356001600160e01b031981169003611307576044356001600160401b03811161130357610bf3903690600401612c05565b906064356001600160401b03811161060c57610c13903690600401612c05565b94909360a4356001600160a01b03811690036112ff5760c4356001600160e01b0319811690036112ff5760e4356001600160a01b03811690036112ff57610124356001600160a01b03811690036112ff576101a4356001600160401b0381116112fb57610c84903690600401612c05565b92909461010435158015809181926112e7575b81156112c5575b506112995761010435610164351161128757604051637af806df60e01b815260208180610cdd8d8d8c60c4359260a435928b6084359360048901613a23565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561127c578b9161124e575b50803b1561122c57610d2c602435615b33565b91156110f05761014435158015906110db575b6110ae578a9160a4356001600160a01b0390811660e4359091161480806110a7575b15610fb95750506001600160a01b0381163b1561080957816040518092636e91340160e11b8252818381610d9c610104353360048401613a75565b03926001600160a01b03165af1801561060157610fa1575b50505b5a96610dc233615bde565b98610dce60c435615b33565b15610f9757610de260843561010435615bbc565b965b610def60c435615b33565b15610f8d57610e0360843561014435615bbc565b935b610e1060c435615b33565b15610f8357610e2460843561016435615bbc565b955b8d610e3260c435615b33565b159050610f7957610e4860843561018435615bbc565b975b6040519d8e9d8e528d6102609081602082015201610e679161439d565b908d8083039060400152610e7a926133db565b9063ffffffff60e01b7f00000000000000000000000000000000000000000000000000000000000000001660608d01528b820360808d0152610ebb926133db565b9089820360a08b0152610ecd926133db565b60843560c08901526001600160a01b0360a435811660e08a01526001600160e01b031960c43581166101008b015260e43582166101208b01526101408a019790975261012435166101608901526101808801919091526101a08701919091526101c08601919091526024359092166101e0850152838203610200850152610f53926133db565b6101c4356102208301528361024083015203600080516020615d8183398151915291a180f35b6101843597610e4a565b6101643595610e26565b6101443593610e05565b6101043596610de4565b610faa90612b32565b610fb5578838610db4565b8880fd5b8061109f575b1561102c57506001600160a01b0381163b15610809578160405180926358c88e0760e01b8252818381610ff9610104353360048401613a75565b03926001600160a01b03165af1801561060157611018575b5050610db7565b61102190612b32565b610fb5578838611011565b9091506001600160a01b0380831660e435909116149081611096575b50156110845789906001600160a01b0381163b15610809578160405180926337f3a8ed60e21b8252818381610ff9610104353360048401613a75565b604051634d5499ab60e01b8152600490fd5b90501538611048565b508015610fbf565b5081610d61565b604051634a24857f60e11b8152610144356004820152610124356001600160a01b03166024820152604490fd5b50610124356001600160a01b03161515610d3f565b851561121a5761014435158015611206575b6110ae578a9160a4356001600160a01b039081166101243590911614806111fe575b1561115e57506001600160a01b0381163b15610809578160405180926358c88e0760e01b8252818381610ff9610144353360048401613a75565b9091506001600160a01b03808316610124359091161490816111f5575b5015611084576001600160a01b0381163b156111f1578960405180926337f3a8ed60e21b82528183816111b5610144353360048401613a75565b03926001600160a01b03165af180156111e6576111d3575b50610db7565b6111df90999199612b32565b97386111cd565b6040513d8c823e3d90fd5b8980fd5b9050153861117b565b508015611124565b50610124356001600160a01b031615611102565b604051633c26f6a960e21b8152600490fd5b604051638c40da6160e01b81526001600160a01b039091166004820152602490fd5b61126f915060203d8111611275575b6112678183612b60565b810190613a04565b38610d19565b503d61125d565b6040513d8d823e3d90fd5b6040516339ddd98760e21b8152600490fd5b604051633d04c3cd60e11b815261010435600482015260e4356001600160a01b03166024820152604490fd5b9050806112d3575b38610c9e565b5060e4356001600160a01b031615156112cd565b60e4356001600160a01b0316159150610c97565b8780fd5b8680fd5b8380fd5b8280fd5b50346102845760a03660031901126102845761132961031a36612c9b565b604051630ecce30160e31b815260209081816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156114a9578491611474575b5061ffff80611385612ede565b16911681101561145c57808452600d825260408420838552825260ff6040852054166006811015611448578015610797576001810361077057508352600d8152604083209183525260408120600460ff19825416179055808080806113e8612e61565b7f0000000000000000000000000000000000000000000000000000000000000000905af1611414612e8b565b5015610747577fad4b9df10beb0c2005ed5ebd8a7ef385e62f3f0975eb5cf4b12770a4e58d75ab604051806105e781612ddf565b634e487b7160e01b85526021600452602485fd5b602490604051906301ee2cc760e41b82526004820152fd5b90508181813d83116114a2575b61148b8183612b60565b810103126113035761149c90612dd0565b38611378565b503d611481565b6040513d86823e3d90fd5b503461028457806003193601126102845760206040517f8cea0bdc76946a856093a5fa1eeae765bb3795b3458ea1a00e6e22d0e1b5ac5b8152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461028457806003193601126102845760206040517f0abea1e3e92cf48dbad75e3c6f731e5ef04a7a2bff451ae7ed39d6eee2bcb0e78152f35b5061158e61157c36612c43565b906115889392936146cf565b836148d6565b1561159f5761159c90614e01565b80f35b60405163f38d406d60e01b81526001600160a01b039091166004820152602490fd5b5034610284578060031936011261028457602061ffff60125416604051908152f35b503461028457806003193601126102845760206040516001600160401b037f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461028457806003193601126102845760206102736132d6565b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346102845760a03660031901126102845760206116a761031a36612c9b565b604051908152f35b503461028457366003190160c081126108095760a0136102845760a4356001600160401b038111610809576116e8903690600401612aae565b6001600160a01b036116f8612e4b565b16331491821592611736575b505061171e5761159c61171961031a36612c9b565b614bc8565b60405163f38d406d60e01b8152336004820152602490fd5b6117419250336148d6565b153880611704565b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461028457806003193601126102845760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b503461028457806003193601126102845760206040516127108152f35b503461028457602036600319011261028457604060209161ffff611808612c32565b168152600883522054604051908152f35b5034610284578060031936011261028457602060405161ffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5061186236612bd3565b604051630ecce30160e31b815260206001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081168284600481845afa9384156107fe578694611c77575b5061ffff938481168752600884526040872054158015611c67575b8015611c34575b611b9c576040516327f843b560e11b81528481600481865afa928315611bf75785918994611c02575b5060405163a2b753c760e01b81529190829060049082905afa918215611bf75786918993611bc2575b509261193e9161193861194495612ff8565b1661447c565b9061448f565b7f0000000000000000000000000000000000000000000000000000000000000000906119e163ffffffff6119da61197b858061449c565b886119d2816119ab7f0000000000000000000000000000000000000000000000000000000000000000809561449c565b167f00000000000000000000000000000000000000000000000000000000000000006132a8565b9116906132c0565b164261448f565b610e0f198201918211611bae571015611b9c577f0000000000000000000000000000000000000000000000000000000000000000803403611b7e575083806012541691161115611b6c57611a34846133fc565b8086526007835260ff6040872054166004811015611b585760028103611a6f576040516330fec77b60e11b8152806107b18860048301613866565b60038103611a9257604051633380868b60e01b8152806107b18860048301613866565b600114611b3d577fe7bf22971bde3dd8a6a3bf8434e8b7a7c7554dad8328f741da1484d67b445c199492611b0c6105e7959360079360405191611ad483612b01565b338352848301906001600160401b039283421683528c526001865260408c2093511660018060a01b031984541617835551169061434e565b5260408520600160ff1982541617905560125490600181831601169061ffff19161760125560405191829182613866565b60405163f73ae5d960e01b8152806107b18760048301613866565b634e487b7160e01b87526021600452602487fd5b604051638acb5f2760e01b8152600490fd5b604490604051906307694a8d60e01b82523460048301526024820152fd5b604051639ceba7c560e01b8152600490fd5b634e487b7160e01b88526011600452602488fd5b86809294508193503d8311611bf0575b611bdc8183612b60565b810103126112fb575190859061193e611926565b503d611bd2565b6040513d8a823e3d90fd5b8281939295503d8311611c2d575b611c1a8183612b60565b810103126112fb575191849060046118fd565b503d611c10565b50600f845284604088205416600a855285611c608160408b205416600b88528260408c2054169061300b565b16146118d4565b50600984526040872054156118cd565b9093508281813d8311611ca7575b611c8f8183612b60565b8101031261060c57611ca090612dd0565b92386118b2565b503d611c85565b503461028457806003193601126102845760206040517f8a2b1cae51f0b9ccbdae5304e10caa93b35407a3d1fcfebf6994bd40987386348152f35b503461028457806003193601126102845760206040517f669026b2b50f0a0b1d5169dea8cb6e3774a80f68a648b0b0b45b722e519a65018152f35b50611d43611d3136612c43565b90611d3d9392936146cf565b83614a1d565b15611d515761159c90614e01565b60405163c2e6f3ad60e01b81526001600160a01b039091166004820152602490fd5b5034610284576040366003190112610284576040602091611d92612c32565b61ffff611d9d612aeb565b91168252601084528282206001600160a01b03909116825283522054604051908152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160e01b0319168152602090f35b50346102845760a0366003190112610284576020611e23612ede565b61ffff60405191168152f35b50346102845760031960603682011261080957600435906001600160401b039081831161130357610280908360040193360301126113075760243581811161130357611e7f903690600401612aae565b9060443583811161060c57611efc92611ef492611ea3611f02933690600401612c05565b611eae9591956144b5565b611eee611eba8a6133fc565b967f19457468657265756d205369676e6564204d6573736167653a0a3332000000008c5287601c52603c8c20923691612b9c565b90613789565b95909561368a565b84614a1d565b1561217f57604051630ecce30160e31b815260209390926001600160a01b03919085856004817f000000000000000000000000000000000000000000000000000000000000000087165afa948515611bf7578895612148575b5061ffff8095168852600e86528260408920911688528552600260ff604089205416611f8681614379565b14610afa578287526007855260ff60408820541660048110156107b55760028103611fc6576040516330fec77b60e11b8152806107b18960048301613866565b60038103611fe957604051633380868b60e01b8152806107b18960048301613866565b801561212d57611ff990846143c2565b82421691838216831015610aa05750506040519261201684612b01565b338452868401918252848952600487528060408a205416612112578489526004875260408920935184546001600160a01b03191691161783555161205c9291169061434e565b7fdf8b7f38babe8032cb674ac9a39e8fe3cf371cf1621a31afb3fc1969d700cc956040518061208b8782613866565b0390a18452600682526040842091600283549360ff60018187160116908160ff19809716179055146120bb578480f35b6007916012549060001981831601169061ffff1916176012555260036040842091825416179055818080807f0000000000000000000000000000000000000000000000000000000000000000815af1610a43612e8b565b604051636e1f8ed360e11b8152806107b18a60048301613866565b604051637448d61760e01b8152806107b18960048301613866565b9094508581813d8311612178575b6121608183612b60565b810103126112fb5761217190612dd0565b9338611f5b565b503d612156565b60405163c2e6f3ad60e01b81526001600160a01b0383166004820152602490fd5b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5034610284578060031936011261028457602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b5061223036612bd3565b600282541461224d576122469060028355613a90565b6001815580f35b60405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606490fd5b5034610284576122c39060ff60406122b16122ac36612bd3565b6133fc565b928381526007602052205416906143c2565b604080516001600160401b039384168152919092166020820152f35b503461028457366003190160e081126108095760a013610284576001600160401b0360a43581811161130757612319903690600401612aae565b9160c4359081116113035761237f92612339612387923690600401612c05565b611eee61234b61031a97939736612c9b565b967f19457468657265756d205369676e6564204d6573736167653a0a333200000000895287601c52603c8920923691612b9c565b92909261368a565b6001600160a01b039283612399612e4b565b16938316938414928315936123d2575b5050506123ba575061159c90614bc8565b6024906040519063c2e6f3ad60e01b82526004820152fd5b6123dc9350614a1d565b153880806123a9565b503461028457806003193601126102845760206040517fa99e73b4e783e525d4e2d46801821de7174f02493f51782438793c12db10bb9e8152f35b50346102845760206116a76122ac36612bd3565b5034610284576124466122ac36612bd3565b8152600760205260ff60408220541660405190600481101561246a57602092508152f35b634e487b7160e01b83526021600452602483fd5b5034610284578060031936011261028457604051630ecce30160e31b815260209182826004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156125325781926124f9575b5060409061ffff8093168152600f8452205416604051908152f35b9091508281813d831161252b575b6125118183612b60565b8101031261080957612524604091612dd0565b91906124de565b503d612507565b50604051903d90823e3d90fd5b50346102845760603660031901126102845760043563ffffffff918282168092036102845761256c612aeb565b90604435906001600160401b0382116102845736602383011215610284575061259f903690602481600401359101612b9c565b6001600160a01b03939092907f0000000000000000000000000000000000000000000000000000000000000000858116330361268557507f0000000000000000000000000000000000000000000000000000000000000000168082036126675750507f0000000000000000000000000000000000000000000000000000000000000000928084169082160361264957612637826154e0565b604051631dee306b60e11b8152602090f35b604051631601661d60e01b8152928392506107b19160048401614383565b60449250604051916371a6259160e01b835260048301526024820152fd5b604051637090e53f60e01b81529081906107b1903360048401614383565b50346102845760a03660031901126102845760ff604060209261ffff6126c7612ede565b168152600d84528181206126dd61031a36612c9b565b825284522054166126f16040518092612ade565bf35b503461028457806003193601126102845760206040517fb35f2687d20e5aa1b3cb05007d7aa08c99d7388a13cfd4940efc0ddf50b58e8c8152f35b5034610284578060031936011261028457602061275063ffffffff4616615b54565b6040516001600160e01b03199091168152f35b50346102845780600319360112610284576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346102845780600319360112610284576020601154604051908152f35b503461028457806003193601126102845760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b50346102845760031960403682011261080957600435906001600160401b039081831161130357610280908360040193360301126113075760243581811161130357612854612863913690600401612aae565b9061285d6144b5565b336148d6565b1561171e57612871826133fc565b604051630ecce30160e31b81526020929091906001600160a01b039084846004817f000000000000000000000000000000000000000000000000000000000000000086165afa938415612a45578794612a0e575b5061ffff8094168752600e8552604087203388528552600260ff6040892054166128ee81614379565b14610afa578287526007855260ff60408820541660048110156107b5576002810361292e576040516330fec77b60e11b8152806107b18960048301613866565b6003810361295157604051633380868b60e01b8152806107b18960048301613866565b801561212d5761296190846143c2565b82421691838216831015610aa05750506040519261297e84612b01565b338452868401918252848952600387528060408a2054166129f3578489526003875260408920935184546001600160a01b0319169116178355516129c49291169061434e565b7f54c2d295a1e57369238447058e1c72e090370c9c0424a4e6f700ff43d182b59d6040518061208b8782613866565b604051636dbf5d5d60e01b8152806107b18a60048301613866565b9093508481813d8311612a3e575b612a268183612b60565b810103126112ff57612a3790612dd0565b92386128c5565b503d612a1c565b6040513d89823e3d90fd5b5034610284578060031936011261028457602061027361317f565b9050346108095781600319360112610809577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b9181601f8401121561076b578235916001600160401b03831161076b576020808501948460051b01011161076b57565b906006821015610ae45752565b602435906001600160a01b038216820361076b57565b604081019081106001600160401b03821117612b1c57604052565b634e487b7160e01b600052604160045260246000fd5b6001600160401b038111612b1c57604052565b60a081019081106001600160401b03821117612b1c57604052565b90601f801991011681019081106001600160401b03821117612b1c57604052565b6001600160401b038111612b1c57601f01601f191660200190565b929192612ba882612b81565b91612bb66040519384612b60565b82948184528183011161076b578281602093846000960137010152565b6003199060208183011261076b57600435916001600160401b03831161076b57826102809203011261076b5760040190565b9181601f8401121561076b578235916001600160401b03831161076b576020838186019501011161076b57565b6004359061ffff8216820361076b57565b90604060031983011261076b576004356001600160a01b038116810361076b5791602435906001600160401b03821161076b57612c8291600401612aae565b9091565b35906001600160e01b03198216820361076b57565b60a090600319011261076b5760405190612cb482612b45565b6004358252816001600160a01b03602435818116810361076b576020830152604435908116810361076b5760408201526064356001600160401b038116810361076b576060820152608435906001600160e01b03198216820361076b5760800152565b60005b838110612d2a5750506000910152565b8181015183820152602001612d1a565b805160018060a01b039182602082015116926040820151166001600160401b03918260608201511690608063ffffffff60e01b9101511691604051956020870195865260408701526060860152608085015260a084015260a0835260c083019083821090821117612b1c5760209281612dbd600094826040528351928391612d17565b8101039060025afa15610b435760005190565b519061ffff8216820361076b57565b600435815260a0810191906001600160a01b036024358181169081900361076b57602083015260443590811680910361076b5760408201526064356001600160401b03811680910361076b5760608201526084359063ffffffff60e01b821680920361076b5760800152565b6024356001600160a01b038116810361076b5790565b6044356001600160a01b038116810361076b5790565b356001600160a01b038116810361076b5790565b3d15612eb6573d90612e9c82612b81565b91612eaa6040519384612b60565b82523d6000602084013e565b606090565b91908203918211612ec857565b634e487b7160e01b600052601160045260246000fd5b6040516327f843b560e11b815260207f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168183600481845afa928315610b4357600093612fc9575b5090806004926040519384809263a2b753c760e01b82525afa908115610b4357600091612f9d575b509050606435906001600160401b03821680920361076b57612f7791612ebb565b908015612f875761ffff91041690565b634e487b7160e01b600052601260045260246000fd5b82813d8311612fc2575b612fb18183612b60565b810103126102845750518038612f56565b503d612fa7565b90928282813d8311612ff1575b612fe08183612b60565b810103126102845750519181612f2e565b503d612fd6565b90600161ffff80931601918211612ec857565b91909161ffff80809416911601918211612ec857565b60009080156130e35780806001146130db576002146130d3576001918261013383101683600b841016176130bf5760058392935b8082116130825750508261ffff04821161306e57500290565b634e487b7160e01b81526011600452602490fd5b90938061ffff0481116130ab578185166130a2575b800293811c90613055565b80930292613097565b634e487b7160e01b83526011600452602483fd5b9291506005900a9161ffff831161306e5750565b509060209150565b505050600190565b5090565b60009080156130e35780806001146130db57600214613177576001918261013383101683600b841016176131615760028392935b8082116131365750508263ffffffff04821161306e57500290565b90938063ffffffff0481116130ab57818516613158575b800293811c9061311b565b8093029261314d565b9291506002900a9163ffffffff831161306e5750565b509060049150565b604051630ecce30160e31b8152602080826004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa918215610b435760009261323c575b50600f61ffff8093169182600052600a81526131fd8460406000205416600b835285604060002054169061300b565b9260005252818060406000205416911603818111612ec857613223826132289216613021565b612ff8565b168015612f875762278d000462ffffff1690565b90918282813d831161326c575b6132538183612b60565b81010312610284575061326590612dd0565b90386131ce565b503d613249565b90620697806001600160401b0380931601918211612ec857565b9190916001600160401b0380809416911601918211612ec857565b91909163ffffffff80809416911601918211612ec857565b63ffffffff9182169082160391908211612ec857565b61ffff8060125416801561335b576132ed906130e7565b907f0000000000000000000000000000000000000000000000000000000000000000168063ffffffff8093160290828216918203612ec857613352613357927f00000000000000000000000000000000000000000000000000000000000000006132a8565b6132c0565b1690565b505063ffffffff7f00000000000000000000000000000000000000000000000000000000000000001690565b356001600160e01b03198116810361076b5790565b903590601e198136030182121561076b57018035906001600160401b03821161076b5760200191813603831361076b57565b35801515810361076b5790565b908060209392818452848401376000828201840152601f01601f1916010190565b8061014052610140810161340f90613387565b61341d6101c083018361339c565b61018052906134306101e084018461339c565b929061343f6101608601613387565b61344c6101808701613387565b9061345b61020088018861339c565b90919061346c6102208a018a61339c565b9490956101208b0161347d90612e77565b9961348b6101a08d01613387565b9861349a6102408e018e61339c565b9b909d61026081016134ab906133ce565b610160526040519081610120523590602001526101405160200135610120516040015263ffffffff60e01b166101205160600152610140516060013561012051608001526101205160a0016102809052610120516102a00161018051613510926133db565b9061012051601f19818403019060c0015261352a926133db565b9263ffffffff60e01b166101205160e0015263ffffffff60e01b1661012051610100015261012051601f1981840301906101200152613568926133db565b9061012051601f1981840301906101400152613583926133db565b926101405160800135610120516101600152600160a01b600190031661012051610180015263ffffffff60e01b16610120516101a001526101405160a00135610120516101c001526101405160c00135610120516101e001526101405160e0013561012051610200015261014051610100013561012051610220015261012051601f1981840301906102400152613619926133db565b61014051604001356101205161026001526101605115156101205161028001526101205180910390601f1982019052610120519061365691612b60565b604051806101205181815160208193019161367092612d17565b810103905a916000916002602094fa15610b435760005190565b6005811015610ae4578061369b5750565b600181036136e35760405162461bcd60e51b815260206004820152601860248201527745434453413a20696e76616c6964207369676e617475726560401b6044820152606490fd5b600281036137305760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606490fd5b60031461373957565b60405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608490fd5b9060418151146000146137b357612c82916020820151906060604084015193015160001a906137bd565b5050600090600290565b9291906fa2a8918ca85bafe22016d0b997e4df60600160ff1b0383116138295791608094939160ff602094604051948552168484015260408301526060820152600093849182805260015afa156125325781516001600160a01b03811615613823579190565b50600190565b50505050600090600390565b9035601e198236030181121561076b5701602081359101916001600160401b03821161076b57813603831361076b57565b6020815281356020820152602082013560408201526040820135606082015260608201356080820152608082013560a082015260a082013560c082015260c082013560e082015261010060e083013581830152610120908301358183015282013560018060a01b03811680910361076b5761399e6139f1836139df6139d66139c36139ba6139a761398461397b6139668d6139366139558b6102a09f61394661392691610140908185015263ffffffff60e01b9586809481938a01612c86565b1661016090818701528801612c86565b1661018090818501528601612c86565b166101a0809201528301612c86565b166101c090818c0152810190613835565b6102809c8d9a6101e09b8c82015201916133db565b968c018c613835565b989096601f1999610200988d8a8d828603019101526133db565b958b018b613835565b6102209691898c840301888d01526133db565b93890189613835565b6102409491878a840301868b01526133db565b91870187613835565b906102609487840301858801526133db565b9301359182151580930361076b57015290565b9081602091031261076b57516001600160a01b038116810361076b5790565b95929093613a42608096999895613a509460a08a5260a08a01916133db565b9187830360208901526133db565b60408501969096526001600160a01b031660608401526001600160e01b031916910152565b6001600160a01b039091168152602081019190915260400190565b6000613a9a6144b5565b613aa3826133fc565b90818152600760205260ff604082205416600481101561433a5760028103613ae0576040516330fec77b60e11b8152806107b18660048301613866565b60038103613b0357604051633380868b60e01b8152806107b18660048301613866565b801561431f57613b1390836143c2565b906001600160401b03808316904216106142f6575050613b8b6020608085613b3f61020082018261339c565b9490613b4f61022084018461339c565b9091613b5e6101208601612e77565b91613b6c6101a08701613387565b93604051998a988998637af806df60e01b8a5201359360048901613a23565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156106015782916142d8575b5060a084013581846001600160e01b0319613be74663ffffffff16615b54565b7f00000000000000000000000000000000000000000000000000000000000000006001600160e01b0319169491168414614046575b613c2c935060e08801359061509c565b613c44613c3d6101e087018761339c565b3691612b9c565b83906002905b602a8210613e935750506001600160a01b03169181613d82575b5050610240840190613c76828661339c565b9050613cbf575b5050507f0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a691613cae613cba92614af9565b60405191829182613866565b0390a1565b803b15613d6a57613ced613cd66101408701613387565b613ce46101c088018861339c565b9290948861339c565b843b156112ff57869492613d47613d359795938793604051998a9889978896632471e25d60e21b885263ffffffff60e01b1660048801526060602488015260648701916133db565b848103600319016044860152916133db565b03925af1613d56575b80613c7d565b613d608291612b32565b6102845780613d50565b6024906040519063b5cf5b8f60e01b82526004820152fd5b6001600160a01b031690813b1561130357604051630922733d60e41b8152848180613db1858860048401613a75565b038183875af18015613e8857613e75575b50600160408701351615613c6457613de5613de06101a08801613387565b615b33565b15613e4657813b1561130357613e15849283926040519485809481936304d2799360e51b83528960048401613a75565b03925af18015613e3b5790839115613c6457613e3090612b32565b610809578138613c64565b6040513d85823e3d90fd5b6024613e556101a08801613387565b60405163240c6b3f60e21b81526001600160e01b03199091166004820152fd5b613e8190949194612b32565b9238613dc2565b6040513d87823e3d90fd5b9091600881901b610100600160a01b0316906001600160a01b03168015908204610100141715613f6857613ec78383615d0b565b5160f890811c906001850180861161403257613ee39085615d0b565b51901c6061918281101580614027575b15613fd757613f0190615d4e565b915b81101580613fcc575b15613f7c57613f1a90615d4e565b905b600481901b6010600160a01b0316906001600160a01b031680159082046010141715611bae57613f569291613f5091615d67565b90615d67565b9160028101809111613f685790613c4a565b634e487b7160e01b86526011600452602486fd5b604181101580613fc1575b15613f9b57613f9590615d35565b90613f1c565b90603082101580613fb6575b15613f1c5790613f9590615d1c565b506039821115613fa7565b506046811115613f87565b506066811115613f0c565b60418110158061401c575b15613ff657613ff090615d35565b91613f03565b91603083101580614011575b15613f035791613ff090615d1c565b506039831115614002565b506046811115613fe2565b506066811115613ef3565b634e487b7160e01b89526011600452602489fd5b5050614053869182615231565b916001600160e01b031961406a6101808401613387565b161415806142b9575b6140805750818482613c1c565b9390828260e08796959601356140959361509c565b9061409f90614af9565b5a926140af6101c086018661339c565b60805260a0526140c36101e086018661339c565b94906140d26101808801613387565b6140e061020089018961339c565b916140ef6102208b018b61339c565b9390946101208c0161410090612e77565b9a61410e6101a08e01613387565b9761411d6102408f018f61339c565b9e9060e0526102600161412f906133ce565b60c05260405180610100525261010051602001610260905261010051610260016080519060a05191614160926133db565b90610100518083039060400152614176926133db565b9163ffffffff60e01b16610100516060015261010051808303906080015261419d926133db565b90610100518083039060a001526141b3926133db565b9460808801356101005160c00152600160a01b60019003166101005160e0015263ffffffff60e01b16610100516101000152600160a01b60019003166101005161012001526101005161014001528061010051610160015280610100516101800152610100840135610100516101a0015280610100516101c00152610100516101e001526101005180820390610200015260e05191614251926133db565b604082013561010051610220015260c051151561010051610240015261010051809103600080516020615d8183398151915291a1604051614293819282613866565b037f0dd9442ca0ceb76d843508ae85c58c2ef3742491a1cc480e4c0d1c96ab9965a691a1565b506001600160e01b03196142d06101808301613387565b161515614073565b6142f0915060203d8111611275576112678183612b60565b38613bc7565b6040516345bbd2a360e11b81526001600160401b03918216600482015291166024820152604490fd5b604051637448d61760e01b8152806107b18660048301613866565b634e487b7160e01b82526021600452602482fd5b805467ffffffffffffffff60a01b191660a09290921b67ffffffffffffffff60a01b16919091179055565b60031115610ae457565b6001600160a01b0391821681529116602082015260400190565b906020916143b681518092818552858086019101612d17565b601f01601f1916010190565b91906004811015610ae4576001036144745760009180835260016020526001600160401b03604084205460a01c16906144056143ff61026561317f565b8361328d565b93818152600660205260ff6040822054161561446e57600360205260408120546001600160a01b0392908316614458575b8152600460205260409020541661444b579190565b9161445590613273565b90565b9490614465604092613273565b95909150614436565b50509190565b600091508190565b81810292918115918404141715612ec857565b91908201809211612ec857565b91909161ffff80809416911602918216918203612ec857565b60408051630ecce30160e31b8152600491906020907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169082818681855afa9081156146c45760009161468f575b5061ffff9081811660005260088452846000205415801561467f575b801561464c575b61463c5784516327f843b560e11b81529284848881845afa9384156145fd5787918691600096614608575b50875163a2b753c760e01b815292839182905afa9485156145fd576000956145ca575b50509161193e916119386145909594612ff8565b610e0f1981019081116145b5574210156145a8575050565b51639ceba7c560e01b8152fd5b601183634e487b7160e01b6000525260246000fd5b8181969293963d83116145f6575b6145e28183612b60565b81010312610284575051928161193861457c565b503d6145d8565b86513d6000823e3d90fd5b809350829196923d8311614635575b6146218183612b60565b810103126102845750848791519438614559565b503d614617565b8451639ceba7c560e01b81528690fd5b50600f845281856000205416600a85528261467881886000205416600b8852828960002054169061300b565b161461452e565b5060098452846000205415614527565b908382813d83116146bd575b6146a58183612b60565b8101031261028457506146b790612dd0565b3861450b565b503d61469b565b84513d6000823e3d90fd5b604080516327f843b560e11b81527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906020908181600481865afa9081156146c457600091614853575b508351630ecce30160e31b8152928284600481845afa93841561480d57600094614818575b508260049186519283809263a2b753c760e01b82525afa92831561480d576000936147da575b505061193e9061ffff61193861478295612ff8565b6147b56001600160401b037f0000000000000000000000000000000000000000000000000000000000000000164261448f565b610e0f198201918211612ec857116147ca5750565b5163061954d360e31b8152600490fd5b8181949293943d8311614806575b6147f28183612b60565b81010312610284575051908061ffff61476d565b503d6147e8565b85513d6000823e3d90fd5b90938382813d831161484c575b61482f8183612b60565b81010312610284575082614844600492612dd0565b949150614747565b503d614825565b908282813d8311614879575b6148698183612b60565b8101031261028457505138614722565b503d61485f565b9092916001600160401b038411612b1c578360051b60405192602080946148a982850182612b60565b809781520191810192831161076b57905b8282106148c75750505050565b813581529083019083016148ba565b604051630ecce30160e31b8152919392916020919082816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610b435760009161497c575b50946149779161ffff6144559697166000526009845260406000205493604051908101916001600160601b03199060601b1682526014815261496c81612b01565b519020933691614880565b6149c2565b908382813d83116149bb575b6149928183612b60565b810103126102845750946149779161ffff6149b06144559798612dd0565b92979650509161492b565b503d614988565b90926000925b8251841015614a14576020808560051b85010151916000838210600014614a0757506000525260406000205b926000198114612ec857600101926149c8565b91604093835252206149f4565b91509291501490565b604051630ecce30160e31b8152919392916020919082816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610b4357600091614ab3575b50946149779161ffff6144559697166000526008845260406000205493604051908101916001600160601b03199060601b1682526014815261496c81612b01565b908382813d8311614af2575b614ac98183612b60565b810103126102845750946149779161ffff614ae76144559798612dd0565b929796505091614a72565b503d614abf565b600080808381948252600760205260408220600260ff19825416179055614b7160405191614b2683612b01565b338352426001600160401b039081166020808601918252928652600590925260408520935184546001600160a01b0319166001600160a01b039182161785559151919391169061434e565b60016020526040822054167f0000000000000000000000000000000000000000000000000000000000000000905af1614ba8612e8b565b50156107475760125461ffff60001981831601169061ffff191617601255565b60408051630ecce30160e31b81526004926001600160a01b039160209190828187817f000000000000000000000000000000000000000000000000000000000000000088165afa801561480d57600090614dcb575b61ffff9150169485600052600d83528460002082600052835260ff8560002054166006811015614db6578015614d9e5760018103614d8157506001600160401b03606435818116810361076b57614c95907f00000000000000000000000000000000000000000000000000000000000000009061328d565b164211614d735760008080807f0000000000000000000000000000000000000000000000000000000000000000815af1614ccd612e8b565b5015614d65575084600052600d825283600020906000528152826000209360ff199460028682541617905580600052600e8252836000209460243593841680940361076b577fd76d6c4c98bee67a568807a2cd2275ce1af7a8ee2a20b2c716119ffa50af4f4f9584600052835284600020908154169055600052601081528260002091600052526000818120555180613cba81612ddf565b8451633204506f60e01b8152fd5b845163aa4e14eb60e01b8152fd5b8551633ee76d3160e11b8152604492909161078e91830190612ade565b8551632bf1274f60e01b8152806107b1818501612ddf565b602182634e487b7160e01b6000525260246000fd5b8382813d8311614dfa575b614de08183612b60565b810103126102845750614df561ffff91612dd0565b614c1d565b503d614dd6565b60408051630ecce30160e31b815290916001600160a01b039160209081816004817f000000000000000000000000000000000000000000000000000000000000000088165afa90811561480d57600091615067575b507f000000000000000000000000000000000000000000000000000000000000000080340361504a575061ffff169081600052600e8152838560002093169283600052815260ff856000205416614eac81614379565b8061502457509160a093917faca691efdfae0f5e89faf9cd63966d8b762215fee3d27e58419a7b75898601a2959360115494614eed63ffffffff4616615b54565b94815196614efa88612b45565b875282870192858452828801903382528260608a01956001600160401b0397884216885260808c019963ffffffff60e01b809c168b52614f398d612d3a565b9180600052600c8652886000208360005286528d896000209051815560026001820191878751169260a0600180911b0319938482541617905501908689511690825416178155614f8c8c8c51168261434e565b8d8d5190825491169060018060e01b031617905580600052600d8652886000208360005286528860002060ff199060018282541617905581600052600e87528960002083600052875260018a600020918254161790556000526010855287600020906000528452866000205560016011540160115585519a518b525116908901525116908601525116606084015251166080820152a1565b8551632219ef3f60e21b815260449161503c81614379565b600482015260006024820152fd5b604490865190630382b90560e01b82523460048301526024820152fd5b908282813d8311615095575b61507d8183612b60565b81010312610284575061508f90612dd0565b38614e56565b503d615073565b90919392600094831561522957855260016020526040808620546001600160a01b03908116923384146151c257610e74860291610e7319878404016140325761189c87029161189b19888404016151ae57899392911690813b1561130357845184818061511e630922733d60e41b9a8b83526127108099049060048401613a75565b038183875af180156151a457908591615190575b5050813b156113035783615156968651978895869485938452043360048401613a75565b03925af19081156151875750615173575b50614455929350612ebb565b61517d8591612b32565b6113035783615167565b513d87823e3d90fd5b61519990612b32565b611303578338615132565b86513d87823e3d90fd5b634e487b7160e01b8a52601160045260248afd5b969291961690813b1561130757846151f2928492838a51809681958294630922733d60e41b845260048401613a75565b03925af195861561521e5750614455949561520f575b5050612ebb565b61521890612b32565b38615208565b51913d9150823e3d90fd5b509093505050565b600092919060a0810135908115908115868180615473575b1561539a5750505060148202908282046014141715615386576127109004916001600160a01b03808216908690823b15610809576040928351630922733d60e41b815283818061529d8b3060048401613a75565b038183865af1801561536857908491615372575b5060206152f67f0000000000000000000000000000000000000000000000000000000000000000938a885194858094819363095ea7b360e01b83528960048401613a75565b03925af1801561536857615331575b501692833b1561080957615156938691838551809781958294631dc1a8e960e11b845260048401613a75565b6020813d8211615360575b8161534960209383612b60565b810103126113035751801515036113075738615305565b3d915061533c565b85513d86823e3d90fd5b61537b90612b32565b6113075782386152b1565b634e487b7160e01b85526011600452602485fd5b91949092506153b061024086989798018661339c565b9050151580615466575b6153f45750505050906153d061026083016133ce565b6153ef576040516357dbdfcd60e01b8152806107b18460048301613866565b905090565b60c09490940135936001600160a01b0316803b1561080957816040518092630922733d60e41b825281838161542d8b3060048401613a75565b03925af1801561060157615452575b50501561544d576144559250612ebb565b505090565b61545e91929550612b32565b92388061543c565b5060c085013515156153ba565b5061548261024084018461339c565b905015615249565b9081606091031261076b5761549e81612dd0565b9160406154ad60208401612dd0565b92015190565b919082604091031261076b5760206154ca83612dd0565b9201516001600160a01b038116810361076b5790565b90818051810191602092838101906040938491031261076b5783850151838601516001600160401b03811161076b5786019082603f8301121561076b57858201519161552b83612b81565b9261553887519485612b60565b8084528784019487828401011161076b5784876155559301612d17565b7f8cea0bdc76946a856093a5fa1eeae765bb3795b3458ea1a00e6e22d0e1b5ac5b8114615999577f0abea1e3e92cf48dbad75e3c6f731e5ef04a7a2bff451ae7ed39d6eee2bcb0e78114615958577fa99e73b4e783e525d4e2d46801821de7174f02493f51782438793c12db10bb9e8114615895577f8a2b1cae51f0b9ccbdae5304e10caa93b35407a3d1fcfebf6994bd409873863481146157d2577fb35f2687d20e5aa1b3cb05007d7aa08c99d7388a13cfd4940efc0ddf50b58e8c811461571a577f669026b2b50f0a0b1d5169dea8cb6e3774a80f68a648b0b0b45b722e519a650114615662575050506107b1905192839263295c2ddb60e21b84526004840152602483019061439d565b615674929550808591510101906154b3565b60018060a01b03169261ffff80921692600091848352600e81528183208684528152600260ff83852054166156a881614379565b146156b6575b505050505050565b7fec87e3fd8458c9d068e8c7a6a16eb984e76983a2e9fd6b2fc0eb666aac74ab6293858452600f82528284209081549060001981831601169061ffff1916179055600e81528183209086845252812060ff19815416905580a33880808080806156ae565b5061572d929550808591510101906154b3565b60018060a01b03169261ffff80921692600091848352600e81528183208684528152600260ff838520541661576181614379565b1461576e57505050505050565b7fb86ed35d90dce9295c134f71798e593a5bae4ad79805a9d176026df017c723c193858452600f82528284209081549060001981831601169061ffff1916179055600e81528183209086845252812060ff19815416905580a33880808080806156ae565b506157e5929550808591510101906154b3565b6001600160a01b0316926157f984836159da565b61ffff80921692600091848352600e8152818320868452815260ff828420541661582281614379565b1561582f57505050505050565b7fb45c6bd54d5903e8dd1ab0bdc81524279dd8094682e012aef8d7a6cc742f94c693858452600f825282842090815490600181831601169061ffff1916179055600e815281832090868452528120600260ff1982541617905580a33880808080806156ae565b506158a8929550808591510101906154b3565b6001600160a01b0316926158bc84836159da565b61ffff80921692600091848352600e8152818320868452815260ff82842054166158e581614379565b156158f257505050505050565b7fa7cc20b5345a6a6981164b4f2ff64c0ee5b801980ff2f35e608cbd65e1059d4e93858452600f825282842090815490600181831601169061ffff1916179055600e815281832090868452528120600260ff1982541617905580a33880808080806156ae565b5084600a95949396508161597093925101019061548a565b61ffff959294919580951660005260088252836000205552600020911661ffff19825416179055565b5084600b9594939650816159b193925101019061548a565b61ffff959294919580951660005260098252836000205552600020911661ffff19825416179055565b61ffff16906000828152602090601082526040918282209460018060a01b038095169586845282528383205480615a15575b50505050505050565b818452600c83528484208185528352848420968285526010845285852090855283528385812055818452600d835284842090845282528383209060ff19916005838254161790558352600e825283832090600187019186835416855283528484209081541690556002860192808080888754167f0000000000000000000000000000000000000000000000000000000000000000905af1615ab4612e8b565b5015615b225783519554865254841690850152549182169083015260a081811c6001600160401b031660608401526001600160e01b031990911660808301527f91bf47878f3965e58e34e6e35b89ab54e88db994a816e8fd6f8c1c0eea5fe5d691a138808080808080615a0c565b8351633204506f60e01b8152600490fd5b615b4263ffffffff4616615b54565b6001600160e01b031990811691161490565b6000615b9f60209260405163ffffffff85820192600160f81b808552604084015216606082015283608082015260808152615b8e81612b45565b604051928392839251928391612d17565b8101039060025afa15610b43576000516001600160e01b03191690565b906012039060128211612ec857604d8211612ec85761445591600a0a9061447c565b604051906001600160a01b0316606082016001600160401b03811183821017612b1c57604052602a8252602082016040368237825115615cf557603090538151600190811015615cf557607860218401536029905b808211615c87575050615c435790565b606460405162461bcd60e51b815260206004820152602060248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152fd5b9091600f81166010811015615ce0576f181899199a1a9b1b9c1cb0b131b232b360811b901a615cb68486615d0b565b5360041c918015615ccb576000190190615c33565b60246000634e487b7160e01b81526011600452fd5b60246000634e487b7160e01b81526032600452fd5b634e487b7160e01b600052603260045260246000fd5b908151811015615cf5570160200190565b6001600160a01b03908116602f190191908211612ec857565b6001600160a01b039081166036190191908211612ec857565b6001600160a01b039081166056190191908211612ec857565b6001600160a01b039182169082160191908211612ec85756fef4faec7e493ced73194f78a54c931da9a2d6c6b9552b223cc9ad2965322789b7a2646970667358221220571ff85ee7c64c791cbfee5e70c3ba0ff8f9b7d6579f8b027514b4b301fa1ff264736f6c63430008130033',
  linkReferences: {},
  deployedLinkReferences: {},
}
