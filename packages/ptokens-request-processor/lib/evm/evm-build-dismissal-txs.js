const ethers = require('ethers')
const { readFile } = require('fs/promises')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { curry } = require('ramda')
const { utils, constants } = require('ptokens-utils')
const {
  addDismissalReportsToState,
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
  (_identityGpgFile, _providerUrl, _destinationChainId, _requests) =>
    // FIXME
    // utils
    //   .readGpgEncryptedFile(_identityGpgFile)
    readFile(_identityGpgFile, { encoding: 'utf8' }).then(_privateKey =>
      makeDismissalContractCall(
        _privateKey,
        _providerUrl,
        _destinationChainId,
        _requests
      )
    )
)

const maybeBuildDismissalTxsAndPutInState = _state => {
  const invalidRequests = _state[STATE_TO_BE_DISMISSED_REQUESTS_KEY]
  const chainId = _state[schemas.constants.SCHEMA_CHAIN_ID_KEY]
  const providerUrl = _state[schemas.constants.SCHEMA_PROVIDER_URL_KEY]
  const identityGpgFile = _state[schemas.constants.SCHEMA_IDENTITY_GPG_KEY]
  const blockChainName = utils.flipObjectPropertiesSync(
    constants.metadataChainIds
  )[chainId]

  logger.info(`Processing dismissals for ${blockChainName}...`)

  return Promise.all(
    invalidRequests.map(
      sendDismissalTransaction(identityGpgFile, providerUrl, chainId)
    )
  )
    .then(addDismissalReportsToState(_state))
    .then(removeDetectedReportsFromState(_state))
}

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
