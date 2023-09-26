import { ObjectId } from 'mongodb'
import moment from 'moment'
import { encodeFunctionData, decodeAbiParameters } from 'viem'
import { Mutex } from 'async-mutex'

import PNetworkHubABI from './abi/PNetworkHub.json' assert { type: 'json' }
import { getNetworkIdByChain } from './utils/network.js'

class ChallengesManager {
  constructor({
    actorsManager,
    chains,
    challengeDuration,
    clientsManager,
    db,
    lockAmountsStartChallenge,
    logger,
    monitorInactiveActorsInterval,
    monitorInactiveActorsTimeout,
    pNetworkHubAddresses,
    processPendingChallengesInterval,
    startChallengeThresholdBlocks,
    startChallengeThresholdSeconds,
  }) {
    this.actorsManager = actorsManager
    this.pNetworkHubAddresses = pNetworkHubAddresses
    this.startChallengeThresholdBlocks = startChallengeThresholdBlocks
    this.startChallengeThresholdSeconds = startChallengeThresholdSeconds
    this.chains = chains
    this.clientsManager = clientsManager
    this.challengeDuration = challengeDuration
    this.lockAmountsStartChallenge = lockAmountsStartChallenge
    this.logger = logger
    this.monitorInactiveActorsInterval = monitorInactiveActorsInterval
    this.monitorInactiveActorsTimeout = monitorInactiveActorsTimeout
    this.processPendingChallengesInterval = processPendingChallengesInterval

    this.mutex = new Mutex()
    this.challenges = db.collection('challenges')

    this.processPendingChallenges()
    setInterval(() => {
      this.processPendingChallenges()
    }, this.processPendingChallengesInterval)

    setTimeout(() => {
      this.monitorInactiveActors()
      setInterval(() => {
        this.monitorInactiveActors()
      }, this.monitorInactiveActorsInterval)
    }, this.monitorInactiveActorsTimeout)
  }

  async monitorInactiveActors() {
    const release = await this.mutex.acquire()
    try {
      this.logger.info('✓ Checking inactive actors ...')
      const actors = await this.actorsManager.getActorsInCurrentEpoch()
      const networks = this.chains.map(_chain => getNetworkIdByChain(_chain))

      const inactiveActorsNetworks = {}
      for (const actor of actors) {
        inactiveActorsNetworks[actor.address] = []
        for (const network of networks) {
          const obj = await this.actorsManager.getLastMessageTimestampByActorAndNetwork({
            actor: actor.address,
            network,
          })
          if (
            !obj ||
            obj?.timestamp < moment().unix() - this.startChallengeThresholdSeconds[network]
          ) {
            this.logger.info(
              `✓ Detected ${actor.address} to be inactive on ${network}! Challenging ...`
            )
            inactiveActorsNetworks[actor.address].push(network)
          }
        }
      }

      for (const actor of Object.keys(inactiveActorsNetworks)) {
        const { actorType } = actors.find(({ address }) => address === actor)
        await this.startChallengesByNetworks({
          actor,
          actorType,
          networks: inactiveActorsNetworks[actor],
        })
      }
    } catch (_err) {
      this.logger.error(_err)
    } finally {
      release()
    }
  }

  async processPendingChallenges() {
    const release = await this.mutex.acquire()
    try {
      this.logger.info('✓ Checking pending challenges ...')
      const pendingChallenges = await this.challenges
        .find({
          status: 'pending',
          timestamp: { $lt: moment().unix() - this.challengeDuration },
        })
        .toArray()

      if (pendingChallenges.length === 0) {
        this.logger.info('✓ No pending challenges found! Skipping ...')
        return
      }

      const networks = pendingChallenges.map(({ networkId }) => networkId)
      this.logger.info(
        `✓ Found ${pendingChallenges.length} solvable challenge${
          pendingChallenges.length > 1 ? 's' : ''
        } on ${networks}! Starting slashing ...`
      )

      const clients = networks.reduce((_acc, _networkId) => {
        _acc[_networkId] = this.clientsManager.getClientByNetworkId(_networkId)
        return _acc
      }, {})

      this.logger.info('✓ Simulating slashing contract calls ...')
      const requests = (
        await Promise.all(
          pendingChallenges.map(
            _challenge =>
              new Promise(_resolve => {
                const { actor, challenger, networkId, nonce, timestamp } = _challenge
                clients[networkId]
                  .prepareTransactionRequest({
                    to: this.pNetworkHubAddresses[networkId],
                    data: encodeFunctionData({
                      abi: PNetworkHubABI,
                      functionName: 'slashByChallenge',
                      args: [{ nonce, actor, challenger, timestamp, networkId }],
                    }),
                    value: 0,
                  })
                  .then(_request =>
                    _resolve({
                      challenge: _challenge,
                      request: _request,
                      networkId,
                    })
                  )
                  .catch(_err => {
                    // TODO: check if the challenge has been solved
                    this.logger.error(_err)
                    _resolve()
                  })
              })
          )
        )
      ).filter(_request => _request)

      if (requests.length === 0) {
        this.logger.info('No valid slashing requests! Stopping slashing ...')
        return
      }

      const rawTransactions = await Promise.all(
        requests.map(({ request, networkId }, _index) =>
          clients[networkId].signTransaction(request)
        )
      )

      const hashes = await Promise.all(
        rawTransactions.map((_rawTransaction, _index) => {
          const networkId = requests[_index].networkId
          const challenge = requests[_index].challenge

          this.logger.info(
            `✓ Broadcasting slashing transaction on ${networkId} for ${JSON.stringify(
              challenge
            )} ...`
          )
          return clients[networkId].sendRawTransaction({ serializedTransaction: _rawTransaction })
        })
      )

      for (const [index, hash] of hashes.entries()) {
        const networkId = requests[index].networkId
        const challenge = requests[index].challenge

        this.logger.info(`✓ Waiting ${hash} receipt for ${JSON.stringify(challenge)}...`)
        await clients[networkId].waitForTransactionReceipt({ hash })

        this.logger.info(
          `Successfully slashed ${challenge.actor} on ${challenge.networkId} (${hash})!`
        )
        await this.challenges.updateOne(
          { _id: new ObjectId(challenge._id) },
          { $set: { status: 'unsolved' } }
        )
      }
    } catch (_err) {
      this.logger.error(_err)
    } finally {
      release()
    }
  }

