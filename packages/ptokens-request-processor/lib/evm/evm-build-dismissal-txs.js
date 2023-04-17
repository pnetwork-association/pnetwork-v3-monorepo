const ethers = require('ethers')
const constants = require('ptokens-constants')
const R = require('ramda')
const { readFile } = require('fs/promises')
const { logger } = require('../get-logger')
const {
  constants: ptokensUtilsConstants,
  logic,
  utils,
} = require('ptokens-utils')
const { addDismissedReportsToState } = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS_KEY } = require('../state/constants')

const makeDismissalContractCall = R.curry(
  (_privateKey, _providerUrl, _destinationChainId, _request) =>
    new Promise(resolve => {
      const provider = new ethers.JsonRpcProvider(_providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      logger.info(
        `Signing dismissal transactions with address ${wallet.address}`
      )
      return resolve()
    })
)

const sendDismissalTransaction = R.curry(
  (_identityGpgFile, _providerUrl, _destinationChainId, _request) =>
    // FIXME
    // utils
    //   .readGpgEncryptedFile(_identityGpgFile)
    readFile(_identityGpgFile, { encoding: 'utf8' }).then(_privateKey =>
      makeDismissalContractCall(
        _privateKey,
        _providerUrl,
        _destinationChainId,
        _request
      )
    )
)

const buildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    const blockChainName = utils.flipObjectPropertiesSync(
      constants.metadataChainIds
    )[chainId]
    const chainId = _state[constants.state.STATE_KEY_CHAIN_ID]
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY]
    const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
    const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
    logger.info(`Processing dismissals for ${blockChainName}...`)

    return Promise.all(
      invalidRequests.map((_request, _i) =>
        logic
          .sleepForXMilliseconds(1000 * _i)
          .then(_ =>
            sendDismissalTransaction(identityGpgFile, providerUrl, chainId)
          )
      )
    )
      .then(addDismissedReportsToState(_state))
      .then(resolve)
  })

const maybeBuildDismissalTxsAndPutInState = _state =>
  new Promise(resolve => {
    const chainId = _state[constants.state.STATE_KEY_CHAIN_ID]
    const blockChainName = utils.flipObjectPropertiesSync(
      ptokensUtilsConstants.metadataChainIds
    )[chainId]
    const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY] || []

    return invalidRequests.length > 0
      ? buildDismissalTxsAndPutInState(_state)
      : logger.info(`No dismissal to process for ${blockChainName}...`) ||
          resolve(_state)
  })

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
