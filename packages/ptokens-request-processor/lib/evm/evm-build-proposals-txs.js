const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { utils, logic, errors } = require('ptokens-utils')
const { ERROR_INVALID_EVENT_NAME } = require('../errors')
const { curry, values, includes, length } = require('ramda')
const {
  addProposalsReportsToState,
  removeDetectedReportsFromState,
} = require('../state/state-operations.js')
const { STATE_DETECTED_DB_REPORTS_KEY } = require('../state/constants')
const {
  checkEventsHaveExpectedDestinationChainId,
} = require('../check-events-have-expected-chain-id')

const ABI_PTOKEN_CONTRACT = [
  'function mint(address recipient, uint256 value, bytes memory userData, bytes memory operatorData)',
]

const ABI_VAULT_CONTRACT = [
  'function pegOut(address payable _tokenRecipient, address _tokenAddress, uint256 _tokenAmount, bytes calldata _userData)',
]

const callContractFunction = (_fxnName, _fxnArgs, _contract) =>
  _contract[_fxnName](..._fxnArgs)

const callContractFunctionAndAwait = curry(
  (_fxnName, _fxnArgs, _contract) =>
    logger.debug(
      `Calling ${_fxnName} in contracts and awaiting for tx receipt...`
    ) ||
    callContractFunction(_fxnName, _fxnArgs, _contract)
      .then(
        _tx =>
          logger.debug(`Function ${_fxnName} called, awaiting...`) ||
          logic.racePromise(5000, _tx.wait, [])
      )
      .then(
        _tx =>
          logger.info(
            `${_fxnName} call mined successfully ${_tx.transactionHash}`
          ) || _tx
      )
)

const makeProposalContractCall = curry(
  (_wallet, _issuanceManager, _redeemManager, _eventReport) =>
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

      return callContractFunctionAndAwait(functionName, args, contract)
        .then(resolve)
        .catch(_err =>
          _err.message.includes(errors.ERROR_TIMEOUT)
            ? logger.error(`Tx for ${originTx} failed:`, _err.message) ||
              resolve()
            : reject(_err)
        )
    })
)

const sendProposals = curry(
  (_eventReports, _issuanceManager, _redeemManager, _wallet) =>
    logger.info(`Sending proposals w/ address ${_wallet.address}`) ||
    Promise.all(
      _eventReports.map(
        makeProposalContractCall(_wallet, _issuanceManager, _redeemManager)
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
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)
    const issuanceManagerAddress =
      _state[schemas.constants.SCHEMA_ISSUANCE_MANAGER_KEY]
    const redeemManagerAddress =
      _state[schemas.constants.SCHEMA_REDEEM_MANAGER_KEY]

    return checkEventsHaveExpectedDestinationChainId(
      destinationChainId,
      detectedEvents
    )
      .then(_ => utils.readGpgEncryptedFile(identityGpgFile))
      .then(_privateKey => new ethers.Wallet(_privateKey, provider))
      .then(
        sendProposals(
          detectedEvents,
          issuanceManagerAddress,
          redeemManagerAddress
        )
      )
      .then(addProposalsReportsToState(_state))
      .then(removeDetectedReportsFromState(_state))
      .then(resolve)
      .catch(reject)
  })

const maybeBuildProposalsTxsAndPutInState = _state =>
  new Promise(resolve => {
    logger.info('Maybe building proposals txs...')
    const detectedEvents = _state[STATE_DETECTED_DB_REPORTS_KEY]
    const detectedEventsNumber = length(detectedEvents)

    return detectedEventsNumber === 0
      ? logger.info('No proposals found...') || resolve(_state)
      : logger.info(
          `Detected ${detectedEventsNumber} proposals to process...`
        ) || resolve(buildProposalsTxsAndPutInState(_state))
  })

module.exports = {
  callContractFunction,
  makeProposalContractCall,
  callContractFunctionAndAwait,
  maybeBuildProposalsTxsAndPutInState,
}