  async getNetworksNotSyncedBySyncState({ syncState }) {
    const networkIds = Object.keys(syncState)
    const syncStateLatestBlockNumber = Object.values(syncState).map(
      ({ latestBlockNumber }) => latestBlockNumber
    )

    const fetchedLatestBlockNumbers = await Promise.all(
      networkIds
        .map(_networkId => this.clientsManager.getClientByNetworkId(_networkId))
        .map(_client => _client.getBlockNumber())
    )

    // TODO: improve checks

    return networkIds.filter(
      (_networkId, _index) =>
        Number(fetchedLatestBlockNumbers[_index]) - syncStateLatestBlockNumber[_index] >
        this.startChallengeThresholdBlocks[_networkId]
    )
  }

  async startChallengesByNetworks({ actor, actorType, networks }) {
    this.logger.info('✓ Calculating actor merkle proof ...')
    const proof = await this.actorsManager.getActorsMerkleProofForCurrentEpoch({ actor, actorType })

    const clients = networks.reduce((_acc, _networkId) => {
      _acc[_networkId] = this.clientsManager.getClientByNetworkId(_networkId)
      return _acc
    }, {})

    this.logger.info('✓ Simulating challenge contract calls ...')
    const requests = (
      await Promise.all(
        networks.map(
          _networkId =>
            new Promise(_resolve => {
              clients[_networkId]
                .prepareTransactionRequest({
                  to: this.pNetworkHubAddresses[_networkId],
                  data: encodeFunctionData({
                    abi: PNetworkHubABI,
                    functionName:
                      actorType === 'guardian'
                        ? 'startChallengeGuardian'
                        : 'startChallengeSentinel',
                    args: [actor, proof],
                  }),
                  value: this.lockAmountsStartChallenge[_networkId],
                })
                .then(_request =>
                  _resolve({
                    request: _request,
                    networkId: _networkId,
                  })
                )
                .catch(_err => {
                  this.logger.error(_err)
                  _resolve()
                })
            })
        )
      )
    ).filter(_request => _request)

    if (requests.length === 0) {
      this.logger.info('No valid requests! Stopping challenge ...')
      return
    }

    const rawTransactions = await Promise.all(
      requests.map(({ request, networkId }, _index) => clients[networkId].signTransaction(request))
    )

    const hashes = await Promise.all(
      rawTransactions.map((_rawTransaction, _index) => {
        const networkId = requests[_index].networkId
        this.logger.info(`✓ Broadcasting challenge transaction on ${networkId} ...`)
        return clients[networkId].sendRawTransaction({ serializedTransaction: _rawTransaction })
      })
    )

    for (const [index, hash] of hashes.entries()) {
      const networkId = requests[index].networkId

      this.logger.info(`✓ Waiting challenge receipt (${hash}) on ${networkId} ...`)
      const receipt = await clients[networkId].waitForTransactionReceipt({ hash })

      const challenge = decodeAbiParameters(
        [
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'actor',
            type: 'address',
          },
          {
            name: 'challenger',
            type: 'address',
          },
          {
            name: 'timestamp',
            type: 'uint64',
          },
          {
            name: 'networkId',
            type: 'bytes4',
          },
        ],
        receipt.logs[0].data
      )

      await this.challenges.insertOne({
        status: 'pending',
        nonce: challenge[0],
        actor: challenge[1],
        challenger: challenge[2],
        timestamp: challenge[3],
        networkId: challenge[4],
      })
      this.logger.info(`✓ Successfully challenged ${actor}: ${challenge}`)
    }
  }
}

export default ChallengesManager
