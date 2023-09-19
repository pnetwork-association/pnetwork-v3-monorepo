import { configDotenv } from 'dotenv'
configDotenv()
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { getNetworkIdByChain } from './lib/network.js'

const getClient = ({ chain, privateKey, rpcUrl }) =>
  createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain,
    transport: http(rpcUrl),
  }).extend(publicActions)

class ClientsManager {
  constructor({ chains, privateKey, rpcUrls }) {
    this._clients = chains.reduce((_acc, _chain) => {
      const networkId = getNetworkIdByChain(_chain)
      const rpcUrl = rpcUrls[networkId]
      _acc[networkId] = getClient({ chain: _chain, privateKey, rpcUrl })
      return _acc
    }, {})
  }

  getClientByChain(_chain) {
    return this._clients[getNetworkIdByChain(_chain)]
  }

  getClientByNetworkId(_networkId) {
    return this._clients[_networkId]
  }
}

export default ClientsManager
