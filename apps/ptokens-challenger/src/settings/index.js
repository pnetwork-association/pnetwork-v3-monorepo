import { configDotenv } from 'dotenv'
import { arbitrum, gnosis, mainnet, polygon, goerli } from 'viem/chains'

import { getNetworkIdByChain } from '../utils/network.js'

configDotenv()

export default {
  addresses: {
    [getNetworkIdByChain(polygon)]: {
      epochsManager: '0x091F2008CCa89114ccbeF2dEa1F3e677B68dF69A',
      governanceMessageEmitter: '0x594e3ee2f0d3704d0de8551516b1f4963e8dec17',
      pNetworkHub: '0x9981C50939fbEdB88bafe80d2A2375F50a5c4345',
      registrationManager: '0x4b9793A73B30f2687bC1aBEad2ADDcaB94af604F',
    },
    [getNetworkIdByChain(goerli)]: {
      pNetworkHub: '',
    },
    [getNetworkIdByChain(mainnet)]: {
      governanceMessageVerifier: '',
      pNetworkHub: '',
    },
    [getNetworkIdByChain(gnosis)]: {
      pNetworkHub: '',
    },
    [getNetworkIdByChain(arbitrum)]: {
      pNetworkHub: '',
    },
  },
  chains: [arbitrum, mainnet, gnosis, polygon],
  challengeDuration: 0,
  db: {
    name: 'challengerDB',
    uri: process.env.MONGODB_URI,
  },
  ipfsPubSubTopic: 'pnetwork-v3',
  rpcUrls: {
    [getNetworkIdByChain(polygon)]: process.env.POLYGON_RPC,
    [getNetworkIdByChain(arbitrum)]: process.env.ARBITRUM_RPC,
  },
  // TODO fix it
  startChallengeThresholdBlocks: {
    [getNetworkIdByChain(mainnet)]: 80,
    [getNetworkIdByChain(goerli)]: 80,
    [getNetworkIdByChain(gnosis)]: 120,
    [getNetworkIdByChain(polygon)]: 600,
    [getNetworkIdByChain(arbitrum)]: 600,
  },
}
