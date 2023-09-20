import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp'
import { createLibp2p } from 'libp2p'

const createNode = async () =>
  await createLibp2p({
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

export default createNode
