const R = require('ramda')
const path = require('path')
const constants = require('ptokens-constants')
const {
  getNetworkId,
  getHubAddress,
  getGovernanceMessageEmitterAddress,
} = require('../lib/configuration-manager')
const { maybeSaveConfiguration } = require('./save-configuration')
const { saveStateEmitterConfiguration } = require('./save-state-emitter-config')
const { saveStateReaderConfiguration } = require('./save-state-reader-config')
const { getMongoUrlFromTaskArgs } = require('./get-mongo-url')
const {
  FLAG_SHOW,
  FLAG_SHOW_DESC,
  FLAG_MONGO_LOCALHOST,
  FLAG_MONGO_LOCALHOST_DESC,
} = require('../constants')
const TASK_NAME_APPS_GENERATE_CONFIGURATIONS = 'apps:generate-configs'
const TASK_DESC_APPS_GENERATE_CONFIGURATIONS =
  'Generate Relayer & Guardian configurations from the given network name.'

const PATH_TO_RELAYER_APP = path.join(__dirname, '../../../../apps/ptokens-relayer')
const PATH_TO_GUARDIAN_APP = path.join(__dirname, '../../../../apps/ptokens-guardian')

const addActorsPropagatedEvent = R.curry((_config, _governanceMessageEmitterAddress) => {
  const obj = {
    [constants.config.KEY_CONTRACT]: _governanceMessageEmitterAddress,
    [constants.config.KEY_SIGNATURES]: [constants.evm.events.ACTORS_PROPAGATED_SIGNATURE],
  }

  const events = _config[constants.config.KEY_EVENTS]

  events.push(obj)
  return Promise.resolve(R.assoc(constants.config.KEY_EVENTS, events, _config))
})

const addGovernanceMessageEmitterEvent = R.curry((taskArgs, hre, _networkId, _config) =>
  getGovernanceMessageEmitterAddress(hre).then(addActorsPropagatedEvent(_config))
)

const maybeAddGovernanceMessageEmitterEvents = R.curry((taskArgs, hre, _networkId, _config) =>
  _networkId === constants.networkIds.POLYGON_MAINNET
    ? addGovernanceMessageEmitterEvent(taskArgs, hre, _networkId, _config)
    : Promise.resolve(_config)
)

const generateListenerConfiguration = (taskArgs, hre, _networkId, _events) =>
  Promise.resolve({
    [constants.config.KEY_CHAIN_TYPE]: 'EVM',
    [constants.config.KEY_NETWORK_ID]: _networkId,
    [constants.config.KEY_CHAIN_NAME]: hre.network.name,
    [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
    [constants.config.KEY_EVENTS]: _events.map(_event => ({
      [constants.config.KEY_CONTRACT]: _event.contracts,
      [constants.config.KEY_SIGNATURES]: _event.topics,
    })),
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'pnetwork',
      [constants.config.KEY_TABLE_EVENTS]: 'events',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
    },
  })
    // FIXME: add component name to the args and add the event only
    // in the case of a guardian
    .then(maybeAddGovernanceMessageEmitterEvents(taskArgs, hre, _networkId))

const generateRequestProcessorConfiguration = (taskArgs, hre, _networkId, _contractAddress) =>
  Promise.all([getHubAddress(hre), getNetworkId(hre)]).then(([_hubAddress, _networkId]) => ({
    [constants.config.KEY_CHAIN_TYPE]: 'EVM',
    [constants.config.KEY_CHALLENGE_PERIOD]: 1, // FIXME
    [constants.config.KEY_NETWORK_ID]: _networkId,
    [constants.config.KEY_CHAIN_NAME]: hre.network.name,
    [constants.config.KEY_HUB_ADDRESS]: _contractAddress,
    [constants.config.KEY_IDENTITY_GPG]: '/usr/src/app/private-key',
    [constants.config.KEY_PROVIDER_URL]: hre.network.config.url,
    [constants.config.KEY_DB]: {
      [constants.config.KEY_NAME]: 'pnetwork',
      [constants.config.KEY_TABLE_EVENTS]: 'events',
      [constants.config.KEY_URL]: getMongoUrlFromTaskArgs(taskArgs),
    },
  }))

const saveRelayerListenerConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateListenerConfiguration(taskArgs, hre, _networkId, [
    { contracts: _hubAddress, topics: [constants.evm.events.USER_OPERATION_SIGNATURE] },
  ]).then(
    maybeSaveConfiguration(
      taskArgs,
      'Relayer listener',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.listener.config.json`
    )
  )

const saveRelayerProcessorConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateRequestProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress).then(
    maybeSaveConfiguration(
      taskArgs,
      'Relayer processor',
      `${PATH_TO_RELAYER_APP}/${hre.network.name}.processor.config.json`
    )
  )

const saveGuardianListenerConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  console.info('_hubAddress', _hubAddress) ||
  generateListenerConfiguration(taskArgs, hre, _networkId, [
    {
      contracts: _hubAddress,
      topics: [
        constants.evm.events.USER_OPERATION_SIGNATURE,
        constants.evm.events.OPERATION_QUEUED_SIGNATURE,
        constants.evm.events.CHALLENGE_PENDING_SIGNATURE,
      ],
    },
  ]).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian listener',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.listener.config.json`
    )
  )

const saveGuardianProcessorConfiguration = (taskArgs, hre, _networkId, _hubAddress) =>
  generateRequestProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress).then(
    maybeSaveConfiguration(
      taskArgs,
      'Guardian processor',
      `${PATH_TO_GUARDIAN_APP}/${hre.network.name}.processor.config.json`
    )
  )

const generateConfigurationTask = (taskArgs, hre) =>
  Promise.all([getNetworkId(hre), getHubAddress(hre)]).then(([_networkId, _hubAddress]) =>
    Promise.all([
      saveRelayerListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveRelayerProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianListenerConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveGuardianProcessorConfiguration(taskArgs, hre, _networkId, _hubAddress),
      saveStateEmitterConfiguration(taskArgs, hre),
      saveStateReaderConfiguration(taskArgs, hre),
    ])
  )

task(
  TASK_NAME_APPS_GENERATE_CONFIGURATIONS,
  TASK_DESC_APPS_GENERATE_CONFIGURATIONS,
  generateConfigurationTask
)
  .addFlag(FLAG_SHOW, FLAG_SHOW_DESC)
  .addFlag(FLAG_MONGO_LOCALHOST, FLAG_MONGO_LOCALHOST_DESC)
