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
    // TODO: remove it
    const actor = message.signerAddress
    const actorType = message.actorType
    /*const actor = '0x74AA490C9728a728f3F767B0dEa060c2be63B508' // message.signerAddress
    const actorType = 'sentinel' // message.actorType
    delete message.syncState
    message.syncState = {}
    message.syncState['0xb9286154'] = {
      latestBlockHash: '0x0118580592b17597763038ecb45cd5c0023e0fc03ddb838858a8c7570b1cc678',
      latestBlockNumber: 9734073,
      latestBlockTimestamp: 1695305760,
    }*/

    const networksNotSynced = await challengesManager.getNetworksNotSyncedBySyncState({
      syncState: message.syncState,
    })
    if (networksNotSynced.length === 0) {
      logger.info(`✗ ${actor} seems to be in sync! Skipping ...`)
      return
    }

    logger.info(`✓ ${actor} seems to be not in sync on ${networksNotSynced}! Checking entity ...`)
    if (
      !(await actorsManager.isActor({
        actor,
        actorType,
      }))
    ) {
      logger.info(`✗ ${actor} is not a valid guardian/sentinel`)
      return
    }

    logger.info(`✓ ${actor} is a valid ${actorType}! Starting the challenge ...`)
    await challengesManager.startChallengesByNetworks({
      actor,
      actorType,
      networks: networksNotSynced,
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
    challengeDuration: settings.challengeDuration,
    clientsManager,
    db,
    lockAmountsStartChallenge: settings.lockAmountsStartChallenge,
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

  // TODO: remove it
  /*onMessage(
    '{"actorType":"guardian","signerAddress":"0xdB30d31Ce9A22f36a44993B1079aD2D201e11788","softwareVersions":{"listener":"1.7.0","processor":"1.6.4"},"timestamp":1695305761,"syncState":{"0xfc8ebb2b":{"latestBlockHash":"0xefec98554be097707cc20bc61e3e7cb53d4a57de84c3c1438df7a10fcabb75e8","latestBlockNumber":133208927,"latestBlockTimestamp":1695305760},"0xd41b1c5b":{"latestBlockHash":"0x0118580592b17597763038ecb45cd5c0023e0fc03ddb838858a8c7570b1cc678","latestBlockNumber":30082794,"latestBlockTimestamp":1695305760}},"signature":"0xb6b4f03c619a1129c68efa965912c0ca3c638b4b70015f6e8052fde044165e5c4e3cef1aaea000175d14816e32cd647e30a5736686aa3a7135e8b026ac6c9fc11c"}'
  )*/
})()
