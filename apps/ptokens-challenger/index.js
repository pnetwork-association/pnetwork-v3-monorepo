import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const TOPIC = 'topic'

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0'],
    },
    transports: [tcp()],
    streamMuxers: [yamux(), mplex()],
    connectionEncryption: [noise()],
    services: {
      pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    },
  })

  return node
}

const onMessage = async _message => {
  try {
    console.log(`✓ node received: ${uint8ArrayToString(_message.detail.data)}. Processing ...`)

    const client = createWalletClient({
      account: privateKeyToAccount(process.env.PK),
      chain: mainnet,
      transport: http(),
    }).extend(publicActions)
    console.log(client)
  } catch (_err) {
    console.error(_err)
  }
}

;(async () => {
  const node = await createNode()
  node.services.pubsub.addEventListener('message', onMessage)
  await node.services.pubsub.subscribe(TOPIC)
  console.log(`✓ Subscribed to ${TOPIC} ...`)
})()
