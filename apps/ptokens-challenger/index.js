import { configDotenv } from 'dotenv'
configDotenv()
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { polygon } from 'viem/chains'

// import createNode from './src/create-node.js'
import ClientsManager from './src/ClientsManager.js'
import { getNetworksNotInSyncBySyncState } from './src/lib/check-sync.js'
import verifySignature from './src/lib/verify-signature.js'
import { isValidActor } from './src/lib/dao.js'

const onMessage = async _message => {
  try {
    const message = JSON.parse(uint8ArrayToString(_message.detail.data))
    console.log(`✓ New message: ${JSON.stringify(message)}. Checking signature ...`)

    if (!(await verifySignature(message))) {
      console.log('✗ Invalid signature. Skipping ...')
      return
    }

    console.log('✓ Valid signature! Checking actor state ...')
    const actor = message.signerAddress
    const clientInterim = ClientsManager.getClientByChain(polygon)

    const networksNotInSync = await getNetworksNotInSyncBySyncState({
      syncState: message.syncState,
    })
    if (networksNotInSync.length === 0) {
      console.log(`✗ ${actor} seems to be in sync! Skipping ...`)
      return
    }

    console.log(`✓ ${actor} seems to be not in sync! Checking entity ...`)
    if (
      !(await isValidActor({
        actor: '0x74aa490c9728a728f3f767b0dea060c2be63b508',
        // actorType: message.actorType,
        actorType: 'sentinel',
        client: clientInterim,
      }))
    ) {
      console.log(`✗ ${actor} is not a valid guardian/sentinel`)
      return
    }

    console.log(`✓ ${actor} is a valid ${message.actorType}! Starting the challenge ...`)

    // TODO: startChallenge
  } catch (_err) {
    console.error(_err)
  }
}

;(async () => {
  /*const node = await createNode()
          node.services.pubsub.addEventListener('message', onMessage)
          await node.services.pubsub.subscribe(TOPIC)
          console.log(`✓ Subscribed to ${TOPIC} ...`)*/
  onMessage({
    detail: {
      data: uint8ArrayFromString(
        JSON.stringify({
          actorType: 'guardian',
          signerAddress: '0x89E8cf56bc3B6C492098e46Da2686c9B5D56951f',
          softwareVersions: { processor: '1.0.0', listener: '1.0.0' },
          syncState: {
            '0xd41b1c5b': {
              latestBlockHash: '0x81b4c556ffb342d579cb3feadcdfe2440d62c5f7c6300ed1635bca347dd34f39',
              latestBlockNumber: 30031338,
              latestBlockTimestamp: 1695029854,
            },
          },
          timestamp: 1695027477,
          version: 0,
          signature:
            '0xf5909215ae9f7b7f5b6be40f1c1474a96521a9a73d207a1f090b3f7f007ef81407fccc25d8eb5a0a54ddf84061bb766d27f18e0684d9a4ea2d3c8152850bffae1c',
        })
      ),
    },
  })
})()
