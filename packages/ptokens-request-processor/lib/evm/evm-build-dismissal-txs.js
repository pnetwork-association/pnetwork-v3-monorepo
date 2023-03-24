const ethers = require('ethers')
const { readFile } = require('fs/promises')
const { logger } = require('../get-logger')
const { curry } = require('ramda')
const constants = require('ptokens-constants')
const { utils, constants: ptokensUtilsConstants } = require('ptokens-utils')
const {
  addDismissedReportsToState,
  removeDetectedReportsFromState,
} = require('../state/state-operations.js')
const { STATE_TO_BE_DISMISSED_REQUESTS_KEY } = require('../state/constants')

const makeDismissalContractCall = curry(
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

const sendDismissalTransaction = curry(
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

const maybeBuildDismissalTxsAndPutInState = _state => {
  const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY]
  const chainId = _state[constants.state.STATE_KEY_CHAIN_ID]
  const providerUrl = _state[constants.state.STATE_KEY_PROVIDER_URL]
  const identityGpgFile = _state[constants.state.STATE_KEY_IDENTITY_FILE]
  const blockChainName = utils.flipObjectPropertiesSync(
    ptokensUtilsConstants.metadataChainIds
  )[chainId]

  return invalidRequests.length > 0
    ? logger.info(`Processing dismissals for ${blockChainName}...`) ||
        Promise.all(
          invalidRequests.map(
            sendDismissalTransaction(identityGpgFile, providerUrl, chainId)
          )
        )
          .then(addDismissedReportsToState(_state))
          .then(removeDetectedReportsFromState(_state))
    : logger.info(`No dismissal to process for ${blockChainName}...`) ||
        Promise.resolve(_state)
}

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
