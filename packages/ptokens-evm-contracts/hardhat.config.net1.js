require('@nomiclabs/hardhat-ethers')

module.exports = {
 solidity: {
    version: '0.8.17',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
        },
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1,
    },
  },
};
