const constants = {
  PNETWORK_NETWORK_IDS: {
    ethereumMainnet: '0x005fe7f9',
    interim: '0xffffffff',
    polygonMainnet: '0x0075dd4c',
    sepolia: '0x953835d9',
    hardhat: '0x244ebbfe',
  },
  BASE_CHALLENGE_PERIOD_DURATION: 1200,
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  TELEPATHY_ROUTER_ADDRESS: '0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a',
  LOCKED_AMOUNT_CHALLENGE_PERIOD: '200000000000000000', // 0.2 just for testing
  K_CHALLENGE_PERIOD: 34,
  MAX_OPERATIONS_IN_QUEUE: 20,
}
module.exports = constants
