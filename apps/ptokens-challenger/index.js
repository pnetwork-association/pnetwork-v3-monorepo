import { configDotenv } from 'dotenv'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { polygon } from 'viem/chains'
import { MongoClient } from 'mongodb'

// import createNode from './src/create-node.js'
import ActorsManager from './src/ActorsManager.js'
import ChallengesManager from './src/ChallengesManager.js'
import ClientsManager from './src/ClientsManager.js'
// import verifySignature from './src/utils/verify-signature.js'
import settings from './src/settings/index.js'
import { getNetworkIdByChain } from './src/utils/network.js'
import logger from './src/utils/logger.js'

configDotenv()

let actorsManager, challengesManager, clientsManager

const onMessage = async _message => {
  try {
    const message = JSON.parse(uint8ArrayToString(_message.detail.data))
    logger.info(`✓ New message: ${JSON.stringify(message)}. Checking signature ...`)

    /*if (!(await verifySignature(message))) {
      logger.info('✗ Invalid signature. Skipping ...')
      return
    }*/

    logger.info('✓ Valid signature! Checking actor state ...')
    const actor = message.signerAddress
    const networkIdsNotSynced = await challengesManager.getNetworksNotSyncedBySyncState({
      syncState: message.syncState,
    })
    if (networkIdsNotSynced.length === 0) {
      logger.info(`✗ ${actor} seems to be in sync! Skipping ...`)
      return
    }

    logger.info(`✓ ${actor} seems to be not in sync! Checking entity ...`)
    if (
      !(await actorsManager.isActor({
        actor: '0x74aa490c9728a728f3f767b0dea060c2be63b508',
        // actorType: message.actorType,
        actorType: 'sentinel',
      }))
    ) {
      logger.info(`✗ ${actor} is not a valid guardian/sentinel`)
      return
    }

    logger.info(`✓ ${actor} is a valid ${message.actorType}! Starting the challenge ...`)
    await challengesManager.startChallengesByNetworks({
      actor: message.signerAddress,
      actorType: message.actorType,
      networks: networkIdsNotSynced,
    })
  } catch (_err) {
    logger.error(_err)
  }
}

;(async () => {
  logger.info('✓ Connecting to database ...')
  const client = new MongoClient(settings.db.uri)
  const db = client.db(settings.db.name)

  clientsManager = new ClientsManager({
    chains: settings.chains,
    privateKey: process.env.CHALLENGER_PK,
    rpcUrls: settings.rpcUrls,
  })

  actorsManager = new ActorsManager({
    client: clientsManager.getClientByChain(polygon),
    db,
    epochsManagerAddress: settings.addresses[getNetworkIdByChain(polygon)].epochsManager,
    governanceMessageEmitterAddress:
      settings.addresses[getNetworkIdByChain(polygon)].governanceMessageEmitter,
    registrationManagerAddress:
      settings.addresses[getNetworkIdByChain(polygon)].registrationManager,
  })

  challengesManager = new ChallengesManager({
    actorsManager,
    challengerAddress: process.env.CHALLENGER_ADDRESS,
    challengeDuration: settings.challengeDuration,
    clientsManager,
    db,
    logger,
    pNetworkHubAddresses: Object.values(settings.addresses)
      .map(({ pNetworkHub }) => pNetworkHub)
      .reduce((_acc, _address, _index) => {
        _acc[Object.keys(settings.addresses)[_index]] = _address
        return _acc
      }, {}),
    startChallengeThresholdBlocks: settings.startChallengeThresholdBlocks,
  })
  /*const node = await createNode()
          node.services.pubsub.addEventListener('message', onMessage)
          await node.services.pubsub.subscribe(TOPIC)
          logger.info(`✓ Subscribed to ${TOPIC} ...`)*/
  onMessage({
    detail: {
      data: uint8ArrayFromString(
        JSON.stringify({
          softwareVersions: { listener: '1.0.0', processor: '1.0.0' },
          syncState: {
            '0xf9b459a1': {
              latestBlockTimestamp: 1695029854,
              latestBlockNumber: 30031338,
              latestBlockHash: '0x81b4c556ffb342d579cb3feadcdfe2440d62c5f7c6300ed1635bca347dd34f39',
            },
          },
          //signerAddress: '0x89E8cf56bc3B6C492098e46Da2686c9B5D56951f',
          signerAddress: '0x74AA490C9728a728f3F767B0dEa060c2be63B508',
          version: 0,
          //actorType: 'guardian',
          actorType: 'sentinel',
          timestamp: 1695027477,
          signature:
            '0xbdac326866d0078a167ec7fd43bc5bc7c4d3c89da477d05db624b17f1ebe6f90310e0ca4b268f33d59496b6a26b31edb6ecfe6ef6a9a4d2beb3f79415798c0471b',
        })
      ),
    },
  })
})()
