const { types } = require('hardhat/config')
const R = require('ramda')

const { getContractAddress } = require('../deploy/deploy-contract.task')
const {
  KEY_GOVERNANCE_MESSAGE_EMITTER,
  KEY_ASSET_NAME,
  PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
  PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
  PARAM_NAME_NETWORKS,
  PARAM_DESC_NETWORKS,
  PARAM_NAME_TX_HASH,
  PARAM_DESC_TX_HASH,
  CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER,
  CONTRACT_NAME_PNETWORKHUB,
} = require('../constants')

const TASK_NAME_HANDLE_TELEPATHY = 'gm-relayer:handle-telepathy'
const TASK_DESC_HANDLE_TELEPATHY = 'Call handleTelepathy (tests only)'

const GOVERNANCE_MESSAGE_TOPIC =
  '0x85aab78efe4e39fd3b313a465f645990e6a1b923f5f5b979957c176e632c5a07'

const callHandleTelepathy = async (_signer, _hubAddress, _data, _gasPrice) => {
  const hubFactory = await ethers.getContractFactory(CONTRACT_NAME_PNETWORKHUB, _signer)
  const hub = await hubFactory.attach(_hubAddress)
  const options = _gasPrice === 'auto' ? {} : { gasPrice: _gasPrice }
  const tx = await hub.handleTelepathy(1, _signer.address, _data, options)
  return tx.hash
}

const decodeGovernanceMessage = _message =>
  new ethers.utils.AbiCoder().decode(['uint256', 'uint32[]', 'address[]', 'bytes'], _message)

const getNetworkByChainId = (_chainId, _networks) =>
  _networks.find(({ chainId }) => chainId === _chainId)

const relayDataToHub = R.curry(async (_hub, _data, _network) => {
  const provider = ethers.getDefaultProvider(_network.url)
  const signer = new ethers.Wallet(_network.accounts[0], provider)
  try {
    console.info(`[${_network[KEY_ASSET_NAME]}] Calling handleTelepathy @ ${_hub}`)
    const txHash = await callHandleTelepathy(signer, _hub, _data, _network.gasPrice)
    console.info(`[${_network[KEY_ASSET_NAME]}] Tx mined ${txHash}`)
    return txHash
  } catch (_err) {
    console.info(`[${_network[KEY_ASSET_NAME]}] Failed to broadcast tx: ${_err.message}`)
    throw _err
  }
})

const processEvent = (_log, _networks) => {
  const [, chainIds, hubs, data] = decodeGovernanceMessage(_log.args.data)
  return Promise.allSettled(
    chainIds.map((_chainId, _i) =>
      Promise.resolve(getNetworkByChainId(_chainId, _networks)).then(relayDataToHub(hubs[_i], data))
    )
  )
}

const getNetworksWithIds = (_hre, _filter = null) =>
  Promise.resolve(Object.entries(_hre.config.networks))
    .then(R.map(([_key, _val]) => R.assoc(KEY_ASSET_NAME, _key, _val)))
    .then(R.filter(_network => _network.chainId && _network.accounts))
    .then(_networks =>
      _filter
        ? R.filter(_network => _filter.includes(_network[KEY_ASSET_NAME]), _networks)
        : _networks
    )

const main = async (_args, _hre) => {
  const networksFilter = _args[PARAM_NAME_NETWORKS] ? _args[PARAM_NAME_NETWORKS].split(',') : null
  const networks = await getNetworksWithIds(_hre, networksFilter)
  // switch to interim chain polygon
  await _hre.changeNetwork('polygon')
  const governanceMessageEmitterAddress =
    _args[PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER] ||
    (await getContractAddress(_hre, KEY_GOVERNANCE_MESSAGE_EMITTER))
  const governanceMessageEmitter = await ethers.getContractAt(
    CONTRACT_NAME_GOVERNANCE_MESSAGE_EMITTER,
    governanceMessageEmitterAddress
  )
  if (_args[PARAM_NAME_TX_HASH]) {
    const receipt = await ethers.provider.getTransactionReceipt(_args[PARAM_NAME_TX_HASH])
    if (!receipt) throw new Error('Missing receipt for transaction')
    const relevantLog = receipt.logs.find(_log => _log.topics.includes(GOVERNANCE_MESSAGE_TOPIC))
    if (!relevantLog) throw new Error('No GovernanceMessage event in the transaction')
    const governanceMessageLog = governanceMessageEmitter.interface.parseLog(relevantLog)
    console.info('Processing GovernanceMessage event in transaction')
    await processEvent(governanceMessageLog, networks)
  } else {
    const filter = governanceMessageEmitter.filters.GovernanceMessage()
    governanceMessageEmitter.on(filter, (_, _log) => processEvent(_log, networks))
    console.info(`Listening to GovernanceMessage events @ ${governanceMessageEmitterAddress}`)
    for (;;) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

const mainWrapper = (_args, _hre) =>
  main(_args, _hre)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })

task(TASK_NAME_HANDLE_TELEPATHY, TASK_DESC_HANDLE_TELEPATHY, mainWrapper)
  .addOptionalParam(
    PARAM_NAME_GOVERNANCE_MESSAGE_EMITTER,
    PARAM_DESC_GOVERNANCE_MESSAGE_EMITTER,
    undefined,
    types.string
  )
  .addOptionalParam(PARAM_NAME_TX_HASH, PARAM_DESC_TX_HASH, undefined, types.string)
  .addOptionalParam(PARAM_NAME_NETWORKS, PARAM_DESC_NETWORKS, undefined, types.string)
