const ethers = require('ethers')
const schemas = require('ptokens-schemas')
const { logger } = require('../get-logger')
const { utils, constants } = require('ptokens-utils')
const { STATE_KEY_DETECTED_DB_REPORTS } = require('../state/constants')

const ABI_PTOKEN_CONTRACT = [
  "function mint(address recipient, uint256 value, bytes memory userData, bytes memory operatorData)",
]

const ABI_VAULT_CONTRACT = [
  "function pegOut(address payable _tokenRecipient, address _tokenAddress, uint256 _tokenAmount, bytes calldata _userData)",
]

const updateEventProposalTransaction = curry((_eventReport, _txReceipt) =>
  new Promise((resolve, reject) => {

  })
)

const mintProposalCall = (_wallet, _providerUrl, _eventReport, _destinationChainId) =>
  new Promise((resolve, _) => {
    const amount = _eventReport[schemas.SCHEMA_AMOUNT_KEY]
    const userData = _eventReport[schemas.SCHEMA_USER_DATA_KEY]
    const tokenAddress = _eventReport[schemas.SCHEMA_TOKEN_ADDRESS_KEY]
    const originTx = _eventReport[schemas.SCHEMA_ORIGINATING_TX_HASH_KEY]
    const tokenRecipient = _eventReport[schemas.SCHEMA_DESTINATION_ADDRESS_KEY]

    const contract = new ethers.Contract(tokenAddress, ABI_PTOKEN_CONTRACT, _wallet)

    return resolve(contract.mint(tokenRecipient, tokenAddress, amount, userData)
      .then(_tx => _tx.wait())
      .then(_tx => logger.info(`Successfully minted ${amount} tokens on ${_tx.transactionHash} for pegIn tx ${originTx}`) || _tx)
  })

const pegOutProposalCall = (_wallet, _providerUrl, _eventReport, _destinationChainId) =>
  new Promise((_, reject) => {
    return reject(new Error('Not implemented!'))
  })

const proposalContractCall = (_identityGpgFile, _providerUrl, _eventReport, _destinationChainId) =>
  utils.readGpgEncryptedFile(_identityGpgFile)
    .then(_privateKey => {
      const provider = new ethers.providers.JsonRpcProvider(_providerUrl)
      const wallet = new ethers.Wallet(_privateKey, provider)
      logger.info(`Signing transactions with address ${wallet.address}`)

      // TODO check wallet balance here

      const eventName = _eventReport[schemas.SCHEMA_EVENT_NAME_KEY]
      switch(eventName) {
        schemas.enums.eventNames.PEGIN:
          return mintProposalCall(wallet, _providerUrl, _eventReport, _destinationChainId)
        schemas.enums.eventNames.REDEEM:
          return pegOutProposalCall(wallet, _providerUrl, _eventReport, _destinationChainId)
        default:
          return Promise.reject(new Error(`${ERROR_INVALID_EVENT_NAME}: ${eventName}`))
      }
    })


const buildProposalTransactionAndUpdateDb = (_dbCollection, _detectedReport) =>
  validation.validateJson()
  new Promise((resolve, reject) => {
    const chainId = _state[schemas.SCHEMA_CHAIN_ID_KEY]
    const providerUrl = _state[schemas.SCHEMA_PROVIDER_URL_KEY]
    const identityGpgFile = _state[schemas.SCHEMA_IDENTITY_GPG_KEY]
    const blockChainName = utils.flipObjectPropertiesSync(
      constants.metadataChainIds
    )[chainId]

    const shortTxHash = `${originTx.slice(10)}...`
    logger.info(`Building proposal for ${event} event detected on ${shortTxHash} coming from ${blockChainName}`)

    return resolve(proposalContractCall(identityGpgFile, providerUrl, _detectedReport, chainId)
      .then(_txReceipt => db.updateReport(_dbCollection, {
        $set: {
          [schemas.SCHEMA_PROPOSAL_TX_HASH_KEY]: _txReceipt.transactionHash,
          [schemas.SCHEMA_PROPOSAL_TS_KEY]: new Date()
        }
      }, { [schemas.SCHEMA_ORIGINATING_TX_HASH_KEY]: originTx})))
  })

const maybeBuildProposalsTxsAndPutInState = _state => {
  const detectedReports = _state[STATE_KEY_DETECTED_DB_REPORTS]

  return Promise.all(detectedReports.map(buildProposalTransactionAndUpdateDb)).then(
    _proposals => assoc(STATE_KEY_PROPOSAL_TXS, _proposals, _state)
  )
}

module.exports = {
  maybeBuildProposalsTxsAndPutInState,
}
