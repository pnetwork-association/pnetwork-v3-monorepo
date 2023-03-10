const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { curry } = require('ramda')
const { utils, constants, logic, errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const {
  addProposalsReportsToState,
  removeDetectedReportsFromState,
} = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')

const ABI_PTOKEN_CONTRACT = [
  'function mint(address recipient, uint256 value, bytes memory userData, bytes memory operatorData)',
]

// const ABI_VAULT_CONTRACT = [
//   'function pegOut(address payable _tokenRecipient, address _tokenAddress, uint256 _tokenAmount, bytes calldata _userData)',
// ]

// const getUpdateProposalOperation = _txReceipt => ({
//   $set: {
//     [schemas.SCHEMA_STATUS_KEY]: schemas.enums.txStatus.PROPOSED,
//     [schemas.SCHEMA_PROPOSAL_TX_HASH_KEY]: _txReceipt.transactionHash,
//     [schemas.SCHEMA_PROPOSAL_TS_KEY]: new Date(),
//   },
// })

// const getUpdateProposalQuery = _originatingTxHash => ({
//   [schemas.SCHEMA_ORIGINATING_TX_HASH_KEY]: originTx,
// })

const mintProposalCall = (
  _wallet,
  _providerUrl,
  _eventReport,
  _destinationChainId
) =>
  new Promise(resolve => {
    const amount = _eventReport[schemas.constants.SCHEMA_AMOUNT_KEY]
    const userData = _eventReport[schemas.constants.SCHEMA_USER_DATA_KEY]
    const tokenAddress =
      _eventReport[schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]
    const originTx =
      _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
    const tokenRecipient =
      _eventReport[schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]

    logger.info(
      `Building proposal for '${event}' event detected on ${originTx.slice(10)}`
    )

    const contract = new ethers.Contract(
      tokenAddress,
      ABI_PTOKEN_CONTRACT,
      _wallet
    )

    return resolve(
      contract
        .mint(tokenRecipient, tokenAddress, amount, userData)
        .then(_tx => logic.racePromise(5000, _tx.wait, []))
        .then(
          _tx =>
            logger.info(
              `Successfully minted ${amount} tokens on ${_tx.transactionHash} for pegIn tx ${originTx}`
            ) || _tx
        )
        .catch(_err =>
          _err.message.includes(errors.ERROR_TIMEOUT)
            ? logger.error(`Tx for ${originTx} failed:`, _err.message)
            : Promise.reject(_err)
        )
      // .then(_txReceipt =>
      //   db.updateReport(
      //     _collection,
      //     getUpdateProposalOperation(_txReceipt),
      //     getUpdateProposalQuery(_originTx)
      //   )
      // )
    )
  })

const pegOutProposalCall = (
  _wallet,
  _providerUrl,
  _eventReport,
  _destinationChainId
) =>
  new Promise((_, reject) => {
    return reject(new Error('Not implemented!'))
  })

const makeProposalContractCall = curry(
  (_privateKey, _providerUrl, _destinationChainId, _eventReport) =>
    new Promise((resolve, reject) => {
      const provider = new ethers.providers.JsonRpcProvider(_providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      logger.info(`Signing transactions with address ${wallet.address}`)

      // TODO check wallet balance here

      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]
      switch (eventName) {
        case schemas.db.enums.eventNames.PEGIN:
          return resolve(
            mintProposalCall(
              wallet,
              _providerUrl,
              _eventReport,
              _destinationChainId
            )
          )
        case schemas.db.enums.eventNames.REDEEM:
          return resolve(
            pegOutProposalCall(
              wallet,
              _providerUrl,
              _eventReport,
              _destinationChainId
            )
          )
        default:
          return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }
    })
)

const sendProposalTransaction = curry(
  (_identityGpgFile, _providerUrl, _destinationChainId, _eventReport) =>
    utils
      .readGpgEncryptedFile(_identityGpgFile)
      .then(_privateKey =>
        makeProposalContractCall(
          _privateKey,
          _providerUrl,
          _destinationChainId,
          _eventReport
        )
      )
)

const maybeBuildProposalsTxsAndPutInState = _state => {
  const detectedReports = _state[STATE_DETECTED_DB_REPORTS_KEY]
  const chainId = _state[schemas.constants.SCHEMA_CHAIN_ID_KEY]
  const providerUrl = _state[schemas.constants.SCHEMA_PROVIDER_URL_KEY]
  const identityGpgFile = _state[schemas.constants.SCHEMA_IDENTITY_GPG_KEY]
  const blockChainName = utils.flipObjectPropertiesSync(
    constants.metadataChainIds
  )[chainId]

  logger.info(`Processing proposals for ${blockChainName}...`)

  return Promise.all(
    detectedReports.map(
      sendProposalTransaction(identityGpgFile, providerUrl, chainId)
    )
  )
    .then(addProposalsReportsToState(_state))
    .then(removeDetectedReportsFromState(_state))
}

module.exports = {
  maybeBuildProposalsTxsAndPutInState,
}
