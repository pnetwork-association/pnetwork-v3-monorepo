const fs = require('fs')
const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, prop, values, includes, length, toString } = require('ramda')
const {
  addProposalsReportsToState,
  removeDetectedReportsFromState,
} = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')
const { callContractFunctionAndAwait } = require('./evm-call-contract-function')

const ABI_PTOKEN_CONTRACT = [
  'function mint(address recipient, uint256 value, bytes memory userData, bytes memory operatorData)',
]

const ABI_VAULT_CONTRACT = [
  'function pegOut(address payable _tokenRecipient, address _tokenAddress, uint256 _tokenAmount, bytes calldata _userData)',
]

const addProposedTxHashToEvent = curry((_event, _proposedTxHash) => {
  // TODO: replace _id field
  logger.trace(`Adding ${_proposedTxHash} to ${_event._id.slice(0, 20)}...`)
  const proposedTimestamp = new Date().toISOString()
  _event[schemas.constants.SCHEMA_PROPOSAL_TS_KEY] = proposedTimestamp
  _event[schemas.constants.SCHEMA_PROPOSAL_TX_HASH_KEY] = _proposedTxHash
  _event[schemas.constants.SCHEMA_STATUS_KEY] =
    schemas.db.enums.txStatus.PROPOSED

  return Promise.resolve(_event)
})

const makeProposalContractCall = curry(
  (_wallet, _issuanceManager, _redeemManager, _txTimeout, _eventReport) =>
    new Promise((resolve, reject) => {
      const amount = _eventReport[schemas.constants.SCHEMA_AMOUNT_KEY]
      const userData = _eventReport[schemas.constants.SCHEMA_USER_DATA_KEY]
      const eventName = _eventReport[schemas.constants.SCHEMA_EVENT_NAME_KEY]
      const tokenAddress =
        _eventReport[schemas.constants.SCHEMA_TOKEN_ADDRESS_KEY]
      const originTx =
        _eventReport[schemas.constants.SCHEMA_ORIGINATING_TX_HASH_KEY]
      const tokenRecipient =
        _eventReport[schemas.constants.SCHEMA_DESTINATION_ADDRESS_KEY]

      if (!includes(eventName, values(schemas.db.enums.eventNames))) {
        return reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }

      const abi =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? ABI_PTOKEN_CONTRACT
          : ABI_VAULT_CONTRACT

      const args =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? [tokenRecipient, amount, userData, ''] // FIXME: operatorData???
          : [tokenRecipient, tokenAddress, amount, userData]

      const contractAddress =
        eventName === schemas.db.enums.eventNames.PEGIN
          ? _issuanceManager
          : _redeemManager

      const functionName =
        eventName === schemas.db.enums.eventNames.PEGIN ? 'mint' : 'pegOut'

      const contract = new ethers.Contract(contractAddress, abi, _wallet)

      logger.info(`Processing proposal ${eventName}:`)
      logger.info(`  eventName: ${eventName}`)
      logger.info(`  originTx: ${originTx}`)
      logger.info(`  userData: ${userData}`)
      logger.info(`  amount: ${amount}`)
      logger.info(`  tokenAddress: ${tokenAddress}`)
      logger.info(`  tokenRecipient: ${tokenRecipient}`)

      return callContractFunctionAndAwait(
        functionName,
        args,
        contract,
        _txTimeout
      )
        .then(prop('transactionHash'))
        .then(addProposedTxHashToEvent(_eventReport))
        .then(resolve)
        .catch(_err =>
          _err.message.includes(errors.ERROR_TIMEOUT)
            ? logger.error(`Tx for ${originTx} failed:`, _err.message) ||
              resolve()
            : reject(_err)
        )
    })
)

const sendProposalTransactions = curry(
  (_eventReports, _issuanceManager, _redeemManager, _timeOut, _wallet) =>
    logger.info(`Sending proposals w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map(
        makeProposalContractCall(
          _wallet,
          _issuanceManager,
          _redeemManager,
          _timeOut
        )
      )
    )
)

const buildProposalsTxsAndPutInState = _state =>
  new Promise((resolve, reject) => {
    logger.info('Building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const destinationChainId = _state[schemas.constants.SCHEMA_CHAIN_ID_KEY]
    const providerUrl = _state[schemas.constants.SCHEMA_PROVIDER_URL_KEY]
    const identityGpgFile = _state[schemas.constants.SCHEMA_IDENTITY_GPG_KEY]
    const issuanceManagerAddress =
      _state[schemas.constants.SCHEMA_ISSUANCE_MANAGER_KEY]
    const redeemManagerAddress =
      _state[schemas.constants.SCHEMA_REDEEM_MANAGER_KEY]
    const txTimeout = _state[schemas.constants.SCHEMA_TX_TIMEOUT]
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)

    return (
      checkEventsHaveExpectedDestinationChainId(
        destinationChainId,
        detectedEvents
      )
        // FIXME: use gpg decrypt
        // .then(_ => utils.readGpgEncryptedFile(identityGpgFile))
        .then(_ => fs.readFileSync(identityGpgFile))
        .then(toString)
        .then(_privateKey => new ethers.Wallet(_privateKey, provider))
        .then(
          sendProposalTransactions(
            detectedEvents,
            issuanceManagerAddress,
            redeemManagerAddress,
            txTimeout
          )
        )
        .then(addProposalsReportsToState(_state))
        .then(removeDetectedReportsFromState(_state))
        .then(resolve)
        .catch(reject)
    )
  })

const maybeBuildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const detectedEventsNumber = length(detectedEvents)

    return detectedEventsNumber === 0
      ? logger.info('No detected events found...') || resolve(_state)
      : logger.info(`Detected ${detectedEventsNumber} events to process...`) ||
          resolve(buildProposalsTxsAndPutInState(_state))
  })

module.exports = {
  makeProposalContractCall,
  buildProposalsTxsAndPutInState,
  maybeBuildProposalsTxsAndPutInState,
}
