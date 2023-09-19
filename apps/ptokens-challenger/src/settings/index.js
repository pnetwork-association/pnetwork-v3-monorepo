import { configDotenv } from 'dotenv'
configDotenv()
import { gnosis, mainnet, polygon, goerli } from 'viem/chains'

import { getNetworkIdByChain } from '../lib/network.js'

export default {
  chains: [mainnet, gnosis, polygon],
  startChallengeThresholdBlocks: {
    [getNetworkIdByChain(mainnet)]: 80,
    [getNetworkIdByChain(goerli)]: 80,
    [getNetworkIdByChain(gnosis)]: 120,
    [getNetworkIdByChain(polygon)]: 600,
  },
  addresses: {
    [getNetworkIdByChain(polygon)]: {
      pNetworkHub: '0x9981C50939fbEdB88bafe80d2A2375F50a5c4345',
      governanceMessageEmitter: '0x594e3ee2f0d3704d0de8551516b1f4963e8dec17',
      epochsManager: '0x091F2008CCa89114ccbeF2dEa1F3e677B68dF69A',
      registrationManager: '0x4b9793A73B30f2687bC1aBEad2ADDcaB94af604F',
    },
    [getNetworkIdByChain(goerli)]: {
      pNetworkHub: '',
    },
    [getNetworkIdByChain(mainnet)]: {
      governanceMessageVerifier: '',
    },
  },
  rpcUrls: {
    [getNetworkIdByChain(polygon)]: process.env.POLYGON_RPC,
  },
}
