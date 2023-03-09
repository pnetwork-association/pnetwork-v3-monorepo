const ethers = require('ethers')
const { constants: schemasConstants } = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { curry } = require('ramda')
const { utils, constants } = require('ptokens-utils')
const {
  addDismissalReportsToState,
  removeDetectedReportsFromState,
} = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')

const makeDismissalContractCall = curry(
  (_privateKey, _providerUrl, _destinationChainId, _eventReport) =>
    new Promise(resolve => {
      const provider = new ethers.providers.JsonRpcProvider(_providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      logger.info(
        `Signing dismissal transactions with address ${wallet.address}`
      )
      return resolve()
    })
)

const sendDismissalTransaction = curry(
  (_identityGpgFile, _providerUrl, _destinationChainId, _eventReport) =>
    utils
      .readGpgEncryptedFile(_identityGpgFile)
      .then(_privateKey =>
        makeDismissalContractCall(
          _privateKey,
          _providerUrl,
          _destinationChainId,
          _eventReport
        )
      )
)

const maybeBuildDismissalTxsAndPutInState = _state => {
  const detectedReports = _state[STATE_DETECTED_DB_REPORTS_KEY]
  const chainId = _state[schemasConstants.SCHEMA_CHAIN_ID_KEY]
  const providerUrl = _state[schemasConstants.SCHEMA_PROVIDER_URL_KEY]
  const identityGpgFile = _state[schemasConstants.SCHEMA_IDENTITY_GPG_KEY]
  const blockChainName = utils.flipObjectPropertiesSync(
    constants.metadataChainIds
  )[chainId]

  logger.info(`Processing dismissals for ${blockChainName}...`)

  return Promise.all(
    detectedReports.map(
      sendDismissalTransaction(identityGpgFile, providerUrl, chainId)
    )
  )
    .then(addDismissalReportsToState(_state))
    .then(removeDetectedReportsFromState(_state))
}

module.exports = {
  maybeBuildDismissalTxsAndPutInState,
}
