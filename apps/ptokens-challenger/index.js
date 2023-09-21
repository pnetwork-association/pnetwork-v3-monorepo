import { configDotenv } from 'dotenv'
import { polygon } from 'viem/chains'
import { MongoClient } from 'mongodb'
// eslint-disable-next-line node/no-extraneous-import
import utils from 'ptokens-utils'

import ActorsManager from './src/ActorsManager.js'
import ChallengesManager from './src/ChallengesManager.js'
import ClientsManager from './src/ClientsManager.js'
import verifySignature from './src/utils/verify-signature.js'
import settings from './src/settings/index.js'
import { getNetworkIdByChain } from './src/utils/network.js'
import logger from './src/utils/logger.js'

configDotenv()

const { ipfs } = utils
let actorsManager, challengesManager, clientsManager

const onMessage = async _message => {
  try {
    const message = JSON.parse(_message)
    logger.info(`✓ New message: ${JSON.stringify(message)}. Checking signature ...`)

    if (!(await verifySignature(message))) {
      logger.info('✗ Invalid signature. Skipping ...')
      return
    }

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
        actor,
        actorType: message.actorType,
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
    logger,
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

  const subscriber = await ipfs.pubsub.sub(settings.ipfsPubSubTopic)
  subscriber.on('message', onMessage)
  subscriber.on('error', logger.error)
  subscriber.on('close', logger.warn)
})()
