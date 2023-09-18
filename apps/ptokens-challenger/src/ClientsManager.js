import { configDotenv } from 'dotenv'
configDotenv()
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { getNetworkIdByChain } from './lib/network.js'
import settings from './settings/index.js'

const getClient = ({ chain, privateKey }) =>
  createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain,
    transport: http(),
  }).extend(publicActions)

class ClientsManager {
  constructor({ chains, privateKey }) {
    if (!ClientsManager.instance) {
      this._clients = chains.reduce((_acc, _chain) => {
        _acc[getNetworkIdByChain(_chain)] = getClient({ chain: _chain, privateKey })
        return _acc
      }, {})
      ClientsManager.instance = this
    }
  }

  getClientByChain(_chain) {
    return this._clients[getNetworkIdByChain(_chain)]
  }

  getClientByNetworkId(_networkId) {
    return this._clients[_networkId]
  }
}

const instance = new ClientsManager({
  chains: settings.chains,
  privateKey: process.env.CHALLENGER_PK,
})
Object.freeze(instance)
export default instance
