const constants = {
  PNETWORK_NETWORK_IDS: {
    ethereumMainnet: '0x005fe7f9',
    interim: '0xffffffff',
    polygonMainnet: '0x0075dd4c',
    sepolia: '0xe15503e4',
    mumbai: '0xadc11660',
  },
  QUEUE_TIME: 0,
  CHALLENGE_TIME: 120,
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  EPOCH_DURATION: 60 * 60 * 24 * 30, // 1 month
}
module.exports = constants
