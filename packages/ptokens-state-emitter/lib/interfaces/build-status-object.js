const R = require('ramda')
const ethers = require('ethers')
const chains = require('../chains')
const { utils } = require('ptokens-utils')
const { logger } = require('../get-logger')
const pTokensConstants = require('ptokens-constants')

// TODO: find a better way to handle versions
// eslint-disable-next-line node/no-unpublished-require
// const { version: versionListener } = require('../../../ptokens-listener/package.json')
// eslint-disable-next-line node/no-unpublished-require
// const { version: versionProcessor } = require('../../../ptokens-request-processor/package.json')

const versionListener = '1.0.0'
const versionProcessor = '1.0.0'

const { ERROR_UNSUPPORTED_CHAIN } = require('../errors')
const {
  KEY_STATUS_OBJECT,
  KEY_STATUS_SYNC_STATE,
  KEY_STATUS_ACTOR_TYPE,
  KEY_STATUS_SIGNER_ADDRESS,
  KEY_STATUS_SW_VERSIONS,
  KEY_SW_VERSIONS_LISTENER,
  KEY_SW_VERSIONS_PROCESSOR,
  KEY_STATUS_TIMESTAMP,
} = require('../constants')

const SUPPORTED_ACTOR_TYPE = 'guardian'
const maybeGetActorTypeAndAddToStatus = _state =>
  logger.debug(`Status: Adding ${SUPPORTED_ACTOR_TYPE} under '${KEY_STATUS_ACTOR_TYPE}' key`) ||
  Promise.resolve(
    R.assocPath([KEY_STATUS_OBJECT, KEY_STATUS_ACTOR_TYPE], SUPPORTED_ACTOR_TYPE, _state)
  ) // TODO: pick from configuration

const maybeGetSignerAddressAndAddToStatus = _state =>
  utils
    .readIdentityFile(_state[pTokensConstants.config.KEY_IDENTITY_GPG])
    .then(_identity => new ethers.Wallet(_identity))
    .then(
      _wallet =>
        logger.debug(
          `Status - adding ${_wallet.address} under '${KEY_STATUS_SIGNER_ADDRESS}' key`
        ) || R.assocPath([KEY_STATUS_OBJECT, KEY_STATUS_SIGNER_ADDRESS], _wallet.address, _state)
    )

const maybeGetSoftwareVersionsAndAddToStatus = _state =>
  // TODO: find a way to pick software versions (use configurables?)
  logger.debug('Status: Adding software versions...') ||
  Promise.resolve(
    R.assocPath(
      [KEY_STATUS_OBJECT, KEY_STATUS_SW_VERSIONS, KEY_SW_VERSIONS_LISTENER],
      versionListener,
      _state
    )
  ).then(
    R.assocPath(
      [KEY_STATUS_OBJECT, KEY_STATUS_SW_VERSIONS, KEY_SW_VERSIONS_PROCESSOR],
      versionProcessor
    )
  )

const getUTCTimestampAndAddToStatus = _state =>
  logger.debug('Status: Adding timestamp...') ||
  Promise.resolve(
    R.assocPath([KEY_STATUS_OBJECT, KEY_STATUS_TIMESTAMP], Math.floor(Date.now() / 1000), _state)
  )

const maybeGetSyncStateByNetworkId = _supportedChainConfig =>
  logger.debug('Status: Adding sync state...') ||
  new Promise((resolve, reject) => {
    const chainType = _supportedChainConfig[pTokensConstants.config.KEY_CHAIN_TYPE].toLowerCase()
    const getSyncStateImpl = chains[chainType].getSyncState

    return R.isNil(getSyncStateImpl)
      ? reject(new Error(ERROR_UNSUPPORTED_CHAIN))
      : getSyncStateImpl(_supportedChainConfig).then(resolve).catch(reject) // i.e. chains.evm.getSyncState(_supportedChainConfig)
  })

const maybeGetSyncStateAndAddToStatus = _state =>
  new Promise((resolve, reject) => {
    const supportedChains = _state[pTokensConstants.config.KEY_SUPPORTED_CHAINS]
    return Promise.all(supportedChains.map(maybeGetSyncStateByNetworkId))
      .then(R.mergeAll) // from [{ '0x1234': {}}, { '0x4567': {}}] to {'0x1234': {}, '0x4567': {}}
      .then(_syncStates =>
        R.assocPath([KEY_STATUS_OBJECT, KEY_STATUS_SYNC_STATE], _syncStates, _state)
      )
      .then(resolve)
      .catch(reject)
  })

const buildStatusObjectAndAddToState = _state =>
  maybeGetActorTypeAndAddToStatus(_state)
    .then(maybeGetSignerAddressAndAddToStatus)
    .then(maybeGetSoftwareVersionsAndAddToStatus)
    .then(getUTCTimestampAndAddToStatus)
    .then(maybeGetSyncStateAndAddToStatus)

module.exports = {
  buildStatusObjectAndAddToState,
}
