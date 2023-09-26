import { configDotenv } from 'dotenv'
import { arbitrum, gnosis, mainnet, polygon, goerli, bsc } from 'viem/chains'

import { getNetworkIdByChain } from '../utils/network.js'

configDotenv()

export default {
  addresses: {
    [getNetworkIdByChain(polygon)]: {
      epochsManager: '0x091F2008CCa89114ccbeF2dEa1F3e677B68dF69A',
      governanceMessageEmitter: '0x594E3ee2f0D3704D0dE8551516b1f4963E8dEC17',
      pNetworkHub: '0xD2BAC275ffFdbDD23Ecea72f4B161b3aF90300A3',
      registrationManager: '0x4b9793A73B30f2687bC1aBEad2ADDcaB94af604F',
    },
    [getNetworkIdByChain(goerli)]: {
      epochsManager: '0xAc8C50d68480838da599781738d83cfBe1Bd43c0',
      pNetworkHub: '0x7D146012c024D13435f39d240b9f7e7EC2d3cF3E',
    },
    [getNetworkIdByChain(mainnet)]: {
      governanceMessageVerifier: '0x4e3667BA7cF716AE6ecf0f6e858d689BbFbC1C50',
      pNetworkHub: '',
    },
    [getNetworkIdByChain(gnosis)]: {
      pNetworkHub: '',
    },
    [getNetworkIdByChain(arbitrum)]: {
      pNetworkHub: '',
    },
    [getNetworkIdByChain(bsc)]: {
      pNetworkHub: '0x02878021ba5472F7F1e2bfb223ee6cf4b1eadA07',
    },
  },
  chains: [arbitrum, mainnet, gnosis, polygon, goerli, bsc],
  challengeDuration: 600,
  db: {
    name: 'challengerDB',
    uri: process.env.MONGODB_URI,
  },
  ipfsPubSubTopic: 'pnetwork-v3',
  lockAmountsStartChallenge: {
    [getNetworkIdByChain(mainnet)]: 200n,
    [getNetworkIdByChain(goerli)]: 200n,
    [getNetworkIdByChain(gnosis)]: 200n,
    [getNetworkIdByChain(polygon)]: 200n,
    [getNetworkIdByChain(arbitrum)]: 200n,
    [getNetworkIdByChain(bsc)]: 200n,
  },
  rpcUrls: {
    [getNetworkIdByChain(polygon)]: process.env.POLYGON_RPC,
    [getNetworkIdByChain(arbitrum)]: process.env.ARBITRUM_RPC,
    [getNetworkIdByChain(goerli)]: process.env.GOERLI_RPC,
    [getNetworkIdByChain(mainnet)]: process.env.MAINNET_RPC,
    [getNetworkIdByChain(bsc)]: process.env.BSC_RPC,
  },
  // TODO fix it
  startChallengeThresholdBlocks: {
    [getNetworkIdByChain(mainnet)]: 80,
    [getNetworkIdByChain(goerli)]: 80,
    [getNetworkIdByChain(gnosis)]: 120,
    [getNetworkIdByChain(polygon)]: 600,
    [getNetworkIdByChain(arbitrum)]: 600,
    [getNetworkIdByChain(bsc)]: 600,
  },
}
