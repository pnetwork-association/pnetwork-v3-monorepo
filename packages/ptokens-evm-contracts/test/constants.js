const constants = {
  ACTORS: {
    Governance: 0,
    Guardian: 1,
    Sentinel: 2,
  },
  BASE_CHALLENGE_PERIOD_DURATION: 1200, // 0.2 just for testing
  CHALLENGE_DURATION: 1200,
  CHALLENGE_STATUS: {
    Cancelled: 5,
    Null: 0,
    PartiallyUnsolved: 4,
    Pending: 1,
    Solved: 2,
    Unsolved: 3,
  },
  K_CHALLENGE_PERIOD: 34,
  LOCKED_AMOUNT_CHALLENGE_PERIOD: '200000000000000000',
  // 0.2 just for testing
  LOCKED_AMOUNT_START_CHALLENGE: '200000000000000000',
  MAX_OPERATIONS_IN_QUEUE: 20,
  OPERATION_STATUS: {
    Cancelled: 3,
    Executed: 2,
    NotQueued: 0,
    Queued: 1,
  },
  PNETWORK_NETWORK_IDS: {
    ethereumMainnet: '0x005fe7f9',
    hardhat: '0x244ebbfe',
    interim: '0xffffffff',
    polygonMainnet: '0x0075dd4c',
    sepolia: '0x953835d9',
  },
  SLASHING_QUANTITY: BigInt(2000 * 1e18), // PNT
  TELEPATHY_ROUTER_ADDRESS: '0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a',
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
}
module.exports = constants
