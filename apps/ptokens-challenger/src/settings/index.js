import { gnosis, mainnet, polygon } from 'viem/chains'

import { getNetworkIdByChain } from '../lib/network.js'

export default {
  chains: [mainnet, gnosis, polygon],
  startChallengeThresholdBlocks: {
    [getNetworkIdByChain(mainnet)]: 80,
    [getNetworkIdByChain(gnosis)]: 120,
    [getNetworkIdByChain(polygon)]: 600,
  },
  addresses: {
    [getNetworkIdByChain(polygon)]: {
      pNetworkHub: '0x9981C50939fbEdB88bafe80d2A2375F50a5c4345',
    },
  },
}
